from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from .models import Task
from .serializers import TaskSerializer
import random
from django.utils import timezone


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Ensure tasks that passed their deadline and remain ongoing are marked as missing
        now = timezone.now()
        Task.objects.filter(user=self.request.user, status=Task.STATUS_ONGOING, deadline__lt=now).update(status=Task.STATUS_MISSING)
        return Task.objects.filter(user=self.request.user).order_by('scheduled_date', 'created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            data = serializer.data
            # include warning if serializer attached one
            if getattr(serializer, '_warning', None):
                data = {**data, 'warning': serializer._warning}
            return Response(data, status=status.HTTP_201_CREATED, headers=headers)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)


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
            # add points to user
            user = request.user
            user.total_points = (user.total_points or 0) + (task.points_value or 0)
            user.save()
            serializer = self.get_serializer(task)
            return Response({'task': serializer.data, 'total_points': user.total_points})
