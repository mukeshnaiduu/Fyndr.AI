import logging
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from jobscraper.models import JobPosting
from jobapplier.models import UserProfile, Application
from jobapplier.services import apply_to_job

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Apply to jobs automatically using specified method and source'

    def add_arguments(self, parser):
        parser.add_argument(
            '--method',
            type=str,
            choices=['API', 'Browser', 'Redirect'],
            help='Application method to use (API, Browser, Redirect)',
            required=True
        )
        parser.add_argument(
            '--source',
            type=str,
            help='Job source to filter by (e.g., greenhouse, lever, workday)',
            required=True
        )
        parser.add_argument(
            '--user-id',
            type=int,
            help='Specific user ID to apply jobs for',
            required=False
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Maximum number of jobs to apply to (default: 10)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without actually applying'
        )

    def handle(self, *args, **options):
        method = options['method']
        source = options['source']
        user_id = options.get('user_id')
        limit = options['limit']
        dry_run = options['dry_run']

        self.stdout.write(
            self.style.SUCCESS(
                f"Starting job application process..."
            )
        )
        self.stdout.write(f"Method: {method}")
        self.stdout.write(f"Source: {source}")
        self.stdout.write(f"Limit: {limit}")
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN MODE - No applications will be submitted"))

        try:
            # Get user profile(s)
            if user_id:
                user_profiles = UserProfile.objects.filter(user_id=user_id)
                if not user_profiles.exists():
                    raise CommandError(f"User profile for user ID {user_id} not found")
            else:
                user_profiles = UserProfile.objects.all()
                if not user_profiles.exists():
                    raise CommandError("No user profiles found. Please create at least one user profile.")

            self.stdout.write(f"Found {user_profiles.count()} user profile(s)")

            total_applications = 0
            total_errors = 0

            for user_profile in user_profiles:
                self.stdout.write(f"\nProcessing applications for: {user_profile.full_name}")
                
                # Get jobs that match the source and haven't been applied to by this user
                applied_job_ids = Application.objects.filter(
                    user_profile=user_profile
                ).values_list('job_id', flat=True)
                
                jobs = JobPosting.objects.filter(
                    source__iexact=source,
                    is_active=True
                ).exclude(
                    id__in=applied_job_ids
                ).order_by('-date_posted')[:limit]

                if not jobs.exists():
                    self.stdout.write(
                        self.style.WARNING(
                            f"No unapplied jobs found for source '{source}' and user {user_profile.full_name}"
                        )
                    )
                    continue

                self.stdout.write(f"Found {jobs.count()} jobs to apply to")

                for job in jobs:
                    try:
                        self.stdout.write(f"  Processing: {job.title} at {job.company}")
                        
                        if dry_run:
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f"    [DRY RUN] Would apply via {method} to: {job.url}"
                                )
                            )
                            continue

                        # Apply to the job
                        with transaction.atomic():
                            result = apply_to_job(job, user_profile, method)
                            
                            if result['success']:
                                total_applications += 1
                                self.stdout.write(
                                    self.style.SUCCESS(
                                        f"    ✓ Applied successfully! Confirmation: {result.get('confirmation_number', 'N/A')}"
                                    )
                                )
                            else:
                                total_errors += 1
                                self.stdout.write(
                                    self.style.ERROR(
                                        f"    ✗ Application failed: {result.get('error', 'Unknown error')}"
                                    )
                                )

                    except Exception as e:
                        total_errors += 1
                        logger.error(f"Error applying to job {job.id}: {str(e)}")
                        self.stdout.write(
                            self.style.ERROR(f"    ✗ Unexpected error: {str(e)}")
                        )

            # Summary
            self.stdout.write("\n" + "="*50)
            if dry_run:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"DRY RUN COMPLETE - Found {total_applications + total_errors} jobs that would be processed"
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Job application process completed!"
                    )
                )
                self.stdout.write(f"✓ Successful applications: {total_applications}")
                self.stdout.write(f"✗ Failed applications: {total_errors}")
                self.stdout.write(f"Total processed: {total_applications + total_errors}")

        except Exception as e:
            logger.error(f"Command execution failed: {str(e)}")
            raise CommandError(f"Command failed: {str(e)}")
