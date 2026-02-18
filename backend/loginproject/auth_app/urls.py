from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('user/<int:user_id>/', views.user_detail, name='user_detail'),
]
