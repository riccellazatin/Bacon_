from django.db import models
from django.conf import settings

class Items(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='')
    points = models.IntegerField(null=True, blank=True)
    _id = models.AutoField(primary_key=True)
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return self.name