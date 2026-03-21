from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Folder, CourseFile
from .serializers import FolderSerializer, CourseFileSerializer

class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Folder.objects.all()
        return Folder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CourseFileViewSet(viewsets.ModelViewSet):
    serializer_class = CourseFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return CourseFile.objects.all()
        return CourseFile.objects.filter(folder__user=self.request.user)

    def create(self, request, *args, **kwargs):
        folder_id = request.data.get('folder')
        try:
            folder = Folder.objects.get(id=folder_id, user=request.user)
        except Folder.DoesNotExist:
            return Response(
                {"detail": "You do not have permission to upload to this folder."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)