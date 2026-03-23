import re
import json
import logging
from xmlrpc import client
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F, Q
from .models import ScheduleBlock, Task
from .serializers import ScheduleBlockSerializer, ScheduleImageUploadSerializer, TaskSerializer
from .services.prioritization import prioritize_and_save_task, determine_task_difficulty

logger = logging.getLogger(__name__)
import random
from django.utils import timezone
import os
from rest_framework.views import APIView, settings
from google import genai
from google.genai import types
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import datetime, timedelta
from django.utils import timezone as tz
from accounts.models import GoogleCalendarCredentials
from google.oauth2.credentials import Credentials as GoogleCredentials
from googleapiclient.discovery import build


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
            Q(status=Task.STATUS_ONGOING) & (
                Q(prioritized_at__isnull=True) | 
                Q(updated_at__gt=F('prioritized_at')) |
                Q(suggested_start_time__isnull=True) |
                Q(suggested_start_time__lt=timezone.now())
            )
        ).order_by('updated_at')[:10]
        for task in stale_tasks:
            prioritize_and_save_task(task, self.request.user)

        return Task.objects.filter(user=self.request.user).order_by('-priority_score', '-priority_confidence', 'created_at')

    def perform_create(self, serializer):
        task = serializer.save(user=self.request.user)
        # Determine difficulty using AI analysis
        task.difficulty = determine_task_difficulty(task, self.request.user)
        task.save(update_fields=['difficulty'])
        # Then prioritize the task
        prioritize_and_save_task(task, self.request.user)

        # Google Calendar Integration
        if self.request.data.get('add_to_google_calendar') and self.request.user.has_exclusive_access:
            try:
                creds_model = GoogleCalendarCredentials.objects.get(user=self.request.user)
                # Reconstruct credentials
                creds = GoogleCredentials(
                    token=creds_model.token,
                    refresh_token=creds_model.refresh_token,
                    token_uri=creds_model.token_uri,
                    client_id=creds_model.client_id,
                    client_secret=creds_model.client_secret,
                    scopes=creds_model.scopes
                )
                
                service = build('calendar', 'v3', credentials=creds)
                
                # Determine start time
                start_dt = None
                if task.suggested_start_time:
                    start_dt = task.suggested_start_time
                elif task.scheduled_date:
                     # Create datetime at 9am UTC if no time specified
                     start_dt = datetime.combine(task.scheduled_date, datetime.time(9, 0))
                     if tz.is_naive(start_dt):
                        start_dt = tz.make_aware(start_dt)
                
                if start_dt:
                    duration = task.duration_minutes if task.duration_minutes else 30
                    end_dt = start_dt + timedelta(minutes=duration)
                    
                    event = {
                        'summary': task.title,
                        'description': task.description,
                        'start': {
                            'dateTime': start_dt.isoformat(),
                            'timeZone': 'UTC',
                        },
                        'end': {
                            'dateTime': end_dt.isoformat(),
                            'timeZone': 'UTC',
                        },
                    }
                    
                    event_result = service.events().insert(calendarId='primary', body=event).execute()
                    task.google_event_id = event_result.get('id')
                    task.save(update_fields=['google_event_id'])
            except GoogleCalendarCredentials.DoesNotExist:
                 # User opted in but not connected
                 pass
            except Exception as e:
                logger.exception(f"Failed to add to Google Calendar: {e}")
                # Don't fail the task creation
        
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
        prioritize_and_save_task(task, self.request.user)


class TaskCompleteView(generics.UpdateAPIView):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def get_points_for_difficulty(self, difficulty):
        """Return points based on task difficulty"""
        points_map = {
            Task.DIFFICULTY_EASY: 15,
            Task.DIFFICULTY_MEDIUM: 1,
            Task.DIFFICULTY_HARD: 2,
        }
        return points_map.get(difficulty, 1)

    def check_and_reset_weekly_points(self, user):
        """Check if a week has passed and reset if needed"""
        today = tz.now().date()
        week_ago = today - timedelta(days=7)
        
        if user.week_start_date < week_ago:
            user.points_earned_this_week = 0
            user.week_start_date = today
            user.save()

    def patch(self, request, *args, **kwargs):
        task = self.get_object()
        if task.status == Task.STATUS_DONE:
            return Response({'detail': 'Already completed.'}, status=status.HTTP_200_OK)

        # Enforce sequential completion: check if any higher priority ongoing tasks exist
        higher_priority_exists = Task.objects.filter(
            user=request.user,
            status=Task.STATUS_ONGOING,
            priority_score__gt=task.priority_score
        ).exists()

        if higher_priority_exists:
            return Response(
                {'detail': 'You must complete higher priority tasks first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            task.status = Task.STATUS_DONE
            user = request.user
            
            # Check if week has passed and reset if needed
            self.check_and_reset_weekly_points(user)
            
            # Ensure difficulty is always set (fallback to medium if missing)
            if not task.difficulty or task.difficulty not in [Task.DIFFICULTY_EASY, Task.DIFFICULTY_MEDIUM, Task.DIFFICULTY_HARD]:
                task.difficulty = Task.DIFFICULTY_MEDIUM
                task.save(update_fields=['difficulty'])
            
            # Calculate points based on difficulty
            points_earned = self.get_points_for_difficulty(task.difficulty)
            task.points_value = points_earned  # Keep as float, don't truncate with int()
            
            # Check if user has reached the 15 point limit this week
            weekly_limit = 15
            if user.points_earned_this_week >= weekly_limit:
                # User has reached the limit, no more points this week
                points_to_add = 0
                limit_reached = True
            elif user.points_earned_this_week + points_earned > weekly_limit:
                # User will exceed the limit, cap at remaining points
                points_to_add = weekly_limit - user.points_earned_this_week
                limit_reached = False
            else:
                # User can earn the full points
                points_to_add = points_earned
                limit_reached = False
            
            task.save()
            prioritize_and_save_task(task, request.user)
            
            # Add points to user
            user.total_points = (user.total_points or 0) + points_to_add
            user.points_earned_this_week = user.points_earned_this_week + points_to_add
            user.save()
            
            serializer = self.get_serializer(task)
            response_data = serializer.data
            # Ensure points_value is in the response
            response_data['points_value'] = float(task.points_value)
            response_data['difficulty'] = task.difficulty
            
            return Response({
                'task': response_data,
                'total_points': float(user.total_points),
                'points_earned_this_week': float(user.points_earned_this_week),
                'weekly_limit': weekly_limit,
                'points_awarded': float(points_to_add if points_to_add > 0 else 0),
                'points_needed_for_limit': max(0, weekly_limit - user.points_earned_this_week),
                'limit_reached': limit_reached,
                'limit_message': 'Weekly limit reached! You cannot earn more points until next week.' if limit_reached and points_to_add == 0 else None
            })


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

            # Create task with placeholder difficulty - will be determined by AI
            task = Task.objects.create(
                user=request.user,
                title=item.get('title'),
                deadline=deadline_val,
                duration_minutes=item.get('duration_minutes', 0),
                description=item.get('description', ''),
                difficulty='medium',  # Placeholder - will be determined by AI
                status='ongoing'
            )
            
            # Determine difficulty using AI analysis
            task.difficulty = determine_task_difficulty(task, request.user)
            task.save(update_fields=['difficulty'])
            
            # Then prioritize the task
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
            logger.exception(f"Error in ScheduleUploadView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ScheduleBlockListView(generics.ListAPIView):
    serializer_class = ScheduleBlockSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # This allows the frontend to see if the user has any saved blocks
        return ScheduleBlock.objects.filter(user=self.request.user)