from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from .serializers import RegisterSerializer, UserSerializer, UserPreferencesSerializer
from .models import User, UserPreferences, GoogleCalendarCredentials
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from datetime import timedelta
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials as GoogleCredentials
from googleapiclient.discovery import build
import os

SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
]


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
    if user.week_start_date and today >= user.week_start_date + timedelta(days=7):
        user.points_earned_this_week = 0
        user.week_start_date = today
        user.save()

    return Response({
        "total_points": user.total_points,
        "points_earned_this_week": user.points_earned_this_week,
        "week_start_date": user.week_start_date
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def google_auth_init(request):
    """
    Generate the Google OAuth2 authorization URL.
    """
    if not request.user.has_exclusive_access:
         return Response({"detail": "Exclusive access required."}, status=status.HTTP_403_FORBIDDEN)

    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        return Response({"detail": "Google Client configuration missing."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Use flow to get the authorization URL
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES
    )
    
    # The return URL should match what's configured in Google Console
    flow.redirect_uri = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:3000/google/callback')
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    return Response({"authorization_url": authorization_url})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def google_auth_callback(request):
    """
    Exchange the authorization code for tokens.
    """
    # Disable OAuthlib's HTTPS verification when running locally (development only).
    if os.environ.get('DEBUG') == 'True':
        os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

    code = request.data.get('code')
    redirect_uri = request.data.get('redirect_uri')

    if not code:
        return Response({"detail": "No code provided."}, status=status.HTTP_400_BAD_REQUEST)
    
    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')

    if not client_id or not client_secret:
        import logging
        logger = logging.getLogger(__name__)
        logger.error("Missing Google Client ID or Secret in environment variables.")
        return Response({"detail": "Server configuration error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=SCOPES,
            redirect_uri=redirect_uri if redirect_uri else 'postmessage'
        )
        
        # Explicitly set the redirect_uri on the flow object to match what the frontend sent
        # 'postmessage' is the special value for the popup flow.
        flow.redirect_uri = redirect_uri if redirect_uri == 'postmessage' else os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:3000/google/callback')
        
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Save credentials
        GoogleCalendarCredentials.objects.update_or_create(
            user=request.user,
            defaults={
                'token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': credentials.client_id,
                'client_secret': credentials.client_secret,
                'scopes': credentials.scopes
            }
        )
        
        return Response({"detail": "Google Calendar connected successfully."})
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.exception(f"Google Auth Error: {str(e)}")
        return Response({"detail": f"Google Auth Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def google_auth_status(request):
    """
    Check if user is connected to Google Calendar.
    """
    is_connected = GoogleCalendarCredentials.objects.filter(user=request.user).exists()
    return Response({"is_connected": is_connected})

    
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

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def run_migrations(request):
    """
    One-time endpoint to run migrations.
    DELETE THIS ENDPOINT after migrations are applied.
    """
    try:
        from django.core.management import call_command
        call_command('migrate', verbosity=2)
        return Response({"status": "✅ Migrations completed successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
