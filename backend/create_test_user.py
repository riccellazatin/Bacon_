import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User

try:
    # Create a test user
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={'username': 'testuser'}
    )
    if created:
        user.set_password('test123')
        user.save()
        print("Test user created: test@example.com / test123")
    else:
        # Update password in case it existed
        user.set_password('test123')
        user.save()
        print("Test user password updated: test@example.com / test123")
except Exception as e:
    print(f"Error: {e}")
