from rest_framework import serializers
from .models import Folder, CourseFile

class CourseFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseFile
        fields = ['id', 'folder', 'file', 'uploaded_at']

class FolderSerializer(serializers.ModelSerializer):
    files = CourseFileSerializer(many=True, read_only=True)

    class Meta:
        model = Folder
        fields = ['id', 'name', 'created_at', 'files']