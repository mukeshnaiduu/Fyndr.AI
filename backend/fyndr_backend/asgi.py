"""
ASGI config for fyndr_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

# IMPORTANT: configure settings before importing Django modules
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fyndr_backend.settings')

# Ensure Django apps are loaded before importing modules that access models
import django
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from .channels_jwt import JWTAuthMiddlewareStack
import jobapplier.routing
import jobtracker.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    # Use JWT middleware so clients can pass ?token=ACCESS_TOKEN
    "websocket": JWTAuthMiddlewareStack(
        URLRouter([
            *jobapplier.routing.websocket_urlpatterns,
            *jobtracker.routing.websocket_urlpatterns,
        ])
    ),
})
