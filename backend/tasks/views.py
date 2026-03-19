from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F, Q
from .models import Task
from .serializers import TaskSerializer
from .services.prioritization import prioritize_and_save_task
import random
from django.utils import timezone


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Ensure tasks that passed their deadline and remain ongoing are marked as missing
        now = timezone.now()
        Task.objects.filter(
            user=self.request.user,
            status=Task.STATUS_ONGOING,
            deadline__lt=now,
        ).update(status=Task.STATUS_MISSING, prioritized_at=None)

        # Refresh priority for newly created/updated tasks before listing.
        stale_tasks = Task.objects.filter(user=self.request.user).filter(
            Q(prioritized_at__isnull=True) | Q(updated_at__gt=F('prioritized_at'))
        ).order_by('updated_at')[:10]
        for task in stale_tasks:
            prioritize_and_save_task(task)

        return Task.objects.filter(user=self.request.user).order_by('-priority_score', '-priority_confidence', 'created_at')

    def perform_create(self, serializer):
        task = serializer.save(user=self.request.user)
        prioritize_and_save_task(task)
        return task

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            task = self.perform_create(serializer)
            response_serializer = self.get_serializer(task)
            data = response_serializer.data
            headers = self.get_success_headers(data)
            # include warning if serializer attached one
            if getattr(serializer, '_warning', None):
                data = {**data, 'warning': serializer._warning}
            return Response(data, status=status.HTTP_201_CREATED, headers=headers)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        task = serializer.save()
        prioritize_and_save_task(task)


class TaskCompleteView(generics.UpdateAPIView):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def patch(self, request, *args, **kwargs):
        task = self.get_object()
        if task.status == Task.STATUS_DONE:
            return Response({'detail': 'Already completed.'}, status=status.HTTP_200_OK)
        with transaction.atomic():
            task.status = Task.STATUS_DONE
            # assign random points if none set
            if not task.points_value:
                task.points_value = random.randint(5, 20)
            task.save()
            prioritize_and_save_task(task)
            # add points to user
            user = request.user
            user.total_points = (user.total_points or 0) + (task.points_value or 0)
            user.save()
            serializer = self.get_serializer(task)
            return Response({'task': serializer.data, 'total_points': user.total_points})


class TaskReprioritizeView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        tasks = Task.objects.filter(user=request.user).order_by('updated_at')
        reprioritized = 0
        for task in tasks:
            prioritize_and_save_task(task)
            reprioritized += 1
        return Response({'reprioritized': reprioritized}, status=status.HTTP_200_OK)
