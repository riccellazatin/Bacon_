"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os
import sys
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)
logger = logging.getLogger(__name__)

try:
    from django.core.wsgi import get_wsgi_application
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    logger.info("🚀 Loading Django settings...")
    application = get_wsgi_application()
    logger.info("✅ Django WSGI application loaded successfully!")
except Exception as e:
    logger.error(f"❌ ERROR loading Django: {str(e)}", exc_info=True)
    raise
