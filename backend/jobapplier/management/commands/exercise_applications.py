"""Safe-named management command to exercise application flow."""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobscraper.models import JobPosting
from jobapplier.models import JobApplication
from jobapplier.views import apply_to_job
from rest_framework.test import APIRequestFactory, force_authenticate
import json

User = get_user_model()


class Command(BaseCommand):
    help = 'Apply to a few jobs for a user with jobseeker profile and show results'

    def add_arguments(self, parser):
        parser.add_argument('--user-id', type=int, help='Specific user ID')

    def handle(self, *args, **options):
        user_id = options.get('user_id')
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

        self._apply_to_some_jobs(user)
        self._show_applications(user)

    def _apply_to_some_jobs(self, user):
        self.stdout.write(f"\n{'='*50}")
        self.stdout.write(f"CREATING TEST APPLICATIONS FOR {user.username}")
        self.stdout.write(f"{'='*50}")

        jobs = JobPosting.objects.filter(is_active=True)[:3]
        if not jobs.exists():
            self.stdout.write(self.style.ERROR("No active jobs found to apply to"))
            return

        factory = APIRequestFactory()
        for job in jobs:
            try:
                if JobApplication.objects.filter(user=user, job=job).exists():
                    self.stdout.write(f"   ⚠️  Already applied to {job.title} at {job.company}")
                    continue
                request = factory.post(f'/api/applications/apply/{job.id}/', {
                    'notes': f'Test application to {job.company}'
                })
                request.user = user
                force_authenticate(request, user=user)

                response = apply_to_job(request, job.id)
                if response.status_code in (200, 201):
                    data = getattr(response, 'data', None)
                    if not data:
                        try:
                            response.render()
                            data = json.loads(response.content.decode('utf-8'))
                        except Exception:
                            data = {}
                    if data.get('status') == 'success':
                        self.stdout.write(f"   ✅ Applied to {job.title} at {job.company}")
                    else:
                        self.stdout.write(f"   ❌ Failed: {data.get('message')}")
                else:
                    self.stdout.write(f"   ❌ HTTP {response.status_code}: Failed to apply to {job.title}")
            except Exception as e:
                self.stdout.write(f"   ❌ Error applying to {job.title}: {e}")

        self.stdout.write(f"\n✅ Test application creation completed!")

    def _show_applications(self, user):
        self.stdout.write(f"\n{'='*50}")
        self.stdout.write(f"EXISTING APPLICATIONS FOR {user.username}")
        self.stdout.write(f"{'='*50}")

        apps = JobApplication.objects.filter(user=user).select_related('job').order_by('-applied_at')
        if not apps.exists():
            self.stdout.write("No applications found.")
            return

        for app in apps:
            self.stdout.write(f"\n📋 Application ID: {app.id}")
            self.stdout.write(f"   Job: {app.job.title} at {app.job.company}")
            self.stdout.write(f"   Status: {app.get_status_display()}")
            self.stdout.write(f"   Method: {app.get_application_method_display()}")
            self.stdout.write(f"   Applied: {app.applied_at.strftime('%Y-%m-%d %H:%M')}")
            if app.notes:
                self.stdout.write(f"   Notes: {app.notes}")
from .test_applications import Command  # Re-export under a safe name so unittest doesn't import it
