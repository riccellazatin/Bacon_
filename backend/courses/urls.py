from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FolderViewSet, CourseFileViewSet

router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'files', CourseFileViewSet, basename='coursefile')

urlpatterns = [
    path('', include(router.urls)),
]