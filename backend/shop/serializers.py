from rest_framework import serializers

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import Items
        model = items
        fields = '__all__'

class UserSerializers(serializer.ModelSerializer):
    class Meta:
        from django.contrib.auth.models import User
        model = User
        fields = ['id', 'username', 'email']