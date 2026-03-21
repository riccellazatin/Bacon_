from django.db import models
from django.conf import settings


class Task(models.Model):
    STATUS_ONGOING = 'ongoing'
    STATUS_MISSING = 'missing'
    STATUS_DONE = 'done'

    STATUS_CHOICES = [
        (STATUS_ONGOING, 'Ongoing'),
        (STATUS_MISSING, 'Missing'),
        (STATUS_DONE, 'Done'),
    ]

    DIFFICULTY_EASY = 'easy'
    DIFFICULTY_MEDIUM = 'medium'
    DIFFICULTY_HARD = 'hard'

    DIFFICULTY_CHOICES = [
        (DIFFICULTY_EASY, 'Easy'),
        (DIFFICULTY_MEDIUM, 'Medium'),
        (DIFFICULTY_HARD, 'Hard'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    scheduled_date = models.DateField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=0)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default=DIFFICULTY_MEDIUM)
    points_value = models.FloatField(default=0.0)
    priority_score = models.FloatField(default=0.0, db_index=True)
    priority_reason = models.TextField(blank=True, default='')
    priority_source = models.CharField(max_length=64, blank=True, default='rules')
    priority_confidence = models.FloatField(default=0.0)
    prioritized_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ONGOING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    suggested_start_time = models.DateTimeField(null=True, blank=True, db_index=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

class ScheduleBlock(models.Model):
    DAYS_OF_WEEK = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='schedule_blocks')
    subject = models.CharField(max_length=255) # The class name
    day_of_week = models.CharField(max_length=15, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} on {self.day_of_week}"

class ClassSchedule(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.CharField(max_length=255)
    day_of_week = models.CharField(max_length=10) 
    end_time = models.TimeField()