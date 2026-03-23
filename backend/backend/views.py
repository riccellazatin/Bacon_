from django.core.management import call_command
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([AllowAny])
def run_migrations(request):
    """One-time endpoint to run migrations. DELETE after using."""
    try:
        call_command('migrate', verbosity=2)
        return Response({"status": "✅ Migrations completed successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)