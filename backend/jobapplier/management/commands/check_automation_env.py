from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from fyndr_auth.models import JobSeekerProfile

class Command(BaseCommand):
    help = "Check that automation environment prerequisites are available (Playwright, profile docs)."

    def handle(self, *args, **options):
        ok = True
        # Check Playwright import
        try:
            import playwright  # noqa: F401
            self.stdout.write(self.style.SUCCESS("Playwright Python package installed."))
        except Exception as e:
            ok = False
            self.stdout.write(self.style.ERROR(f"Playwright not installed: {e}"))
            self.stdout.write("Install with: pip install playwright && playwright install chromium")

        # Check at least one user profile exists with resume data
        has_profile = JobSeekerProfile.objects.filter(resume_data__isnull=False).exists()
        if has_profile:
            self.stdout.write(self.style.SUCCESS("JobSeekerProfile with resume data is present."))
        else:
            self.stdout.write(self.style.WARNING("No JobSeekerProfile with resume_data found. Browser upload may skip."))

        if ok:
            self.stdout.write(self.style.SUCCESS("Automation environment check complete."))
        else:
            self.stdout.write(self.style.ERROR("Automation environment has issues. See messages above."))
