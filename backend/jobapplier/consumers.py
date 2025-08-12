"""
WebSocket consumers for real-time job application features
"""

import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import JobApplication, ApplicationEvent, ApplicationTracking, RealTimeConnection
from jobscraper.models import JobPosting

User = get_user_model()


class ApplicationConsumer(AsyncWebsocketConsumer):
    """Handle real-time job application updates"""
    
    async def connect(self):
        # Get user from scope (authentication handled by middleware)
        self.user = self.scope.get('user')
        
        if self.user and self.user.is_authenticated:
            self.user_id = str(self.user.id)
            self.group_name = f'user_{self.user_id}'
            
            # Join user group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            # Create or update real-time connection record
            await self.update_connection_status(True)
            
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'user_id': self.user_id,
                'message': 'Real-time connection established'
            }))
        else:
            # Unauthorized (token missing/invalid)
            await self.close(code=4001)
    
    async def disconnect(self, close_code):
        if hasattr(self, 'user_id'):
            # Leave group
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            
            # Update connection status
            await self.update_connection_status(False)
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp')
                }))
            elif message_type == 'subscribe_to_applications':
                await self.handle_application_subscription()
            elif message_type == 'apply_to_job':
                await self.handle_job_application(data)
            elif message_type == 'update_status':
                await self.handle_status_update(data)
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))
    
    # Event handlers for messages sent from views
    async def application_created(self, event):
        """Handle application creation events"""
        await self.send(text_data=json.dumps({
            'type': 'application_created',
            'application_id': event['application_id'],
            'job_title': event['job_title'],
            'company': event['company'],
            'message': event['message']
        }))
    
    async def application_update(self, event):
        """Handle application status updates"""
        await self.send(text_data=json.dumps({
            'type': 'application_update',
            'application_id': event['application_id'],
            'status': event['status'],
            'message': event['message']
        }))
    
    async def tracking_update(self, event):
        """Handle tracking status updates"""
        await self.send(text_data=json.dumps({
            'type': 'tracking_update',
            'application_id': event['application_id'],
            'tracking_data': event['tracking_data'],
            'message': event.get('message', 'Tracking updated')
        }))
    
    # Helper methods
    @database_sync_to_async
    def update_connection_status(self, is_connected):
        """Update or create real-time connection record"""
        try:
            connection, created = RealTimeConnection.objects.get_or_create(
                user=self.user,
                defaults={
                    'is_connected': is_connected,
                    'connection_type': 'websocket',
                    'metadata': {'channel_name': self.channel_name}
                }
            )
            if not created:
                connection.is_connected = is_connected
                connection.metadata = {'channel_name': self.channel_name}
                connection.save()
        except Exception as e:
            pass  # Silent fail for connection tracking
    
    async def handle_application_subscription(self):
        """Handle subscription to application updates"""
        applications = await self.get_user_applications()
        await self.send(text_data=json.dumps({
            'type': 'application_list',
            'applications': applications,
            'message': 'Subscribed to application updates'
        }))
    
    async def handle_job_application(self, data):
        """Handle job application from WebSocket"""
        try:
            job_id = data.get('job_id')
            application_method = data.get('application_method', 'direct')
            
            if not job_id:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'job_id is required'
                }))
                return
            
            # Apply to job
            result = await self.create_application(job_id, application_method)
            
            if result['success']:
                await self.send(text_data=json.dumps({
                    'type': 'application_created',
                    'application_id': result['application_id'],
                    'job_title': result['job_title'],
                    'company': result['company'],
                    'message': result['message']
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': result['message']
                }))
                
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Failed to apply to job: {str(e)}'
            }))
    
    async def handle_status_update(self, data):
        """Handle status update from WebSocket"""
        try:
            application_id = data.get('application_id')
            new_status = data.get('status')
            notes = data.get('notes', '')
            
            if not application_id or not new_status:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'application_id and status are required'
                }))
                return
            
            result = await self.update_application_status(application_id, new_status, notes)
            
            if result['success']:
                await self.send(text_data=json.dumps({
                    'type': 'status_updated',
                    'application_id': application_id,
                    'status': new_status,
                    'message': result['message']
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': result['message']
                }))
                
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Failed to update status: {str(e)}'
            }))
    
    @database_sync_to_async
    def get_user_applications(self):
        """Get user's applications for real-time updates"""
        try:
            applications = JobApplication.objects.filter(
                user=self.user
            ).select_related('job').order_by('-created_at')[:10]
            
            return [{
                'id': str(app.id),
                'job_title': app.job.title,
                'company': app.job.company,
                'status': app.status,
                'applied_at': app.applied_at.isoformat() if app.applied_at else None,
                'created_at': app.created_at.isoformat()
            } for app in applications]
        except Exception:
            return []
    
    @database_sync_to_async
    def create_application(self, job_id, application_method):
        """Create a new job application"""
        try:
            from django.db import transaction
            
            job = JobPosting.objects.get(id=job_id, is_active=True)
            
            # Check if application already exists
            if JobApplication.objects.filter(user=self.user, job=job).exists():
                return {
                    'success': False,
                    'message': 'You have already applied to this job'
                }
            
            with transaction.atomic():
                application = JobApplication.objects.create(
                    user=self.user,
                    job=job,
                    application_method=application_method,
                    is_tracking_enabled=True
                )
                
                # Create initial event
                ApplicationEvent.objects.create(
                    application=application,
                    event_type=ApplicationEvent.EventType.APPLIED,
                    title=f"Applied to {job.title}",
                    description=f"Application submitted via WebSocket ({application_method})",
                    metadata={'method': application_method, 'source': 'websocket'}
                )
                
                # Create tracking
                ApplicationTracking.objects.create(
                    application=application,
                    check_frequency_minutes=60,
                    email_monitoring_enabled=True
                )
            
            return {
                'success': True,
                'application_id': str(application.id),
                'job_title': job.title,
                'company': job.company,
                'message': f'Successfully applied to {job.title} at {job.company}'
            }
            
        except JobPosting.DoesNotExist:
            return {
                'success': False,
                'message': 'Job not found or not active'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Failed to create application: {str(e)}'
            }
    
    @database_sync_to_async
    def update_application_status(self, application_id, new_status, notes):
        """Update application status"""
        try:
            from django.db import transaction
            
            application = JobApplication.objects.select_related('job').get(
                id=application_id,
                user=self.user
            )
            
            old_status = application.status
            
            with transaction.atomic():
                application.status = new_status
                if notes:
                    application.notes = notes
                application.save()
                
                # Create status change event
                ApplicationEvent.objects.create(
                    application=application,
                    event_type=ApplicationEvent.EventType.STATUS_CHANGE,
                    title=f"Status changed from {old_status} to {new_status}",
                    description=notes,
                    metadata={
                        'old_status': old_status,
                        'new_status': new_status,
                        'source': 'websocket'
                    }
                )
            
            return {
                'success': True,
                'message': f'Status updated to {new_status}'
            }
            
        except JobApplication.DoesNotExist:
            return {
                'success': False,
                'message': 'Application not found'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Failed to update status: {str(e)}'
            }
