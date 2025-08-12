"""
WebSocket routing for job application real-time features
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Match /ws/applications/ optionally with query string (?token=...)
    re_path(r"^ws/applications/?$", consumers.ApplicationConsumer.as_asgi()),
]
