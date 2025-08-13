"""
WebSocket consumers for job tracking real-time features
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class TrackingConsumer(AsyncWebsocketConsumer):
    """Handle real-time job application tracking"""
    
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'tracking_{self.user_id}'
        
        # Join group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        # Also join general user/recruiter groups for unified events (stub)
        await self.channel_layer.group_add(
            f'user_{self.user_id}',
            self.channel_name
        )
        await self.channel_layer.group_add(
            f'recruiter_{self.user_id}',
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        await self.channel_layer.group_discard(
            f'user_{self.user_id}',
            self.channel_name
        )
        await self.channel_layer.group_discard(
            f'recruiter_{self.user_id}',
            self.channel_name
        )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'subscribe_tracking':
                await self.handle_tracking_subscription(data)
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))
    
    async def handle_tracking_subscription(self, data):
        """Handle tracking subscription for specific applications"""
        application_ids = data.get('application_ids', [])
        
        for app_id in application_ids:
            # Join specific application tracking group
            tracking_group = f'app_tracking_{app_id}'
            await self.channel_layer.group_add(
                tracking_group,
                self.channel_name
            )
    
    # Receive messages from group
    async def tracking_update(self, event):
        """Send tracking update to WebSocket"""
        await self.send(text_data=json.dumps(event['message']))

    # Unified event handlers for broader routing
    async def application_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'application_created',
            **{k: v for k, v in event.items() if k != 'type'}
        }))

    async def application_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'application_update',
            **{k: v for k, v in event.items() if k != 'type'}
        }))

    async def status_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status_updated',
            **{k: v for k, v in event.items() if k != 'type'}
        }))

    async def job_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'job_created',
            **{k: v for k, v in event.items() if k != 'type'}
        }))

    async def job_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'job_updated',
            **{k: v for k, v in event.items() if k != 'type'}
        }))
