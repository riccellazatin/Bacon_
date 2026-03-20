from django.shortcuts import render
from .models import CourseFolder, CourseFile
from .serializers import CourseFolderSerializer, CourseFileSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.
@api_view(['GET', 'POST'])
def getFolders(request):
    if request.method == 'GET':
        folder = CourseFolder.objects.filter(user=request.user)
        serializer = CourseFolderSerializer
        return Response(serializer.data)
    
    if request.method == 'POST':
        data = request.data
        folder = CourseFolder.objects.create(user=request.user, name=data['name'])
        serializer = CourseFolderSerializer(folder, many=False)
        return Response(serializer.data)

@api_view(['DELETE'])
def deleteFolder(request, pk):
    folder = CourseFolder.objects.get(id=pk)
    folder.delete()
    return Response('Folder Deleted')

@api_view(['GET', 'POST'])
def getFiles(request, folder_pk):
    if request.method == 'GET':
        files = CourseFile.objects.filter(folder_id=folder_pk)
        serializer = CourseFileSerializer(files, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        file = request.FILES.get('file')
        course_file = CourseFile.objects.create(folder_id=folder_pk, file=file)
        serializer = CourseFileSerializer(course_file, many=False)
        return Response(serializer.data)

@api_view(['DELETE'])
def deleteFile(request, pk):
    course_file = CourseFile.objects.get(id=pk)
    course_file.delete()
    return Response('File Deleted') 

@api_view(['GET'])
def getRoutes(request):
    routes = [
        'api/folders/',
        'api/folders/delete/<id>/',
        'api/folders/<id>/files/',
        'api/files/delete/<id>/',
    ]
    return Response(routes)