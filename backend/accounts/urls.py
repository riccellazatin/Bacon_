from django.urls import path, include
from .views import RegisterView, UserPreferencesView, CurrentUserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('user/preferences/', UserPreferencesView.as_view(), name='user-preferences'),
    path('user/', include([
        path('', CurrentUserView.as_view(), name='current-user'),
    ])),
]
