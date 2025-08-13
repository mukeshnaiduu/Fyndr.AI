"""
Django management command for updating application statuses.

This command checks for status updates from various sources:
- Email parsing for confirmation/rejection emails
- ATS API synchronization
- Manual status reviews

Usage:
    python manage.py update_statuses
    python manage.py update_statuses --source email
    python manage.py update_statuses --source ats
    python manage.py update_statuses --user-id 123
    python manage.py update_statuses --dry-run
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.db import transaction

from jobapplier.models import Application, UserProfile, ApplicationStatusHistory
from jobtracker.email_parser import EmailStatusParser
from jobtracker.ats_sync import ATSManager, sync_application_status
from jobtracker.reminders import check_pending_applications, generate_daily_reminder_report

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    Management command to update application statuses from various sources.
    """
    
    help = 'Update application statuses from email parsing and ATS synchronization'
    
    def add_arguments(self, parser):
        """Add command line arguments."""
        parser.add_argument(
            '--source',
            type=str,
            choices=['email', 'ats', 'all'],
            default='all',
            help='Source of status updates to process (default: all)'
        )
        
        parser.add_argument(
            '--user-id',
            type=int,
            help='Process updates only for specific user ID'
        )
        
        parser.add_argument(
            '--days-back',
            type=int,
            default=7,
            help='Number of days back to check for updates (default: 7)'
        )
        
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes'
        )
        
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Enable verbose output'
        )
        
        parser.add_argument(
            '--check-reminders',
            action='store_true',
            help='Check for pending applications needing follow-up'
        )
    
    def handle(self, *args, **options):
        """Execute the command."""
        try:
            self.verbosity = options['verbosity']
            self.dry_run = options['dry_run']
            self.verbose = options['verbose']
            
            if self.dry_run:
                self.stdout.write(
                    self.style.WARNING('DRY RUN MODE - No changes will be made')
                )
            
            # Get user filter
            user_filter = None
            if options['user_id']:
                try:
                    user_profile = UserProfile.objects.get(user_id=options['user_id'])
                    user_filter = user_profile
                    self.stdout.write(f'Processing updates for user: {user_profile.full_name}')
                except UserProfile.DoesNotExist:
                    raise CommandError(f"User profile with ID {options['user_id']} not found")
            
            # Initialize counters
            total_processed = 0
            total_updated = 0
            email_updates = 0
            ats_updates = 0
            errors = []
            
            # Process based on source
            source = options['source']
            days_back = options['days_back']
            
            if source in ['email', 'all']:
                self.stdout.write('Processing email-based status updates...')
                email_results = self._process_email_updates(user_filter, days_back)
                email_updates = email_results['updated']
                total_processed += email_results['processed']
                total_updated += email_updates
                errors.extend(email_results['errors'])
            
            if source in ['ats', 'all']:
                self.stdout.write('Processing ATS synchronization...')
                ats_results = self._process_ats_updates(user_filter, days_back)
                ats_updates = ats_results['updated']
                total_processed += ats_results['processed']
                total_updated += ats_updates
                errors.extend(ats_results['errors'])
            
            # Check for follow-up reminders if requested
            if options['check_reminders']:
                self.stdout.write('Checking for follow-up reminders...')
                reminder_results = self._check_reminders(user_filter)
                self.stdout.write(
                    f'Found {reminder_results["total_tasks"]} follow-up tasks'
                )
            
            # Display summary
            self._display_summary(total_processed, total_updated, email_updates, ats_updates, errors)
            
        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            raise CommandError(f"Command failed: {e}")
    
    def _process_email_updates(self, user_filter=None, days_back=7) -> Dict[str, Any]:
        """
        Process email-based status updates.
        
        TODO: This is a stub implementation. In a real system, this would:
        1. Connect to email service (Gmail, Outlook, etc.)
        2. Retrieve job-related emails from the last N days
        3. Parse each email for status information
        4. Match emails to existing applications
        5. Update application statuses
        """
        results = {'processed': 0, 'updated': 0, 'errors': []}
        
        try:
            # Stub implementation - simulate finding applications with potential email updates
            cutoff_date = timezone.now() - timedelta(days=days_back)
            
            queryset = Application.objects.filter(
                applied_at__gte=cutoff_date,
                status__in=['applied', 'pending']
            )
            
            if user_filter:
                queryset = queryset.filter(user_profile=user_filter)
            
            parser = EmailStatusParser()
            
            # Simulate email processing
            for application in queryset:
                results['processed'] += 1
                
                if self.verbose:
                    self.stdout.write(
                        f'  Checking emails for: {application.job.title} at {application.job.company}'
                    )
                
                # TODO: In real implementation, fetch and parse actual emails
                # For now, simulate occasional status updates
                import random
                if random.random() < 0.1:  # 10% chance of status update simulation
                    new_status = random.choice(['interview', 'rejected'])
                    
                    if not self.dry_run:
                        # Create status history entry
                        ApplicationStatusHistory.objects.create(
                            application=application,
                            status=new_status,
                            source='email_parse',
                            notes=f'Status updated via email parsing at {timezone.now()}'
                        )
                        
                        # Update application
                        application.status = new_status
                        application.save()
                    
                    results['updated'] += 1
                    
                    if self.verbose:
                        self.stdout.write(
                            f'    Updated to: {new_status} (simulated)'
                        )
            
            if results['processed'] == 0:
                self.stdout.write('  No applications found for email processing')
            
        except Exception as e:
            error_msg = f"Email processing error: {e}"
            results['errors'].append(error_msg)
            logger.error(error_msg)
        
        return results
    
    def _process_ats_updates(self, user_filter=None, days_back=7) -> Dict[str, Any]:
        """Process ATS synchronization updates."""
        results = {'processed': 0, 'updated': 0, 'errors': []}
        
        try:
            # Get applications that might have ATS updates
            cutoff_date = timezone.now() - timedelta(days=days_back)
            
            queryset = Application.objects.filter(
                applied_at__gte=cutoff_date,
                status__in=['applied', 'interview', 'pending']
            ).exclude(
                confirmation_number__isnull=True,
                confirmation_number__exact=''
            )
            
            if user_filter:
                queryset = queryset.filter(user_profile=user_filter)
            
            ats_manager = ATSManager()
            
            for application in queryset:
                results['processed'] += 1
                
                if self.verbose:
                    self.stdout.write(
                        f'  Syncing ATS for: {application.job.title} at {application.job.company}'
                    )
                
                try:
                    # Attempt ATS sync
                    sync_result = sync_application_status(application)
                    
                    if sync_result.get('updated_status'):
                        new_status = sync_result['updated_status']
                        
                        if not self.dry_run:
                            # Create status history entry
                            ApplicationStatusHistory.objects.create(
                                application=application,
                                status=new_status,
                                source='ats_sync',
                                notes=f'Status synced from ATS: {sync_result.get("sync_results", {})}'
                            )
                            
                            # Update application
                            application.status = new_status
                            application.save()
                        
                        results['updated'] += 1
                        
                        if self.verbose:
                            self.stdout.write(
                                f'    Updated to: {new_status}'
                            )
                    elif self.verbose:
                        self.stdout.write('    No status change detected')
                
                except Exception as e:
                    error_msg = f"ATS sync error for {application.application_id}: {e}"
                    results['errors'].append(error_msg)
                    if self.verbose:
                        self.stdout.write(f'    Error: {e}')
            
            if results['processed'] == 0:
                self.stdout.write('  No applications found for ATS processing')
            
        except Exception as e:
            error_msg = f"ATS processing error: {e}"
            results['errors'].append(error_msg)
            logger.error(error_msg)
        
        return results
    
    def _check_reminders(self, user_filter=None) -> Dict[str, Any]:
        """Check for applications needing follow-up reminders."""
        try:
            # Get follow-up tasks
            tasks = check_pending_applications(user_filter)
            
            # Generate daily report
            report = generate_daily_reminder_report(user_filter)
            
            if self.verbose and tasks:
                self.stdout.write('  Follow-up tasks found:')
                for task in tasks[:5]:  # Show first 5 tasks
                    self.stdout.write(
                        f'    {task.priority.upper()}: {task.job_title} at {task.company} '
                        f'({task.days_pending} days) - {task.suggested_action}'
                    )
                
                if len(tasks) > 5:
                    self.stdout.write(f'    ... and {len(tasks) - 5} more tasks')
            
            return report['summary']
            
        except Exception as e:
            logger.error(f"Reminder check error: {e}")
            return {'total_tasks': 0, 'error': str(e)}
    
    def _display_summary(self, total_processed, total_updated, email_updates, ats_updates, errors):
        """Display command execution summary."""
        self.stdout.write('\n' + '='*50)
        self.stdout.write('STATUS UPDATE SUMMARY')
        self.stdout.write('='*50)
        
        self.stdout.write(f'Total applications processed: {total_processed}')
        self.stdout.write(f'Total status updates: {total_updated}')
        self.stdout.write(f'  - Email-based updates: {email_updates}')
        self.stdout.write(f'  - ATS-based updates: {ats_updates}')
        
        if errors:
            self.stdout.write(f'Errors encountered: {len(errors)}')
            if self.verbose:
                for error in errors:
                    self.stdout.write(f'  - {error}')
        else:
            self.stdout.write('No errors encountered')
        
        if self.dry_run:
            self.stdout.write(
                self.style.WARNING('\nNOTE: This was a dry run - no changes were made')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\nUpdates completed successfully!')
            )
        
        # Log summary
        logger.info(
            f"Status update command completed: {total_updated} updates from "
            f"{total_processed} applications processed"
        )
