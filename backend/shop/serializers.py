from rest_framework import serializers
from .views import items

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import Items
        model = items
        fields = '__all__'

class UserSerializers(serializers.ModelSerializer):
    class Meta:
        from django.contrib.auth.models import User
        model = User
        fields = ['id', 'username', 'email']