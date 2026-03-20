from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class CourseFolder(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200)
    description = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class CourseFile(models.Model):
    folder = models.ForeignKey(CourseFolder, related_name='files', on_delete=models.CASCADE)
    file = models.FileField(upload_to='course_files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
