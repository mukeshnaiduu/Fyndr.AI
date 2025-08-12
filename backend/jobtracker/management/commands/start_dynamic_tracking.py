"""
Django management command to start dynamic real-time job application tracking.

This command starts the dynamic tracking service that monitors application statuses
across multiple sources (ATS, email, manual updates) in real-time.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import asyncio
import logging

from jobtracker.dynamic_tracker import dynamic_tracker
from jobapplier.models import Application

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Start dynamic real-time application tracking service'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            nargs='+',
            type=int,
            help='User IDs to track (if not specified, tracks all users with active applications)'
        )
        parser.add_argument(
            '--check-interval',
            type=int,
            default=300,
            help='Status check interval in seconds (default: 300)'
        )
        parser.add_argument(
            '--email-interval',
            type=int,
            default=180,
            help='Email check interval in seconds (default: 180)'
        )
        parser.add_argument(
            '--ats-interval',
            type=int,
            default=600,
            help='ATS sync interval in seconds (default: 600)'
        )

    def handle(self, *args, **options):
        """Start the dynamic tracking service"""
        
        self.stdout.write(
            self.style.SUCCESS('Starting Dynamic Application Tracking Service...')
        )
        
        # Configure intervals
        if options['check_interval']:
            dynamic_tracker._check_interval = options['check_interval']
        if options['email_interval']:
            dynamic_tracker._email_check_interval = options['email_interval']
        if options['ats_interval']:
            dynamic_tracker._ats_sync_interval = options['ats_interval']
        
        # Get user IDs to track
        user_ids = options.get('users')
        
        if user_ids:
            # Validate user IDs
            valid_users = User.objects.filter(id__in=user_ids).values_list('id', flat=True)
            invalid_users = set(user_ids) - set(valid_users)
            
            if invalid_users:
                self.stdout.write(
                    self.style.WARNING(f'Invalid user IDs: {list(invalid_users)}')
                )
            
            if not valid_users:
                self.stdout.write(
                    self.style.ERROR('No valid users specified. Exiting.')
                )
                return
                
            user_ids = list(valid_users)
            self.stdout.write(
                self.style.SUCCESS(f'Tracking {len(user_ids)} specified users: {user_ids}')
            )
        else:
            # Get all users with active applications
            user_ids = list(
                Application.objects.filter(
                    status__in=['pending', 'applied', 'interviewing', 'reviewing']
                ).values_list('user_profile__user__id', flat=True).distinct()
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Auto-detected {len(user_ids)} users with active applications')
            )
        
        if not user_ids:
            self.stdout.write(
                self.style.WARNING('No users with active applications found. Exiting.')
            )
            return
        
        # Display configuration
        self.stdout.write(
            self.style.SUCCESS(
                f'Configuration:\n'
                f'  - Status check interval: {dynamic_tracker._check_interval}s\n'
                f'  - Email check interval: {dynamic_tracker._email_check_interval}s\n'
                f'  - ATS sync interval: {dynamic_tracker._ats_sync_interval}s\n'
                f'  - Analytics update interval: {dynamic_tracker._analytics_update_interval}s'
            )
        )
        
        # Run the async tracking service
        try:
            asyncio.run(self._run_tracking_service(user_ids))
        except KeyboardInterrupt:
            self.stdout.write(
                self.style.SUCCESS('\nReceived interrupt signal. Stopping tracking service...')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Tracking service error: {e}')
            )
            logger.error(f"Tracking service failed: {e}")

    async def _run_tracking_service(self, user_ids):
        """Run the async tracking service"""
        
        self.stdout.write(
            self.style.SUCCESS('🚀 Dynamic Application Tracking Service Started!')
        )
        
        # Start tracking
        started = await dynamic_tracker.start_tracking(user_ids)
        
        if not started:
            self.stdout.write(
                self.style.ERROR('Failed to start tracking service')
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Successfully started tracking for {len(user_ids)} users\n'
                f'   Active monitoring in progress...\n'
                f'   Press Ctrl+C to stop'
            )
        )
        
        # Monitor and display periodic status
        try:
            while dynamic_tracker._is_running:
                await asyncio.sleep(60)  # Status update every minute
                
                # Display status update
                active_count = len(dynamic_tracker._active_users)
                self.stdout.write(
                    self.style.SUCCESS(f'📊 Tracking {active_count} users - {self._get_timestamp()}')
                )
                
        except asyncio.CancelledError:
            pass
        finally:
            # Stop tracking
            await dynamic_tracker.stop_tracking()
            self.stdout.write(
                self.style.SUCCESS('🛑 Dynamic tracking service stopped')
            )

    def _get_timestamp(self):
        """Get current timestamp for status updates"""
        from django.utils import timezone
        return timezone.now().strftime('%Y-%m-%d %H:%M:%S')
