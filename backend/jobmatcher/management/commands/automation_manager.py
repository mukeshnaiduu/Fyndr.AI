"""
Management command to manage automated job applications
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.db import transaction
from jobmatcher.models import UserPreferences
from jobmatcher.automation import automation_manager, enable_automation_for_user
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Manage automated job applications and scheduling'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='Process only specific user ID'
        )
        parser.add_argument(
            '--schedule',
            action='store_true',
            help='Schedule applications for users with automation enabled'
        )
        parser.add_argument(
            '--execute',
            action='store_true',
            help='Execute scheduled applications'
        )
        parser.add_argument(
            '--status',
            action='store_true',
            help='Show automation status for all users'
        )
        parser.add_argument(
            '--enable-for-user',
            type=int,
            help='Enable automation for specific user ID with default settings'
        )
        parser.add_argument(
            '--pipeline-report',
            action='store_true',
            help='Generate comprehensive pipeline report'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes'
        )

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        schedule = options.get('schedule', False)
        execute = options.get('execute', False)
        status = options.get('status', False)
        enable_for_user = options.get('enable_for_user')
        pipeline_report = options.get('pipeline_report', False)
        dry_run = options.get('dry_run', False)

        if not any([schedule, execute, status, enable_for_user, pipeline_report]):
            status = True
            self.stdout.write("No specific action specified. Showing automation status.")

        # Enable automation for specific user
        if enable_for_user:
            self._enable_automation_for_user(enable_for_user, dry_run)
            return

        # Show automation status
        if status:
            self._show_automation_status(user_id)

        # Schedule applications
        if schedule:
            self._schedule_applications(user_id, dry_run)

        # Execute scheduled applications
        if execute:
            self._execute_applications(dry_run)

        # Generate pipeline report
        if pipeline_report:
            self._generate_pipeline_report(user_id)

    def _enable_automation_for_user(self, user_id, dry_run):
        """Enable automation for a specific user with default settings"""
        try:
            user = User.objects.get(id=user_id)
            
            # Default automation settings
            preferences_data = {
                'automation_enabled': True,
                'daily_application_limit': 10,
                'min_job_score_threshold': 60,
                'preferred_job_types': ['Software Engineer', 'Developer', 'Data Scientist'],
                'preferred_locations': ['Remote', 'San Francisco', 'New York'],
                'minimum_salary': 80000,
                'excluded_companies': [],
                'apply_on_weekends': False,
                'notify_before_applying': True
            }
            
            if dry_run:
                self.stdout.write(f"Would enable automation for user {user.username} with settings:")
                for key, value in preferences_data.items():
                    self.stdout.write(f"  {key}: {value}")
                return
            
            result = enable_automation_for_user(user, preferences_data)
            
            if result['success']:
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Automation enabled for user {user.username}")
                )
                schedule_result = result.get('schedule_result', {})
                if schedule_result.get('success'):
                    scheduled = schedule_result.get('scheduled_applications', 0)
                    self.stdout.write(f"  Scheduled {scheduled} applications")
            else:
                self.stdout.write(
                    self.style.ERROR(f"✗ Failed to enable automation: {result.get('error')}")
                )
                
        except User.DoesNotExist:
            raise CommandError(f"User with ID {user_id} not found")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error enabling automation: {e}"))

    def _show_automation_status(self, user_id=None):
        """Show automation status for users"""
        self.stdout.write(f"\n{'=' * 60}")
        self.stdout.write(self.style.SUCCESS("AUTOMATION STATUS REPORT"))
        self.stdout.write(f"{'=' * 60}")

        if user_id:
            try:
                users = [User.objects.get(id=user_id)]
            except User.DoesNotExist:
                raise CommandError(f"User with ID {user_id} not found")
        else:
            users = User.objects.filter(jobseeker_profile__isnull=False)

        total_users = 0
        enabled_users = 0
        total_scheduled = 0

        for user in users:
            try:
                preferences = UserPreferences.objects.filter(
                    user_profile__user=user
                ).first()
                
                total_users += 1
                
                if preferences and preferences.automation_enabled:
                    enabled_users += 1
                    
                    # Get pipeline status
                    pipeline_status = automation_manager.get_application_pipeline_status(user)
                    
                    self.stdout.write(f"\n👤 User: {user.username}")
                    self.stdout.write(f"  ✅ Automation: ENABLED")
                    self.stdout.write(f"  📊 Daily Limit: {preferences.daily_application_limit}")
                    self.stdout.write(f"  📈 Min Score: {preferences.min_job_score_threshold}%")
                    
                    if 'pipeline_overview' in pipeline_status:
                        overview = pipeline_status['pipeline_overview']
                        self.stdout.write(f"  📋 Jobs Scored: {overview.get('jobs_scored', 0)}")
                        self.stdout.write(f"  📦 Packets Ready: {overview.get('packets_ready', 0)}")
                        self.stdout.write(f"  📤 Applications: {overview.get('applications_submitted', 0)}")
                        
                        total_scheduled += overview.get('packets_ready', 0)
                    
                    # Show next actions
                    if 'next_actions' in pipeline_status:
                        actions = pipeline_status['next_actions']
                        if actions:
                            self.stdout.write(f"  🎯 Next Actions:")
                            for action in actions[:3]:  # Show top 3
                                self.stdout.write(f"    • {action}")
                
                else:
                    self.stdout.write(f"\n👤 User: {user.username}")
                    self.stdout.write(f"  ❌ Automation: DISABLED")
                    
            except Exception as e:
                self.stdout.write(f"\n👤 User: {user.username}")
                self.stdout.write(f"  ⚠️  Error: {e}")

        # Summary
        self.stdout.write(f"\n{'=' * 40}")
        self.stdout.write(f"📊 SUMMARY:")
        self.stdout.write(f"  Total Users: {total_users}")
        self.stdout.write(f"  Automation Enabled: {enabled_users}")
        self.stdout.write(f"  Total Ready Packets: {total_scheduled}")
        self.stdout.write(f"  Automation Rate: {(enabled_users/total_users*100):.1f}%" if total_users > 0 else "  Automation Rate: 0%")

    def _schedule_applications(self, user_id, dry_run):
        """Schedule applications for users"""
        self.stdout.write(f"\n{'=' * 50}")
        self.stdout.write(self.style.SUCCESS("SCHEDULING APPLICATIONS"))
        self.stdout.write(f"{'=' * 50}")

        if user_id:
            try:
                users = [User.objects.get(id=user_id)]
            except User.DoesNotExist:
                raise CommandError(f"User with ID {user_id} not found")
        else:
            users = User.objects.filter(
                jobseeker_profile__userpreferences__automation_enabled=True
            ).distinct()

        total_scheduled = 0
        successful_schedules = 0

        for user in users:
            try:
                preferences = UserPreferences.objects.filter(
                    user_profile__user=user
                ).first()
                
                if not preferences or not preferences.automation_enabled:
                    continue

                if dry_run:
                    self.stdout.write(f"Would schedule applications for user {user.username}")
                    continue

                schedule_result = automation_manager.schedule_applications_for_user(
                    user, preferences
                )
                
                if schedule_result.get('success'):
                    scheduled = schedule_result.get('scheduled_applications', 0)
                    total_scheduled += scheduled
                    successful_schedules += 1
                    
                    self.stdout.write(f"✓ {user.username}: Scheduled {scheduled} applications")
                    
                    if 'next_application_time' in schedule_result:
                        next_time = schedule_result['next_application_time']
                        self.stdout.write(f"  Next application: {next_time}")
                else:
                    message = schedule_result.get('message', 'Unknown error')
                    self.stdout.write(f"⚠️  {user.username}: {message}")
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"✗ {user.username}: {e}"))

        self.stdout.write(f"\n📊 Scheduling Summary:")
        self.stdout.write(f"  Users Processed: {successful_schedules}")
        self.stdout.write(f"  Total Applications Scheduled: {total_scheduled}")

    def _execute_applications(self, dry_run):
        """Execute scheduled applications"""
        self.stdout.write(f"\n{'=' * 50}")
        self.stdout.write(self.style.SUCCESS("EXECUTING SCHEDULED APPLICATIONS"))
        self.stdout.write(f"{'=' * 50}")

        if dry_run:
            self.stdout.write("This would execute all scheduled applications")
            return

        try:
            results = automation_manager.execute_scheduled_applications()
            
            self.stdout.write(f"📊 Execution Results:")
            self.stdout.write(f"  Total Processed: {results.get('total_processed', 0)}")
            self.stdout.write(f"  ✅ Successful: {results.get('successful_applications', 0)}")
            self.stdout.write(f"  ❌ Failed: {results.get('failed_applications', 0)}")
            
            errors = results.get('errors', [])
            if errors:
                self.stdout.write(f"\n⚠️  Errors ({len(errors)}):")
                for error in errors[:5]:  # Show first 5 errors
                    self.stdout.write(f"  • {error}")
                if len(errors) > 5:
                    self.stdout.write(f"  ... and {len(errors) - 5} more errors")
                    
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Execution failed: {e}"))

    def _generate_pipeline_report(self, user_id):
        """Generate comprehensive pipeline report"""
        self.stdout.write(f"\n{'=' * 60}")
        self.stdout.write(self.style.SUCCESS("COMPREHENSIVE PIPELINE REPORT"))
        self.stdout.write(f"{'=' * 60}")

        if user_id:
            try:
                users = [User.objects.get(id=user_id)]
            except User.DoesNotExist:
                raise CommandError(f"User with ID {user_id} not found")
        else:
            users = User.objects.filter(jobseeker_profile__isnull=False)[:10]  # Limit to 10 for readability

        for user in users:
            try:
                pipeline_status = automation_manager.get_application_pipeline_status(user)
                
                self.stdout.write(f"\n{'=' * 40}")
                self.stdout.write(f"👤 USER: {user.username}")
                self.stdout.write(f"{'=' * 40}")
                
                if 'pipeline_overview' in pipeline_status:
                    overview = pipeline_status['pipeline_overview']
                    self.stdout.write(f"📊 PIPELINE OVERVIEW:")
                    self.stdout.write(f"  Total Jobs Available: {overview.get('total_jobs_available', 0)}")
                    self.stdout.write(f"  Jobs Scored: {overview.get('jobs_scored', 0)}")
                    self.stdout.write(f"  Packets Ready: {overview.get('packets_ready', 0)}")
                    self.stdout.write(f"  Applications Submitted: {overview.get('applications_submitted', 0)}")
                
                if 'automation_status' in pipeline_status:
                    auto_status = pipeline_status['automation_status']
                    self.stdout.write(f"\n🤖 AUTOMATION STATUS:")
                    self.stdout.write(f"  Enabled: {'Yes' if auto_status.get('enabled') else 'No'}")
                    self.stdout.write(f"  Daily Limit: {auto_status.get('daily_limit', 0)}")
                    self.stdout.write(f"  Min Score Threshold: {auto_status.get('min_score_threshold', 0)}%")
                
                if 'recent_applications' in pipeline_status:
                    recent = pipeline_status['recent_applications']
                    if recent:
                        self.stdout.write(f"\n📤 RECENT APPLICATIONS ({len(recent)}):")
                        for app in recent[:3]:  # Show last 3
                            self.stdout.write(f"  • {app['job_title']} at {app['company']} ({app['status']})")
                
                if 'next_actions' in pipeline_status:
                    actions = pipeline_status['next_actions']
                    if actions:
                        self.stdout.write(f"\n🎯 RECOMMENDED ACTIONS:")
                        for action in actions:
                            self.stdout.write(f"  • {action}")
                
            except Exception as e:
                self.stdout.write(f"\n❌ Error processing user {user.username}: {e}")

        self.stdout.write(f"\n{'=' * 60}")
        self.stdout.write(self.style.SUCCESS("Pipeline report complete!"))
