"""
Job Application Views

Handles job application submissions, tracking, and management.
Integrates with both manual applications and automated system.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import JobApplication, ApplicationEvent, ApplicationTracking
from .serializers import (
    JobApplicationSerializer, ApplicationEventSerializer, 
    ApplicationTrackingSerializer, ApplicationCreateSerializer,
    ApplicationStatusUpdateSerializer
)
from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile
from fyndr_auth.utils.google_oauth import ensure_access_token
import logging
from django.utils import timezone
import requests
from jobscraper.permissions import IsRecruiter
from django.core.files.storage import default_storage
from django.http import StreamingHttpResponse
import os
import mimetypes
from django.conf import settings
from django.db import connection

User = get_user_model()
logger = logging.getLogger(__name__)


class JobApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing job applications"""
    
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user).select_related(
            'user', 'job'
        ).prefetch_related('events', 'tracking')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        elif self.action == 'update_status':
            return ApplicationStatusUpdateSerializer
        return JobApplicationSerializer
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update application status with event tracking"""
        application = self.get_object()
        serializer = ApplicationStatusUpdateSerializer(
            application, data=request.data, context={'request': request}
        )
        
        if serializer.is_valid():
            with transaction.atomic():
                updated_application = serializer.save()
                
                # Send real-time update
                from channels.layers import get_channel_layer
                from asgiref.sync import async_to_sync
                
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{request.user.id}",
                        {
                            'type': 'application_update',
                            'application_id': str(updated_application.id),
                            'status': updated_application.status,
                            'message': f"Application status updated to {updated_application.status}"
                        }
                    )
                
                return Response(
                    JobApplicationSerializer(updated_application).data,
                    status=status.HTTP_200_OK
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def events(self, request, pk=None):
        """Get all events for an application"""
        application = self.get_object()
        events = application.events.all().order_by('-created_at')
        serializer = ApplicationEventSerializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def tracking(self, request, pk=None):
        """Get tracking information for an application"""
        application = self.get_object()
        try:
            tracking = application.tracking
            serializer = ApplicationTrackingSerializer(tracking)
            return Response(serializer.data)
        except ApplicationTracking.DoesNotExist:
            return Response(
                {'detail': 'Tracking not enabled for this application'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get application statistics for the user"""
        applications = self.get_queryset()
        
        stats = {
            'total': applications.count(),
            'by_status': {},
            'recent_activity': []
        }
        
        # Aggregate by status
        for app in applications:
            stats['by_status'][app.status] = stats['by_status'].get(app.status, 0) + 1
        
        # Recent events
        recent_events = ApplicationEvent.objects.filter(
            application__user=request.user
        ).select_related('application', 'application__job').order_by('-created_at')[:10]
        
        stats['recent_activity'] = ApplicationEventSerializer(recent_events, many=True).data
        
        return Response(stats)


class ApplicationEventViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing application events"""
    
    serializer_class = ApplicationEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ApplicationEvent.objects.filter(
            application__user=self.request.user
        ).select_related('application', 'application__job').order_by('-created_at')


class ApplicationTrackingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing application tracking"""
    
    serializer_class = ApplicationTrackingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ApplicationTracking.objects.filter(
            application__user=self.request.user
        ).select_related('application', 'application__job')
    
    @action(detail=True, methods=['post'])
    def check_status(self, request, pk=None):
        """Manually trigger status check for an application"""
        tracking = self.get_object()
        
        try:
            # Import the service for status checking
            from .real_time_service import RealTimeApplicationService
            
            service = RealTimeApplicationService()
            result = service.check_application_status(tracking.application)
            
            return Response({
                'status': 'success',
                'message': 'Status check initiated',
                'result': result
            })
        except Exception as e:
            logger.error(f"Error checking status for application {tracking.application.id}: {e}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def update_frequency(self, request, pk=None):
        """Update check frequency for tracking"""
        tracking = self.get_object()
        frequency = request.data.get('frequency_minutes')
        
        if not frequency or int(frequency) < 30:
            return Response({
                'error': 'Frequency must be at least 30 minutes'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        tracking.check_frequency_minutes = int(frequency)
        tracking.save()
        
        return Response({
            'message': 'Check frequency updated',
            'frequency_minutes': int(frequency)
        })


# API Views for quick access
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    """Get dashboard data for the authenticated user"""
    user = request.user
    
    # Get recent applications
    applications = JobApplication.objects.filter(user=user).select_related('job').order_by('-created_at')[:5]
    
    # Get recent events
    events = ApplicationEvent.objects.filter(
        application__user=user
    ).select_related('application', 'application__job').order_by('-created_at')[:10]
    
    # Calculate stats
    total_apps = JobApplication.objects.filter(user=user).count()
    pending_apps = JobApplication.objects.filter(
        user=user, 
        status__in=['applied', 'in_review', 'interview']
    ).count()
    
    return Response({
        'applications': JobApplicationSerializer(applications, many=True).data,
        'events': ApplicationEventSerializer(events, many=True).data,
        'stats': {
            'total_applications': total_apps,
            'pending_applications': pending_apps,
            'success_rate': 0 if total_apps == 0 else round(
                (JobApplication.objects.filter(user=user, status='offer').count() / total_apps) * 100, 1
            )
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quick_apply(request):
    """Quick apply to a job with minimal data and optional file uploads (resume, cover_letter)."""
    job_id = request.data.get('job_id')
    application_method = request.data.get('application_method', 'manual')
    
    if not job_id:
        return Response({'error': 'job_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        job = JobPosting.objects.get(id=job_id)
    except JobPosting.DoesNotExist:
        return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if already applied (make idempotent)
    existing = JobApplication.objects.filter(user=request.user, job=job).first()
    if existing:
        return Response({
            'status': 'success',
            'message': 'You have already applied to this job',
            'already_applied': True,
            'application': JobApplicationSerializer(existing).data,
        }, status=status.HTTP_200_OK)
    
    with transaction.atomic():
        application = JobApplication.objects.create(
            user=request.user,
            job=job,
            application_method=application_method,
            is_tracking_enabled=True
        )
        
        # Create initial event
        ApplicationEvent.objects.create(
            application=application,
            event_type=ApplicationEvent.EventType.APPLIED,
            title=f"Quick applied to {job.title}",
            description=f"Application submitted via {application_method}",
            metadata={'method': application_method, 'quick_apply': True}
        )
        
        # Create tracking
        ApplicationTracking.objects.create(
            application=application,
            check_frequency_minutes=60,
            email_monitoring_enabled=True
        )

        # Handle file uploads (multipart): resume, cover_letter
        files_meta = {}
        try:
            upload_dir = f"applications/{application.id}/"
            for key in ('resume', 'cover_letter'):
                uploaded = request.FILES.get(key)
                if not uploaded:
                    continue
                base, ext = os.path.splitext(uploaded.name or '')
                safe_ext = ext if len(ext) <= 10 else ''
                filename = f"{key}{safe_ext or ''}"
                path = os.path.join(upload_dir, filename)
                saved_path = default_storage.save(path, uploaded)
                files_meta[key] = {
                    'path': saved_path,
                    'name': uploaded.name,
                    'size': getattr(uploaded, 'size', None),
                    'content_type': getattr(uploaded, 'content_type', ''),
                }
            if files_meta:
                ca = dict(application.custom_answers or {})
                ca['files'] = files_meta
                application.custom_answers = ca
                application.save(update_fields=['custom_answers', 'updated_at'])
        except Exception as e:
            logger.warning(f"Quick apply file upload failed for app {application.id}: {e}")
    
    # Notify candidate group
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"user_{request.user.id}",
                {
                    'type': 'application_created',
                    'application_id': str(application.id),
                    'job_title': job.title,
                    'company': job.company,
                    'message': 'Quick apply submitted',
                    'files': {k: v.get('name') for k, v in (application.custom_answers or {}).get('files', {}).items()} if (application.custom_answers or {}).get('files') else {},
                }
            )
            # If recruiter-owned, notify recruiter group
            if getattr(job, 'recruiter_owner_id', None):
                async_to_sync(channel_layer.group_send)(
                    f"recruiter_{job.recruiter_owner_id}",
                    {
                        'type': 'application_created',
                        'application_id': str(application.id),
                        'job_id': job.id,
                        'actor': 'candidate',
                        'message': 'New application received',
                        'files': {k: v.get('name') for k, v in (application.custom_answers or {}).get('files', {}).items()} if (application.custom_answers or {}).get('files') else {},
                    }
                )
    except Exception:
        pass

    app_data = JobApplicationSerializer(application).data
    # Provide safe download URLs or presigned (S3) if configured
    files_info = {}
    file_meta = (application.custom_answers or {}).get('files', {})
    if file_meta:
        for key in ('resume', 'cover_letter'):
            if key in file_meta:
                meta = file_meta[key]
                files_info[key] = {
                    'name': meta.get('name'),
                    'size': meta.get('size'),
                    'download_url': _build_file_download_url(request, application, key, meta),
                }
    app_data['files'] = files_info

    return Response(app_data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_to_job(request, job_id):
    """
    Handle job application submission with real-time processing
    """
    try:
        job = get_object_or_404(JobPosting, id=job_id)
        if not getattr(job, 'is_active', True):
            return Response({'status': 'error', 'message': 'Job is not active'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        
        # Check if application already exists
        existing_application = JobApplication.objects.filter(
            job=job,
            user=user
        ).first()
        
        if existing_application:
            # Idempotent: return success with existing application
            return Response({
                'status': 'success',
                'message': 'You have already applied to this job',
                'already_applied': True,
                'application': JobApplicationSerializer(existing_application).data,
            }, status=status.HTTP_200_OK)
        
        # Create application using serializer
        application_data = {
            'job_id': job_id,
            'application_method': request.data.get('application_method', 'manual'),
            'resume_text': request.data.get('resume_text', ''),
            'cover_letter_text': request.data.get('cover_letter_text', ''),
            'custom_answers': request.data.get('custom_answers', {}),
            'notes': request.data.get('notes', ''),
            'enable_tracking': request.data.get('enable_tracking', True)
        }
        
        serializer = ApplicationCreateSerializer(
            data=application_data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                application = serializer.save()
            except Exception as e:
                logger.warning(f"Application create failed: {e}")
                return Response({
                    'status': 'error',
                    'message': 'Invalid application data',
                    'errors': getattr(e, 'detail', str(e))
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Send real-time notification (optional - fail gracefully if channels unavailable)
            try:
                from channels.layers import get_channel_layer
                from asgiref.sync import async_to_sync
                
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{user.id}",
                        {
                            'type': 'application_created',
                            'application_id': str(application.id),
                            'job_title': job.title,
                            'company': job.company,
                            'message': f"Successfully applied to {job.title} at {job.company}"
                        }
                    )
                else:
                    logger.info("Channel layer not available - skipping real-time notification")
            except Exception as channels_error:
                logger.warning(f"Failed to send real-time notification: {channels_error}")
                # Continue without real-time notification - don't fail the application
            
            app_payload = JobApplicationSerializer(application).data
            # Include apply_url hint if method is redirect and job has explicit apply_url
            if (app_payload.get('application_method') == 'redirect') and getattr(job, 'apply_url', None):
                app_payload['application_url'] = job.apply_url
            return Response({
                'status': 'success',
                'message': 'Application submitted successfully',
                'application': app_payload,
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'message': 'Invalid application data',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Error applying to job {job_id}: {str(e)}", exc_info=True)
        return Response({
            'status': 'error',
            'message': 'Failed to submit application.',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def health(request):
    """Lightweight health check to validate DB tables and migrations.

    Returns: { ok: bool, tables: { jobapplier_application: bool, jobscraper_jobposting: bool }, db: vendor }
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        vendor = connection.vendor
        # Check critical tables
        inspector_ok = True
        tables = { 'jobapplier_application': False, 'jobscraper_jobposting': False }
        try:
            existing = connection.introspection.table_names()
            for t in list(tables.keys()):
                tables[t] = t in existing
        except Exception:
            inspector_ok = False
        return Response({ 'ok': True, 'db': vendor, 'tables': tables, 'introspection': inspector_ok })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return Response({ 'ok': False, 'error': str(e) }, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_gmail_confirmations(request):
    """Scan user's Gmail for confirmation emails and update applications.

    Request body (optional): { since_days?: number, max_results_per_query?: number }
    """
    try:
        access_token = ensure_access_token(request.user)
        if not access_token:
            return Response({'success': False, 'error': 'Google account not connected'}, status=status.HTTP_400_BAD_REQUEST)

        since_days = int(request.data.get('since_days', 14) or 14)
        max_per_query = int(request.data.get('max_results_per_query', 5) or 5)
        since_dt = timezone.now() - timezone.timedelta(days=since_days)

        apps_qs = JobApplication.objects.filter(
            user=request.user,
            applied_at__gte=since_dt,
            email_confirmed=False,
        ).select_related('job')

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json',
        }

        updated = 0
        checked = 0
        matches = []

        def build_query(company: str, title: str) -> str:
            # Gmail search query; limit to recent days and look for typical keywords
            company_q = f'"{company}"' if company else ''
            title_q = f'"{title}"' if title else ''
            keywords = '(subject:application OR subject:"application received" OR subject:"thank you" OR subject:applied)'
            newer = f'newer_than:{since_days}d'
            return ' '.join([kw for kw in [newer, company_q, title_q, keywords] if kw])

        def get_headers_map(payload_headers):
            return {h.get('name'): h.get('value') for h in (payload_headers or [])}

        for app in apps_qs:
            checked += 1
            job = app.job
            if not job:
                continue
            q = build_query(job.company or '', job.title or '')
            try:
                search_url = 'https://www.googleapis.com/gmail/v1/users/me/messages'
                params = { 'q': q, 'maxResults': max_per_query }
                sr = requests.get(search_url, headers=headers, params=params, timeout=15)
                if sr.status_code != 200:
                    continue
                items = sr.json().get('messages', []) or []
                if not items:
                    continue
                # Inspect messages for subject/company/title presence
                confirmed = False
                for item in items:
                    mid = item.get('id')
                    if not mid:
                        continue
                    mr = requests.get(
                        f'https://www.googleapis.com/gmail/v1/users/me/messages/{mid}',
                        headers=headers,
                        params={'format': 'metadata', 'metadataHeaders': ['Subject', 'From', 'Date']},
                        timeout=15,
                    )
                    if mr.status_code != 200:
                        continue
                    data = mr.json()
                    headers_map = get_headers_map(data.get('payload', {}).get('headers', []))
                    subj = (headers_map.get('Subject') or '').lower()
                    frm = (headers_map.get('From') or '').lower()
                    snippet = (data.get('snippet') or '').lower()
                    company_l = (job.company or '').lower()
                    title_l = (job.title or '').lower()
                    if (
                        ('application' in subj or 'applied' in subj or 'received' in subj or 'thank you' in subj)
                        and ((company_l and company_l in subj) or (company_l in snippet) or (company_l in frm))
                    ) or (
                        title_l and (title_l in subj or title_l in snippet)
                    ):
                        confirmed = True
                        break
                if confirmed:
                    app.email_confirmed = True
                    app.email_confirmed_at = timezone.now()
                    app.save(update_fields=['email_confirmed', 'email_confirmed_at', 'updated_at'])
                    # Create event
                    ApplicationEvent.objects.create(
                        application=app,
                        event_type=ApplicationEvent.EventType.EMAIL_RECEIVED,
                        title='Confirmation email received',
                        description='We detected a confirmation email in your inbox.',
                        metadata={'source': 'gmail_sync'}
                    )
                    # Emit WS update
                    try:
                        from channels.layers import get_channel_layer
                        from asgiref.sync import async_to_sync
                        channel_layer = get_channel_layer()
                        if channel_layer:
                            async_to_sync(channel_layer.group_send)(
                                f"user_{request.user.id}",
                                {
                                    'type': 'application_update',
                                    'application_id': str(app.id),
                                    'email_confirmed': True,
                                    'message': 'Email confirmation detected',
                                }
                            )
                    except Exception:
                        pass
                    updated += 1
                    matches.append(str(app.id))
            except Exception as e:
                logger.warning(f"Gmail sync failed for app {app.id}: {e}")
                continue

        return Response({
            'success': True,
            'checked': checked,
            'updated': updated,
            'matched_applications': matches,
        })
    except Exception as e:
        logger.error(f"sync_gmail_confirmations error: {e}")
        return Response({'success': False, 'error': 'Failed to sync Gmail'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_dynamically(request):
    """
    Minimal dynamic-apply endpoint to support frontend expectations.
    Creates a standard JobApplication and returns normalized fields:
    { success, application_id, confirmation_number, external_link_followed, application }
    """
    try:
        job_id = request.data.get('job_id')
        options = request.data.get('options') or {}
        if not job_id:
            return Response({'success': False, 'error': 'job_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        job = get_object_or_404(JobPosting, id=job_id, is_active=True)

        # Idempotent behavior
        existing_application = JobApplication.objects.filter(user=request.user, job=job).first()
        if existing_application:
            return Response({
                'success': True,
                'already_applied': True,
                'application_id': str(existing_application.id),
                'confirmation_number': existing_application.external_application_id,
                'external_link_followed': bool(job.url and not job.url.startswith('/')),
                'application': JobApplicationSerializer(existing_application).data,
            }, status=status.HTTP_200_OK)

        # Choose method based on URL presence
        is_external = bool(job.url and not job.url.startswith('/'))
        method = 'browser' if is_external else 'manual'

        serializer = ApplicationCreateSerializer(
            data={
                'job_id': job_id,
                'application_method': method,
                'notes': options.get('notes', ''),
                'enable_tracking': True
            },
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        try:
            application = serializer.save()
        except Exception as e:
            logger.warning(f"Dynamic application create failed: {e}")
            return Response({'success': False, 'error': getattr(e, 'detail', str(e))}, status=status.HTTP_400_BAD_REQUEST)
        # Real-time notify about creation
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"user_{request.user.id}",
                    {
                        'type': 'application_created',
                        'application_id': str(application.id),
                        'job_title': job.title,
                        'company': job.company,
                        'message': f"Application created for {job.title}"
                    }
                )
        except Exception as _e:
            logger.debug(f"Skipping creation notify: {_e}")

        # If external, try to perform real browser automation
        confirmation_number = None
        external_followed = is_external
        if is_external:
            try:
                from .automation_runner import run_browser_apply
                profile = None
                try:
                    profile = JobSeekerProfile.objects.filter(user=request.user).first()
                except Exception:
                    profile = None
                result = run_browser_apply(job, profile, application)
                confirmation_number = result.get('confirmation_number')
                external_followed = result.get('external_link_followed', True)
                # Push real-time status update if channels layer is available
                try:
                    from channels.layers import get_channel_layer
                    from asgiref.sync import async_to_sync
                    channel_layer = get_channel_layer()
                    if channel_layer:
                        async_to_sync(channel_layer.group_send)(
                            f"user_{request.user.id}",
                            {
                                'type': 'application_update',
                                'application_id': str(application.id),
                                'status': application.status,
                                'message': 'Automation completed for your application'
                            }
                        )
                except Exception as _e:
                    logger.debug(f"Skipping real-time notify: {_e}")
            except Exception as e:
                logger.warning(f"Browser automation attempt failed for application {application.id}: {e}")

        return Response({
            'success': True,
            'application_id': str(application.id),
            'confirmation_number': confirmation_number or application.external_application_id,
            'external_link_followed': external_followed,
            'application': JobApplicationSerializer(application).data,
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Dynamic apply failed: {e}")
        return Response({'success': False, 'error': 'Failed to apply dynamically'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monitor_status(request, application_id):
    """Return simple tracking stub for application status."""
    try:
        application = get_object_or_404(JobApplication, id=application_id, user=request.user)
        tracking = getattr(application, 'tracking', None)
        return Response({
            'success': True,
            'status': application.status,
            'tracking': ApplicationTrackingSerializer(tracking).data if tracking else None
        })
    except Exception as e:
        logger.error(f"Monitor status error: {e}")
        return Response({'success': False, 'error': 'Failed to get status'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_monitoring(request):
    """Enable tracking on an application if not already enabled."""
    try:
        application_id = request.data.get('application_id')
        application = get_object_or_404(JobApplication, id=application_id, user=request.user)
        tracking = getattr(application, 'tracking', None)
        if not tracking:
            ApplicationTracking.objects.create(
                application=application,
                check_frequency_minutes=60,
                email_monitoring_enabled=True
            )
        return Response({'success': True})
    except Exception as e:
        logger.error(f"Start monitoring error: {e}")
        return Response({'success': False, 'error': 'Failed to start monitoring'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_application(request, application_id):
    """Mark an application as verified (via ats/email/manual). Optionally set confirmation number and url."""
    try:
        application = get_object_or_404(JobApplication, id=application_id, user=request.user)
        source = (request.data.get('source') or 'manual').strip().lower()
        confirmation = request.data.get('confirmation_number')
        url = request.data.get('application_url')

        if confirmation:
            application.external_application_id = confirmation
        if url and not application.application_url:
            application.application_url = url

        application.is_verified = True
        application.verified_at = timezone.now()
        application.verified_source = source[:50]
        if source == 'email':
            application.email_confirmed = True
            application.email_confirmed_at = timezone.now()

        application.save(update_fields=[
            'external_application_id', 'application_url',
            'is_verified', 'verified_at', 'verified_source',
            'email_confirmed', 'email_confirmed_at', 'updated_at'
        ])

        # Emit WS update
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"user_{request.user.id}",
                    {
                        'type': 'application_update',
                        'application_id': str(application.id),
                        'status': application.status,
                        'message': 'Application verified',
                        'verified': True,
                        'verified_source': application.verified_source,
                        'confirmation_number': application.external_application_id,
                    }
                )
        except Exception as _e:
            logger.debug(f"Skipping verify notify: {_e}")

        return Response({'success': True, 'application': JobApplicationSerializer(application).data})
    except Exception as e:
        logger.error(f"Verify application error: {e}")
        return Response({'success': False, 'error': 'Failed to verify application'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_applied(request, application_id):
    """Mark an application as 'applied' with optional confirmation number and URL.

    Body: { confirmation_number?: string, application_url?: string }
    """
    try:
        application = get_object_or_404(JobApplication, id=application_id, user=request.user)
        confirmation = request.data.get('confirmation_number')
        url = request.data.get('application_url')

        updates = {}
        if application.status != JobApplication.ApplicationStatus.APPLIED:
            application.status = JobApplication.ApplicationStatus.APPLIED
            updates['status'] = application.status
        if confirmation:
            application.external_application_id = confirmation
            updates['external_application_id'] = confirmation
        if url:
            application.application_url = url
            updates['application_url'] = url

        application.save()

        # Create status event
        ApplicationEvent.objects.create(
            application=application,
            event_type=ApplicationEvent.EventType.STATUS_CHANGE,
            title='Status set to applied',
            description='User confirmed application on careers site',
            metadata=updates
        )

        # Emit WS update
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"user_{request.user.id}",
                    {
                        'type': 'application_update',
                        'application_id': str(application.id),
                        'status': application.status,
                        'message': 'Application marked as applied',
                        **updates,
                    }
                )
        except Exception:
            pass

        return Response({'success': True, 'application': JobApplicationSerializer(application).data})
    except Exception as e:
        logger.error(f"confirm_applied error: {e}")
        return Response({'success': False, 'error': 'Failed to confirm application'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stop_monitoring(request):
    """Disable tracking for an application (soft stop)."""
    try:
        application_id = request.data.get('application_id')
        application = get_object_or_404(JobApplication, id=application_id, user=request.user)
        tracking = getattr(application, 'tracking', None)
        if tracking:
            tracking.email_monitoring_enabled = False
            tracking.check_frequency_minutes = 1440  # once a day
            tracking.save()
        return Response({'success': True})
    except Exception as e:
        logger.error(f"Stop monitoring error: {e}")
        return Response({'success': False, 'error': 'Failed to stop monitoring'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_applications(request):
    """
    Get all applications for the authenticated user
    """
    try:
        user = request.user
        
        # Get applications with pagination
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        
        applications = JobApplication.objects.filter(user=user).select_related('job').order_by('-created_at')
        
        # Calculate pagination
        start = (page - 1) * page_size
        end = start + page_size
        total_count = applications.count()
        
        paginated_applications = applications[start:end]
        
        serialized_applications = []
        for app in paginated_applications:
            app_data = JobApplicationSerializer(app).data
            app_data['job_info'] = {
                'title': app.job.title,
                'company': app.job.company,
                'location': app.job.location,
                'logo_url': app.job.company_logo or '',
                'job_url': app.job.url
            }
            serialized_applications.append(app_data)
        
        return Response({
            'status': 'success',
            'applications': serialized_applications,
            'pagination': {
                'current_page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching applications: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Failed to fetch applications'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Recruiter endpoints (dashboard)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRecruiter])
def recruiter_applicants(request):
    """List applicants for a recruiter-owned job with optional status filter and pagination."""
    try:
        job_id = request.query_params.get('job_id')
        if not job_id:
            return Response({'error': 'job_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure job belongs to recruiter
        job = get_object_or_404(JobPosting, id=job_id, recruiter_owner=request.user)

        status_filter = request.query_params.get('status')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        qs = JobApplication.objects.filter(job=job).select_related('user', 'job').order_by('-created_at')
        if status_filter:
            qs = qs.filter(status=status_filter)

        total = qs.count()
        start, end = (page - 1) * page_size, (page - 1) * page_size + page_size
        applications = list(qs[start:end])

        data = []
        for app in applications:
            item = JobApplicationSerializer(app).data
            # Minimal candidate info for recruiter view
            item['candidate'] = {
                'id': app.user.id,
                'username': app.user.username,
                'email': app.user.email,
            }
            # Flat fields for UI convenience
            item['email'] = app.user.email
            item['username'] = app.user.username
            # Helpful job fields
            item['job_summary'] = {
                'id': app.job.id,
                'title': app.job.title,
                'company': app.job.company,
            }
            # Files info with secure download URLs (if any)
            files_info = {}
            file_meta = (app.custom_answers or {}).get('files', {})
            if file_meta:
                for key in ('resume', 'cover_letter'):
                    if key in file_meta:
                        meta = file_meta[key]
                        files_info[key] = {
                            'name': meta.get('name'),
                            'size': meta.get('size'),
                            'download_url': _build_file_download_url(request, app, key, meta),
                        }
            if files_info:
                item['files'] = files_info
            data.append(item)

        return Response({
            'results': data,
            'pagination': {
                'current_page': page,
                'page_size': page_size,
                'total_count': total,
                'total_pages': (total + page_size - 1) // page_size
            }
        })
    except Exception as e:
        logger.error(f"recruiter_applicants error: {e}")
        return Response({'error': 'Failed to load applicants'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRecruiter])
def recruiter_application_events(request, application_id):
    """Return event history for an application if the recruiter owns the job."""
    try:
        application = get_object_or_404(JobApplication.objects.select_related('job'), id=application_id)
        if application.job.recruiter_owner_id != request.user.id:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        events = application.events.all().order_by('-created_at')
        return Response(ApplicationEventSerializer(events, many=True).data)
    except Exception as e:
        logger.error(f"recruiter_application_events error: {e}")
        return Response({'error': 'Failed to load events'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsRecruiter])
def recruiter_update_application_status(request, application_id):
    """Allow recruiters to update status for applications on their jobs; emits WS to candidate and recruiter groups."""
    try:
        application = get_object_or_404(JobApplication.objects.select_related('job', 'user'), id=application_id)
        if application.job.recruiter_owner_id != request.user.id:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        if not new_status:
            return Response({'error': 'status is required'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            old = application.status
            application.status = new_status
            if notes:
                application.notes = (application.notes + '\n' if application.notes else '') + notes
            application.save()
            # history event
            ApplicationEvent.objects.create(
                application=application,
                event_type=ApplicationEvent.EventType.STATUS_CHANGE,
                title=f"Recruiter set status to {new_status}",
                description=notes,
                metadata={'old_status': old, 'new_status': new_status, 'actor': 'recruiter'}
            )

        # WS to candidate and recruiter groups
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            cl = get_channel_layer()
            if cl:
                payload = {
                    'type': 'status_updated',
                    'application_id': str(application.id),
                    'new_status': new_status,
                    'actor': 'recruiter',
                }
                async_to_sync(cl.group_send)(f"user_{application.user_id}", payload)
                async_to_sync(cl.group_send)(f"recruiter_{request.user.id}", payload)
        except Exception:
            pass

        return Response({'success': True})
    except Exception as e:
        logger.error(f"recruiter_update_application_status error: {e}")
        return Response({'error': 'Failed to update status'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _build_file_download_url(request, application, key: str, meta: dict) -> str:
    """Build a download URL. If using S3 storage with querystring auth, return a presigned URL.
    Otherwise return the protected API route which streams the file.
    """
    try:
        storage_path = getattr(settings, 'DEFAULT_FILE_STORAGE', '') or ''
        # Heuristic: if using S3Boto3 storage, leverage its url() with parameters
        if 'storages.backends.s3boto3' in storage_path:
            name = meta.get('name') or os.path.basename(meta.get('path', ''))
            try:
                # django-storages s3 allows parameters for Response headers
                return default_storage.url(
                    meta.get('path'),
                    parameters={
                        'ResponseContentDisposition': f'attachment; filename="{name}"'
                    }
                )
            except TypeError:
                # Fallback without parameters
                return default_storage.url(meta.get('path'))
        # Default: protected API route
        return request.build_absolute_uri(
            f"/api/applications/recruiter/download/{application.id}/{key}/"
        )
    except Exception:
        return request.build_absolute_uri(
            f"/api/applications/recruiter/download/{application.id}/{key}/"
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_application_file(request, application_id, file_key):
    """Secure download for application files (resume, cover_letter).

    Access: candidate (owner) OR recruiter who owns the job.
    """
    try:
        if file_key not in ('resume', 'cover_letter'):
            return Response({'error': 'Invalid file key'}, status=status.HTTP_400_BAD_REQUEST)
        application = get_object_or_404(JobApplication.objects.select_related('job', 'user'), id=application_id)
        is_candidate = application.user_id == request.user.id
        is_recruiter_owner = getattr(application.job, 'recruiter_owner_id', None) == request.user.id
        if not (is_candidate or is_recruiter_owner):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        files_meta = (application.custom_answers or {}).get('files', {})
        meta = files_meta.get(file_key)
        if not meta or not meta.get('path'):
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        path = meta['path']
        f = default_storage.open(path, 'rb')
        guessed_type, _ = mimetypes.guess_type(meta.get('name') or path)
        content_type = meta.get('content_type') or guessed_type or 'application/octet-stream'
        resp = StreamingHttpResponse(f, content_type=content_type)
        download_name = meta.get('name') or os.path.basename(path)
        resp['Content-Disposition'] = f'attachment; filename="{download_name}"'
        return resp
    except Exception as e:
        logger.error(f"download_application_file error: {e}")
        return Response({'error': 'Failed to download file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
