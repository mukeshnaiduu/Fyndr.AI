import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from jobscraper.models import JobPosting
from jobapplier.models import JobApplication

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    Clear expired or old job postings from the database.
    
    Usage:
        python manage.py clear_expired_jobs --days 30        # Remove jobs older than 30 days
        python manage.py clear_expired_jobs --all            # Remove all jobs
        python manage.py clear_expired_jobs --inactive       # Remove only inactive jobs
        python manage.py clear_expired_jobs --dry-run        # Preview what would be deleted
    """
    
    help = 'Clear expired job postings from the database'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Remove jobs older than specified days (default: 30)'
        )
        
        parser.add_argument(
            '--all',
            action='store_true',
            help='Remove all job postings (use with caution!)'
        )
        
        parser.add_argument(
            '--inactive',
            action='store_true',
            help='Remove only inactive job postings'
        )
        
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )
        
        parser.add_argument(
            '--keep-applications',
            action='store_true',
            help='Keep jobs that have applications'
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Build query
        jobs_query = JobPosting.objects.all()
        
        if options['all']:
            self.stdout.write('🗑️  Targeting ALL job postings for removal')
        elif options['inactive']:
            jobs_query = jobs_query.filter(is_active=False)
            self.stdout.write('🗑️  Targeting INACTIVE job postings for removal')
        else:
            cutoff_date = timezone.now() - timedelta(days=options['days'])
            jobs_query = jobs_query.filter(date_scraped__lt=cutoff_date)
            self.stdout.write(f'🗑️  Targeting jobs older than {options["days"]} days for removal')
        
        # Optionally keep jobs with applications
        if options['keep_applications']:
            # Get job IDs that have applications
            applied_job_ids = JobApplication.objects.values_list('job_id', flat=True).distinct()
            jobs_query = jobs_query.exclude(id__in=applied_job_ids)
            self.stdout.write('✅ Keeping jobs that have applications')
        
        # Get count before deletion
        total_count = jobs_query.count()
        
        if total_count == 0:
            self.stdout.write('✅ No jobs found matching the criteria')
            return
        
        # Show what will be deleted
        if dry_run:
            self.stdout.write(f'🔍 DRY RUN: Would delete {total_count} job postings')
            
            # Show some examples
            sample_jobs = jobs_query[:5]
            for job in sample_jobs:
                self.stdout.write(f'  - {job.title} at {job.company} (scraped: {job.date_scraped})')
            
            if total_count > 5:
                self.stdout.write(f'  ... and {total_count - 5} more jobs')
            
            return
        
        # Confirm deletion for large numbers
        if total_count > 100 and not options['all']:
            confirm = input(f'⚠️  About to delete {total_count} jobs. Continue? (yes/no): ')
            if confirm.lower() != 'yes':
                self.stdout.write('❌ Operation cancelled')
                return
        
        # Perform deletion
        try:
            deleted_count, deleted_details = jobs_query.delete()
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Successfully deleted {deleted_count} job postings')
            )
            
            # Show detailed breakdown
            for model, count in deleted_details.items():
                if count > 0:
                    self.stdout.write(f'  - {model}: {count} records')
            
        except Exception as e:
            self.stderr.write(f'❌ Error deleting jobs: {str(e)}')
            logger.exception('Failed to delete expired jobs')
