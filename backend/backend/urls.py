"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.serializers import CustomTokenObtainPairSerializer
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

class CustomTokenObtainPairView(APIView):
    """Custom token view that uses email for authentication"""
    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data)
        return Response(serializer.errors, status=400)

def api_root(request):
    return JsonResponse({
        "message": "🥓 Bacon API is running!",
        "endpoints": {
            "auth": "/api/accounts",
            "tasks": "/api/tasks",
            "token": "/api/token/",
            "courses": "/api/courses",
        }
    })

urlpatterns = [
    path('api/', api_root, name='api_root'), 
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include('shop.urls')),
    path('api/courses/', include('courses.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)