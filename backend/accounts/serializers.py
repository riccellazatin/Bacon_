from rest_framework import serializers
from .models import User, UserPreferences


class UserPreferencesSerializer(serializers.ModelSerializer):
    off_days = serializers.ListField(child=serializers.CharField(), allow_empty=True)

    class Meta:
        model = UserPreferences
        fields = ('off_days', 'start_time', 'end_time')


class UserSerializer(serializers.ModelSerializer):
    preferences = UserPreferencesSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'total_points', 'is_onboarded', 'preferences')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        # create empty preferences
        UserPreferences.objects.create(user=user)
        return user
