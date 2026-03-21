from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from .serializers import RegisterSerializer, UserSerializer, UserPreferencesSerializer
from .models import User, UserPreferences
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from datetime import timedelta


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)


class UserPreferencesView(generics.RetrieveUpdateAPIView):
    serializer_class = UserPreferencesSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        prefs, created = UserPreferences.objects.get_or_create(user=self.request.user)
        return prefs

    def perform_update(self, serializer):
        # Save preferences and mark user as onboarded in the same transaction
        with transaction.atomic():
            serializer.save()
            user = self.request.user
            user.is_onboarded = True
            user.save()


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def getUserPoints(request):
    """Get user's current points and weekly point information"""
    user = request.user
    
    # Check if week has passed and reset if needed
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    if user.week_start_date < week_ago:
        user.points_earned_this_week = 0
        user.week_start_date = today
        user.save()
    
    weekly_limit = 15
    return Response({
        'total_points': user.total_points,
        'points_earned_this_week': user.points_earned_this_week,
        'weekly_limit': weekly_limit,
        'points_available_this_week': max(0, weekly_limit - user.points_earned_this_week),
        'week_start_date': user.week_start_date
    })
