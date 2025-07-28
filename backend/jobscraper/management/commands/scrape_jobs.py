import logging
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from jobscraper.scrapers.greenhouse import GreenhouseScraper
from jobscraper.scrapers.greenhouse_india import GreenhouseIndiaScraper
from jobscraper.scrapers.weworkremotely import WeWorkRemotelyScraper
# from jobscraper.scrapers.naukri import NaukriScraper  # Temporarily disabled
from jobscraper.services import JobScrapingService


# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    Django management command to scrape jobs from various sources.
    
    Usage:
        python manage.py scrape_jobs --all                    # Run all scrapers
        python manage.py scrape_jobs --source greenhouse      # Run specific scraper
        python manage.py scrape_jobs --source weworkremotely  # Run specific scraper
        python manage.py scrape_jobs --deactivate-old         # Deactivate old jobs too
    """
    
    help = 'Scrape job postings from various sources and store them in the database'
    
    def add_arguments(self, parser):
        """Add command line arguments."""
        parser.add_argument(
            '--source',
            type=str,
            help='Specific source to scrape (greenhouse, greenhouse_india, weworkremotely)',
            choices=['greenhouse', 'greenhouse_india', 'weworkremotely']
        )
        
        parser.add_argument(
            '--all',
            action='store_true',
            help='Run all available scrapers'
        )
        
        parser.add_argument(
            '--deactivate-old',
            action='store_true',
            help='Deactivate old job postings after scraping'
        )
        
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run scraping but don\'t save to database'
        )
        
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Enable verbose logging'
        )
    
    def handle(self, *args, **options):
        """Main command handler."""
        # Set logging level
        if options['verbose']:
            logging.getLogger().setLevel(logging.DEBUG)
            logging.getLogger('jobscraper').setLevel(logging.DEBUG)
        
        self.stdout.write('Starting job scraping...')
        
        # Determine which scrapers to run
        scrapers_to_run = self._get_scrapers_to_run(options)
        
        if not scrapers_to_run:
            raise CommandError(
                'No scrapers specified. Use --all or --source <source_name>'
            )
        
        # Run scrapers
        total_results = {}
        for scraper_name, scraper in scrapers_to_run.items():
            self.stdout.write(f'\\nRunning {scraper_name} scraper...')
            
            try:
                if options['dry_run']:
                    results = self._dry_run_scraper(scraper)
                else:
                    results = scraper.scrape_jobs()
                
                total_results[scraper_name] = results
                self._display_results(scraper_name, results)
                
            except Exception as e:
                self.stderr.write(f'Error running {scraper_name} scraper: {str(e)}')
                logger.exception(f'Scraper {scraper_name} failed')
                continue
        
        # Deactivate old jobs if requested
        if options['deactivate_old'] and not options['dry_run']:
            self._deactivate_old_jobs(scrapers_to_run.keys())
        
        # Display summary
        self._display_summary(total_results)
        
        self.stdout.write(
            self.style.SUCCESS('Job scraping completed successfully!')
        )
    
    def _get_scrapers_to_run(self, options):
        """
        Determine which scrapers to run based on command options.
        
        Returns:
            Dictionary of {scraper_name: scraper_instance}
        """
        available_scrapers = {
            'greenhouse': GreenhouseScraper(),
            'greenhouse_india': GreenhouseIndiaScraper(),
            'weworkremotely': WeWorkRemotelyScraper(),
            # 'naukri': NaukriScraper(),  # Temporarily disabled
        }
        
        if options['all']:
            return available_scrapers
        elif options['source']:
            source = options['source']
            if source in available_scrapers:
                return {source: available_scrapers[source]}
            else:
                raise CommandError(f'Unknown source: {source}')
        else:
            return {}
    
    def _dry_run_scraper(self, scraper):
        """
        Run scraper in dry-run mode (don't save to database).
        
        Returns:
            Mock results dictionary
        """
        self.stdout.write('  [DRY RUN] Fetching job data...')
        
        # Fetch and parse data but don't save
        raw_data = scraper.fetch_data_for_scraping()
        job_list = scraper.parse_data(raw_data)
        
        normalized_jobs = []
        for job_data in job_list:
            try:
                normalized_job = scraper.normalize_job(job_data)
                normalized_jobs.append(normalized_job)
            except Exception as e:
                logger.warning(f"Failed to normalize job: {str(e)}")
                continue
        
        # Return mock results
        return {
            'total': len(normalized_jobs),
            'created': len(normalized_jobs),  # Would be created
            'updated': 0,
            'skipped': 0,
            'errors': 0
        }
    
    def _deactivate_old_jobs(self, scraper_names):
        """Deactivate old jobs for the scrapers that were run."""
        self.stdout.write('\\nDeactivating old job postings...')
        
        service = JobScrapingService()
        total_deactivated = 0
        
        for scraper_name in scraper_names:
            try:
                count = service.deactivate_old_jobs(scraper_name, days_old=30)
                total_deactivated += count
                self.stdout.write(f'  {scraper_name}: {count} jobs deactivated')
            except Exception as e:
                self.stderr.write(f'Error deactivating jobs for {scraper_name}: {str(e)}')
        
        self.stdout.write(f'Total deactivated: {total_deactivated}')
    
    def _display_results(self, scraper_name, results):
        """Display results for a single scraper."""
        self.stdout.write(f'  Results for {scraper_name}:')
        self.stdout.write(f'    Total processed: {results.get("total", 0)}')
        self.stdout.write(f'    Created: {results.get("created", 0)}')
        self.stdout.write(f'    Updated: {results.get("updated", 0)}')
        self.stdout.write(f'    Skipped: {results.get("skipped", 0)}')
        self.stdout.write(f'    Errors: {results.get("errors", 0)}')
    
    def _display_summary(self, total_results):
        """Display overall summary of all scrapers."""
        if not total_results:
            return
        
        self.stdout.write('\\n' + '='*50)
        self.stdout.write('SUMMARY')
        self.stdout.write('='*50)
        
        grand_total = sum(r.get('total', 0) for r in total_results.values())
        total_created = sum(r.get('created', 0) for r in total_results.values())
        total_updated = sum(r.get('updated', 0) for r in total_results.values())
        total_skipped = sum(r.get('skipped', 0) for r in total_results.values())
        total_errors = sum(r.get('errors', 0) for r in total_results.values())
        
        self.stdout.write(f'Total jobs processed: {grand_total}')
        self.stdout.write(f'Total created: {total_created}')
        self.stdout.write(f'Total updated: {total_updated}')
        self.stdout.write(f'Total skipped: {total_skipped}')
        self.stdout.write(f'Total errors: {total_errors}')
        
        # Success rate
        if grand_total > 0:
            success_rate = ((total_created + total_updated) / grand_total) * 100
            self.stdout.write(f'Success rate: {success_rate:.1f}%')
        
        # Display stats from service
        try:
            service = JobScrapingService()
            stats = service.get_job_stats()
            
            self.stdout.write('\\nDatabase Statistics:')
            self.stdout.write(f'  Total jobs in database: {stats.get("total_jobs", 0)}')
            self.stdout.write(f'  Active jobs: {stats.get("active_jobs", 0)}')
            self.stdout.write(f'  Unique companies: {stats.get("unique_companies", 0)}')
            self.stdout.write(f'  Jobs added in last 7 days: {stats.get("recent_jobs", 0)}')
            
        except Exception as e:
            logger.debug(f'Could not fetch database stats: {str(e)}')
