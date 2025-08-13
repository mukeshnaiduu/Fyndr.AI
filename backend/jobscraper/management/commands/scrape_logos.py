"""
Management command to scrape company logos for existing jobs.

This command processes existing job postings and attempts to find
company logos using various strategies.
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from jobscraper.models import JobPosting
from jobscraper.logo_scraper import scrape_company_logo
import logging
import time


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Scrape company logos for existing job postings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit the number of jobs to process (for testing)'
        )
        parser.add_argument(
            '--company',
            type=str,
            help='Only process jobs from specific company'
        )
        parser.add_argument(
            '--source',
            type=str,
            help='Only process jobs from specific source'
        )
        parser.add_argument(
            '--update-existing',
            action='store_true',
            help='Update jobs that already have logos'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be processed without making changes'
        )
        parser.add_argument(
            '--delay',
            type=float,
            default=1.0,
            help='Delay between requests in seconds (default: 1.0)'
        )

    def handle(self, *args, **options):
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        
        self.stdout.write(
            self.style.SUCCESS('🔍 Starting company logo scraping...')
        )
        
        # Build query
        query = JobPosting.objects.filter(is_active=True)
        
        if options['company']:
            query = query.filter(company__icontains=options['company'])
            
        if options['source']:
            query = query.filter(source=options['source'])
            
        if not options['update_existing']:
            # Only process jobs without logos
            query = query.filter(company_logo__isnull=True)
        
        # Get job count
        total_jobs = query.count()
        
        if options['limit']:
            query = query[:options['limit']]
            total_jobs = min(total_jobs, options['limit'])
        
        self.stdout.write(f"📊 Found {total_jobs} jobs to process")
        
        if options['dry_run']:
            self.stdout.write(self.style.WARNING("🔍 DRY RUN MODE - No changes will be made"))
            
            # Show sample of jobs that would be processed
            sample_jobs = query[:10]
            for job in sample_jobs:
                status = "HAS LOGO" if job.company_logo else "NO LOGO"
                self.stdout.write(f"  • {job.company} - {job.title} [{status}]")
            
            if total_jobs > 10:
                self.stdout.write(f"  ... and {total_jobs - 10} more jobs")
            
            return
        
        # Process jobs
        processed = 0
        found_logos = 0
        failed = 0
        
        try:
            for job in query.iterator():
                try:
                    self.stdout.write(
                        f"🔍 Processing {job.company} - {job.title[:50]}...",
                        ending=''
                    )
                    
                    # Scrape company logo
                    logo_url = scrape_company_logo(job.company, job.url)
                    
                    if logo_url:
                        if not options['dry_run']:
                            with transaction.atomic():
                                job.company_logo = logo_url
                                job.save(update_fields=['company_logo'])
                        
                        found_logos += 1
                        self.stdout.write(
                            self.style.SUCCESS(f" ✅ Found logo: {logo_url[:60]}...")
                        )
                    else:
                        self.stdout.write(
                            self.style.WARNING(" ❌ No logo found")
                        )
                    
                    processed += 1
                    
                    # Rate limiting
                    if options['delay'] > 0:
                        time.sleep(options['delay'])
                    
                    # Progress update every 10 jobs
                    if processed % 10 == 0:
                        self.stdout.write(
                            f"📊 Progress: {processed}/{total_jobs} processed, "
                            f"{found_logos} logos found"
                        )
                
                except Exception as e:
                    failed += 1
                    self.stdout.write(
                        self.style.ERROR(f" ❌ Error: {str(e)}")
                    )
                    logger.error(f"Failed to process job {job.id}: {e}")
                    
        except KeyboardInterrupt:
            self.stdout.write(
                self.style.WARNING("\n⏹️ Interrupted by user")
            )
        
        # Final summary
        self.stdout.write("\n" + "="*50)
        self.stdout.write(
            self.style.SUCCESS(f"✅ Logo scraping completed!")
        )
        self.stdout.write(f"📊 Total processed: {processed}")
        self.stdout.write(f"🎯 Logos found: {found_logos}")
        self.stdout.write(f"❌ Failed: {failed}")
        
        if found_logos > 0:
            success_rate = (found_logos / processed) * 100 if processed > 0 else 0
            self.stdout.write(f"📈 Success rate: {success_rate:.1f}%")
