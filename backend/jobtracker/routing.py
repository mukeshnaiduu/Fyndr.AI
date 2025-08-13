"""
WebSocket routing for job tracking real-time features
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/tracking/(?P<user_id>\w+)/$', consumers.TrackingConsumer.as_asgi()),
]
