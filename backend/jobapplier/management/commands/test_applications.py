"""Management command to exercise application flow (updated for current models).

Note: This module name begins with 'test_' which makes unittest try to import it as tests.
If this causes conflicts in CI, rename the file to 'exercise_applications.py'.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobscraper.models import JobPosting
from jobapplier.models import JobApplication
from jobapplier.views import apply_to_job
from rest_framework.test import APIRequestFactory, force_authenticate
import json

User = get_user_model()


class Command(BaseCommand):
    help = 'Test the application tracking system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='Test with specific user ID'
        )
        parser.add_argument(
            '--apply-to-jobs',
            action='store_true',
            help='Create test applications'
        )
        parser.add_argument(
            '--show-applications',
            action='store_true',
            help='Show existing applications'
        )

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        apply_to_jobs = options.get('apply_to_jobs', False)
        show_applications = options.get('show_applications', False)

        if not apply_to_jobs and not show_applications:
            show_applications = True

        # Get user
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                self.stdout.write(f"Testing with user: {user.username}")
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"User with ID {user_id} not found"))
                return
        else:
            user = User.objects.filter(jobseeker_profile__isnull=False).first()
            if not user:
                self.stdout.write(self.style.ERROR("No users with job seeker profiles found"))
                return
            self.stdout.write(f"Testing with user: {user.username}")

        # Show existing applications
        if show_applications:
            self._show_applications(user)

        # Create test applications
        if apply_to_jobs:
            self._create_test_applications(user)

    def _show_applications(self, user):
        """Show existing applications for user"""
        self.stdout.write(f"\n{'='*50}")
        self.stdout.write(f"EXISTING APPLICATIONS FOR {user.username}")
        self.stdout.write(f"{'='*50}")

        try:
            applications = JobApplication.objects.filter(
                user=user
            ).select_related('job').order_by('-applied_at')

            if not applications.exists():
                self.stdout.write("No applications found.")
                return

            for app in applications:
                self.stdout.write(f"\n📋 Application ID: {app.id}")
                self.stdout.write(f"   Job: {app.job.title} at {app.job.company}")
                self.stdout.write(f"   Status: {app.get_status_display()}")
                self.stdout.write(f"   Method: {app.get_application_method_display()}")
                self.stdout.write(f"   Applied: {app.applied_at.strftime('%Y-%m-%d %H:%M')}")
                if app.notes:
                    self.stdout.write(f"   Notes: {app.notes}")

            # Show statistics
            total = applications.count()
            status_counts = {}
            for status_choice in JobApplication.ApplicationStatus.choices:
                count = applications.filter(status=status_choice[0]).count()
                if count > 0:
                    status_counts[status_choice[1]] = count

            self.stdout.write(f"\n📊 STATISTICS:")
            self.stdout.write(f"   Total Applications: {total}")
            for status, count in status_counts.items():
                percentage = (count / total * 100) if total > 0 else 0
                self.stdout.write(f"   {status}: {count} ({percentage:.1f}%)")

        except Exception as e:
            self.stdout.write(f"Error loading applications: {e}")

    def _create_test_applications(self, user):
        """Create test applications"""
        self.stdout.write(f"\n{'='*50}")
        self.stdout.write(f"CREATING TEST APPLICATIONS FOR {user.username}")
        self.stdout.write(f"{'='*50}")

        # Get some jobs to apply to
        jobs = JobPosting.objects.filter(is_active=True)[:3]
        
        if not jobs.exists():
            self.stdout.write(self.style.ERROR("No active jobs found to apply to"))
            return

        factory = APIRequestFactory()
        
        for job in jobs:
            try:
                # Check if already applied
                if JobApplication.objects.filter(user=user, job=job).exists():
                    self.stdout.write(f"   ⚠️  Already applied to {job.title} at {job.company}")
                    continue

                # Create mock request
                request = factory.post(f'/api/applications/apply/{job.id}/', {
                    'notes': f'Test application to {job.company}'
                })
                request.user = user
                force_authenticate(request, user=user)

                # Call the view function
                response = apply_to_job(request, job.id)
                
                if response.status_code in (200, 201):
                    # Prefer DRF Response.data; fall back to rendered content
                    response_data = {}
                    if hasattr(response, 'data'):
                        response_data = response.data
                    else:
                        try:
                            response.render()
                        except Exception:
                            pass
                        try:
                            content = response.content.decode('utf-8') if hasattr(response, 'content') else ''
                            response_data = json.loads(content) if content else {}
                        except Exception:
                            response_data = {}

                    if response_data.get('status') == 'success':
                        self.stdout.write(f"   ✅ Applied to {job.title} at {job.company}")
                    else:
                        self.stdout.write(f"   ❌ Failed: {response_data.get('message')}")
                else:
                    self.stdout.write(f"   ❌ HTTP {response.status_code}: Failed to apply to {job.title}")

            except Exception as e:
                self.stdout.write(f"   ❌ Error applying to {job.title}: {e}")

        self.stdout.write(f"\n✅ Test application creation completed!")
        
        # Show updated applications
        self._show_applications(user)
