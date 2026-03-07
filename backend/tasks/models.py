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

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    scheduled_date = models.DateField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=0)
    points_value = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ONGOING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"
