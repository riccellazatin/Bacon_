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
        fields = ('id', 'email', 'username', 'total_points', 'is_onboarded', 'has_exclusive_access', 'preferences')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True, max_length=150)

    class Meta:
        model = User
        fields = ('email', 'username', 'password')

    def validate_email(self, value):
        """Ensure email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_username(self, value):
        """Ensure username is unique"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        try:
            user = User(**validated_data)
            user.set_password(password)
            user.save()
            # create empty preferences
            UserPreferences.objects.create(user=user)
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Error creating user: {str(e)}")
