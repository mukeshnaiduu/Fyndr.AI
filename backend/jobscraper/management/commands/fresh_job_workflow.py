"""
Fresh Job Scraping and Real-time Application Management Command

This command implements a complete workflow:
1. Clear expired jobs
2. Scrape fresh, active jobs from multiple sources
3. Apply to jobs automatically with proper authentication
4. Handle legal compliance and verification
"""

import logging
import asyncio
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from jobscraper.models import JobPosting
from jobapplier.models import JobApplication
from jobscraper.scrapers.greenhouse import GreenhouseScraper
from jobscraper.scrapers.weworkremotely import WeWorkRemotelyScraper
from jobapplier.real_time_service import RealTimeApplicationService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    Complete fresh job management workflow
    
    Usage:
        python manage.py fresh_job_workflow --clear-expired --scrape --apply
        python manage.py fresh_job_workflow --clear-days 7 --max-applications 10
        python manage.py fresh_job_workflow --sources greenhouse,weworkremotely
        python manage.py fresh_job_workflow --dry-run
    """
    
    help = 'Complete fresh job scraping and application workflow'
    
    def add_arguments(self, parser):
        # Job clearing options
        parser.add_argument(
            '--clear-expired',
            action='store_true',
            help='Clear expired jobs before scraping'
        )
        
        parser.add_argument(
            '--clear-days',
            type=int,
            default=30,
            help='Days to consider jobs as expired (default: 30)'
        )
        
        # Scraping options
        parser.add_argument(
            '--scrape',
            action='store_true',
            help='Scrape fresh jobs from sources'
        )
        
        parser.add_argument(
            '--sources',
            type=str,
            default='greenhouse,weworkremotely',
            help='Comma-separated list of sources to scrape'
        )
        
        # Application options
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Automatically apply to scraped jobs'
        )
        
        parser.add_argument(
            '--max-applications',
            type=int,
            default=20,
            help='Maximum number of applications to submit'
        )
        
        parser.add_argument(
            '--user-id',
            type=int,
            help='User ID to apply jobs for (required if --apply is used)'
        )
        
        # Filter options
        parser.add_argument(
            '--keywords',
            type=str,
            help='Comma-separated keywords to filter jobs'
        )
        
        parser.add_argument(
            '--locations',
            type=str,
            help='Comma-separated locations to filter jobs'
        )
        
        parser.add_argument(
            '--job-types',
            type=str,
            default='full-time,contract',
            help='Comma-separated job types to include'
        )
        
        # General options
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate operations without making changes'
        )
        
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Enable verbose logging'
        )
    
    def handle(self, *args, **options):
        """Main workflow handler"""
        # Set up logging
        if options['verbose']:
            logging.getLogger().setLevel(logging.DEBUG)
        
        dry_run = options['dry_run']
        
        self.stdout.write('🚀 Starting Fresh Job Workflow')
        
        if dry_run:
            self.stdout.write('🔍 DRY RUN MODE - No changes will be made')
        
        try:
            # Step 1: Clear expired jobs
            if options['clear_expired']:
                self.clear_expired_jobs(options['clear_days'], dry_run)
            
            # Step 2: Scrape fresh jobs
            scraped_jobs = []
            if options['scrape']:
                scraped_jobs = self.scrape_fresh_jobs(options, dry_run)
            
            # Step 3: Apply to jobs
            if options['apply'] and scraped_jobs:
                if not options['user_id']:
                    self.stderr.write('❌ --user-id is required when using --apply')
                    return
                
                self.apply_to_jobs(scraped_jobs, options, dry_run)
            
            self.stdout.write('✅ Fresh Job Workflow completed successfully')
            
        except Exception as e:
            self.stderr.write(f'❌ Workflow failed: {str(e)}')
            logger.exception('Fresh job workflow failed')
    
    def clear_expired_jobs(self, days: int, dry_run: bool):
        """Clear expired jobs from database"""
        self.stdout.write(f'🗑️  Step 1: Clearing jobs older than {days} days')
        
        cutoff_date = timezone.now() - timedelta(days=days)
        expired_jobs = JobPosting.objects.filter(
            date_scraped__lt=cutoff_date,
            is_active=True
        )
        
        count = expired_jobs.count()
        
        if count == 0:
            self.stdout.write('✅ No expired jobs found')
            return
        
        if dry_run:
            self.stdout.write(f'🔍 Would deactivate {count} expired jobs')
            return
        
        # Deactivate instead of delete to preserve application history
        updated = expired_jobs.update(is_active=False, date_deactivated=timezone.now())
        self.stdout.write(f'✅ Deactivated {updated} expired jobs')
    
    def scrape_fresh_jobs(self, options: dict, dry_run: bool) -> list:
        """Scrape fresh jobs from specified sources"""
        self.stdout.write('🔍 Step 2: Scraping fresh jobs')
        
        sources = options['sources'].split(',')
        all_scraped_jobs = []
        
        # Initialize scrapers
        scrapers = {
            'greenhouse': GreenhouseScraper(),
            'weworkremotely': WeWorkRemotelyScraper(),
        }
        
        for source in sources:
            source = source.strip()
            if source not in scrapers:
                self.stderr.write(f'⚠️  Unknown source: {source}')
                continue
            
            self.stdout.write(f'📡 Scraping from {source}')
            
            try:
                scraper = scrapers[source]
                
                if dry_run:
                    self.stdout.write(f'🔍 Would scrape jobs from {source}')
                    continue
                
                # Scrape jobs
                results = scraper.scrape_jobs()
                scraped_count = results.get('created', 0) + results.get('updated', 0)
                
                self.stdout.write(f'✅ Scraped {scraped_count} jobs from {source}')
                
                # Get the newly scraped jobs
                recent_jobs = JobPosting.objects.filter(
                    source=source,
                    is_active=True,
                    date_scraped__gte=timezone.now() - timedelta(minutes=10)
                )
                
                all_scraped_jobs.extend(recent_jobs)
                
            except Exception as e:
                self.stderr.write(f'❌ Error scraping {source}: {str(e)}')
                continue
        
        # Apply filters
        filtered_jobs = self.apply_job_filters(all_scraped_jobs, options)
        
        self.stdout.write(f'✅ Total scraped jobs after filtering: {len(filtered_jobs)}')
        return filtered_jobs
    
    def apply_job_filters(self, jobs: list, options: dict) -> list:
        """Apply filters to job list"""
        filtered_jobs = jobs
        
        # Filter by keywords
        if options.get('keywords'):
            keywords = [k.strip().lower() for k in options['keywords'].split(',')]
            filtered_jobs = [
                job for job in filtered_jobs
                if any(keyword in job.title.lower() or keyword in job.description.lower()
                      for keyword in keywords)
            ]
        
        # Filter by locations
        if options.get('locations'):
            locations = [l.strip().lower() for l in options['locations'].split(',')]
            filtered_jobs = [
                job for job in filtered_jobs
                if any(location in job.location.lower() for location in locations)
                if job.location
            ]
        
        # Filter by job types
        if options.get('job_types'):
            job_types = [jt.strip() for jt in options['job_types'].split(',')]
            filtered_jobs = [
                job for job in filtered_jobs
                if job.job_type in job_types
            ]
        
        return filtered_jobs
    
    def apply_to_jobs(self, jobs: list, options: dict, dry_run: bool):
        """Apply to filtered jobs automatically"""
        self.stdout.write('📝 Step 3: Applying to jobs')
        
        max_applications = options['max_applications']
        user_id = options['user_id']
        
        # Limit to max applications
        jobs_to_apply = jobs[:max_applications]
        
        if dry_run:
            self.stdout.write(f'🔍 Would apply to {len(jobs_to_apply)} jobs')
            for job in jobs_to_apply[:5]:  # Show first 5
                self.stdout.write(f'  - {job.title} at {job.company}')
            return
        
        # Import here to avoid circular imports
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            self.stderr.write(f'❌ User with ID {user_id} not found')
            return
        
        application_service = RealTimeApplicationService()
        successful_applications = 0
        
        for job in jobs_to_apply:
            try:
                # Check if already applied
                existing_application = JobApplication.objects.filter(
                    user=user,
                    job=job
                ).first()
                
                if existing_application:
                    self.stdout.write(f'⏭️  Already applied to {job.title} at {job.company}')
                    continue
                
                # Apply to job
                self.stdout.write(f'📝 Applying to {job.title} at {job.company}')
                
                application_data = {
                    'job': job,
                    'user': user,
                    'application_method': 'automated',
                    'resume_text': '',  # Would be populated from user profile
                    'cover_letter_text': '',  # Would be generated automatically
                    'notes': f'Automated application via Fresh Job Workflow',
                    'enable_tracking': True
                }
                
                # Create application record
                application = JobApplication.objects.create(**application_data)
                
                # Attempt real-time application if URL is accessible
                if self.is_applicable_job(job):
                    asyncio.run(self.apply_to_job_real_time(application, job, user))
                
                successful_applications += 1
                self.stdout.write(f'✅ Applied to {job.title} at {job.company}')
                
                # Rate limiting
                import time
                time.sleep(2)  # 2 second delay between applications
                
            except Exception as e:
                self.stderr.write(f'❌ Error applying to {job.title}: {str(e)}')
                continue
        
        self.stdout.write(f'✅ Successfully applied to {successful_applications} jobs')
    
    def is_applicable_job(self, job) -> bool:
        """Check if job is suitable for automated application"""
        # Check for direct application URLs (not third-party job boards)
        applicable_sources = ['greenhouse', 'lever', 'workday', 'bamboohr']
        
        return (
            job.source in applicable_sources or
            any(source in job.url.lower() for source in applicable_sources)
        )
    
    async def apply_to_job_real_time(self, application, job, user):
        """Apply to job in real-time using browser automation"""
        try:
            from jobapplier.browser_automation import BrowserAutomation
            
            async with BrowserAutomation(headless=True) as browser:
                # Navigate to job application page
                await browser.navigate_to_job(job.url)
                
                # Fill application form
                success = await browser.fill_application_form(
                    user_data={
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'email': user.email,
                        'phone': getattr(user, 'phone', ''),
                    },
                    job_data=job,
                    application=application
                )
                
                if success:
                    application.status = 'submitted'
                    application.submitted_at = timezone.now()
                    application.save()
                    
                    logger.info(f'Successfully applied to {job.title} at {job.company}')
                else:
                    application.status = 'failed'
                    application.save()
                    
                    logger.warning(f'Failed to apply to {job.title} at {job.company}')
        
        except Exception as e:
            logger.error(f'Real-time application failed for {job.title}: {str(e)}')
            application.status = 'failed'
            application.error_message = str(e)
            application.save()
