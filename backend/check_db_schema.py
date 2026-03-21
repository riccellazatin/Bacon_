import os
import sys
import django

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.db import connection
from accounts.models import User

print("Checking database schema...")
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'accounts_user'")
        columns = [row[0] for row in cursor.fetchall()]
        
        if 'has_exclusive_access' in columns:
            print("SUCCESS: 'has_exclusive_access' column FOUND in database.")
        else:
            print("FAILURE: 'has_exclusive_access' column MISSING in database.")
            print(f"Existing columns: {columns}")

    print("\nChecking Django model access...")
    try:
        u = User.objects.first()
        if u:
            print(f"Found user: {u.email}")
            print(f"Current status: {getattr(u, 'has_exclusive_access', 'Attribute Missing')}")
            # Try to save to verify write access
            # u.has_exclusive_access = not u.has_exclusive_access
            # u.save()
            print("Read access confirmed.")
        else:
            print("No users found in database.")
            
    except Exception as e:
        print(f"Error accessing model: {e}")

except Exception as e:
    print(f"Database connection error: {e}")
