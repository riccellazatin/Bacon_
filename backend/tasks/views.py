import re
import json
from xmlrpc import client
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F, Q
from .models import ScheduleBlock, Task
from .serializers import ScheduleBlockSerializer, ScheduleImageUploadSerializer, TaskSerializer
from .services.prioritization import prioritize_and_save_task
import random
from django.utils import timezone
import os
from rest_framework.views import APIView, settings
from google import genai
from google.genai import types
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import datetime


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
        prioritize_and_save_task(task, self.request.user)
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
            prioritize_and_save_task(task, request.user)
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

class BulkCreateTasksView(APIView):
    def post(self, request):
        tasks_data = request.data.get('tasks', [])
        
        for item in tasks_data:
            deadline_val = item.get('deadline')
            
            # Convert string to aware datetime object
            if deadline_val and isinstance(deadline_val, str):
                try:
                    # Match the format Gemini is sending: YYYY-MM-DD HH:MM
                    naive_dt = datetime.strptime(deadline_val, "%Y-%m-%d %H:%M")
                    deadline_val = timezone.make_aware(naive_dt)
                except ValueError:
                    # Fallback if format is slightly different
                    deadline_val = None 

            # Now task.deadline will be a proper datetime object
            task = Task.objects.create(
                user=request.user,
                title=item.get('title'),
                deadline=deadline_val,
                duration_minutes=item.get('duration_minutes', 0),
                description=item.get('description', ''),
                status='ongoing'
            )
            
            # This will no longer crash!
            prioritize_and_save_task(task, request.user)
            
        return Response({"status": "Tasks added and prioritized successfully"})
    
from django.db.models import Q

def get_daily_agenda(user, target_date):
    day_name = target_date.strftime('%A') # e.g., "Monday"
    
    # 1. Get Classes for today
    classes = ScheduleBlock.objects.filter(user=user, day_of_week=day_name)
    
    # 2. Get Tasks suggested for today
    tasks = Task.objects.filter(
        user=user, 
        suggested_start_time__date=target_date
    ).exclude(status='done')
    
    # Combine and sort by time
    # (In a real app, you'd serialize these into a clean list)
    return classes, tasks

class ScheduleUploadView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        serializer = ScheduleImageUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        image_file = serializer.validated_data['image']
        
        # 1. Reset file pointer in case it was read elsewhere
        image_file.seek(0)
        
        # 2. Get API Key safely
        api_key = os.environ.get("GEMINI_API_KEY") or getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key:
            return Response({"error": "Gemini API Key not configured on server."}, status=500)

        try:
            client = genai.Client(api_key=api_key)
            
            prompt = (
                "Analyze this class schedule image. Extract all recurring classes. "
                "Return ONLY a JSON list of objects with these keys: "
                "'subject', 'day_of_week', 'start_time' (HH:MM), 'end_time' (HH:MM). "
                "Ensure day_of_week is one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday."
            )

            # 3. Call Gemini
            response = client.models.generate_content(
                model="gemini-3.1-flash-lite-preview",
                contents=[
                    prompt,
                    types.Part.from_bytes(
                        data=image_file.read(), 
                        mime_type=image_file.content_type
                    )
                ]
            )
            
            # 4. Parse and Clean JSON
            raw_text = response.text
            # Remove markdown code blocks if Gemini includes them
            json_text = re.sub(r'```json\s*|```', '', raw_text).strip()
            extracted_data = json.loads(json_text)

            # 5. Clear existing schedule and save new blocks
            ScheduleBlock.objects.filter(user=request.user).delete()

            created_blocks = []
            for item in extracted_data:
                # Use .get() to avoid KeyErrors if Gemini changes the label name
                block = ScheduleBlock.objects.create(
                    user=request.user,
                    subject=item.get('subject') or item.get('label') or "Unknown Subject",
                    day_of_week=item.get('day_of_week'),
                    start_time=item.get('start_time'),
                    end_time=item.get('end_time')
                )
                created_blocks.append(block)

            return Response({
                "message": "Schedule analyzed successfully",
                "blocks": ScheduleBlockSerializer(created_blocks, many=True).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # This will print the actual error to your Django terminal
            print(f"Error in ScheduleUploadView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ScheduleBlockListView(generics.ListAPIView):
    serializer_class = ScheduleBlockSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # This allows the frontend to see if the user has any saved blocks
        return ScheduleBlock.objects.filter(user=self.request.user)