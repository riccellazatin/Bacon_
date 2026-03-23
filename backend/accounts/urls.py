from django.urls import path, include
from .views import RegisterView, UserPreferencesView, CurrentUserView, getUserPoints, google_auth_init, google_auth_callback, google_auth_status, run_migrations

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('user/preferences/', UserPreferencesView.as_view(), name='user-preferences'),
    path('user/points/', getUserPoints, name='user-points'),
    path('user/', include([
        path('', CurrentUserView.as_view(), name='current-user'),
    ])),
    path('google/init/', google_auth_init, name='google-auth-init'),
    path('google/callback/', google_auth_callback, name='google-auth-callback'),
    path('google/status/', google_auth_status, name='google-auth-status'),
    path('migrate/', run_migrations, name='run_migrations'),
]
