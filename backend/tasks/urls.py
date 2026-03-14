from django.urls import path
from .views import TaskListCreateView, TaskDetailView, TaskCompleteView, TaskReprioritizeView

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list-create'),
    path('reprioritize/', TaskReprioritizeView.as_view(), name='task-reprioritize'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('<int:pk>/complete/', TaskCompleteView.as_view(), name='task-complete'),
]
