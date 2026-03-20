from django.urls import path
from . import views

urlpatterns = [
    path('api/folders/', views.getFolders, name="folders"),
    path('api/folders/delete/<str:pk>/', views.deleteFolder, name="delete-folder"),
    path('api/folders/<str:folder_pk>/files/', views.getFiles, name="files"),
    path('api/files/delete/<str:pk>/', views.deleteFile, name="delete-file"),
]