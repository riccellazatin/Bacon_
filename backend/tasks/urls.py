from django.urls import path
from .views import TaskListCreateView, TaskDetailView, TaskCompleteView, TaskReprioritizeView, BulkCreateTasksView, ScheduleUploadView, ScheduleBlockListView

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list-create'),
    path('reprioritize/', TaskReprioritizeView.as_view(), name='task-reprioritize'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('<int:pk>/complete/', TaskCompleteView.as_view(), name='task-complete'),
    path('bulk-create/', BulkCreateTasksView.as_view(), name='bulk_create'),
    path('upload-schedule/', ScheduleUploadView.as_view(), name='upload-schedule'),
    path('schedule-blocks/', ScheduleBlockListView.as_view(), name='schedule-blocks'),
]
