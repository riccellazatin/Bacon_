from rest_framework import serializers
from .models import CourseFolder, CourseFile

class CourseFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseFile
        fields = '__all__'

class CourseFolderSerializer(serializers.ModelSerializer):
    file_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CourseFolder
        fields = ['id', 'user', 'name', 'created_at', 'file_count']