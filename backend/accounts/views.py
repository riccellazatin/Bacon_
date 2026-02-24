from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from .serializers import RegisterSerializer, UserSerializer, UserPreferencesSerializer
from .models import User, UserPreferences


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
