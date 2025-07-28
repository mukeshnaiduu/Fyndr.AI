"""
Tasks module for job scraping operations.

This module provides task functions that can be used with Celery
or other task queue systems for scheduling automated job scraping.

For now, these are simple functions that can be called directly.
In Phase 2, they can be decorated with @shared_task for Celery integration.
"""

import logging
from typing import Dict, List, Optional
from .scrapers.greenhouse import GreenhouseScraper
from .scrapers.weworkremotely import WeWorkRemotelyScraper
from .services import JobScrapingService


logger = logging.getLogger(__name__)


def scrape_all_sources() -> Dict[str, Dict[str, int]]:
    """
    Scrape jobs from all available sources.
    
    This function can be scheduled to run periodically (e.g., daily).
    
    Returns:
        Dictionary with results from each scraper:
        {
            'greenhouse': {'created': 5, 'updated': 2, ...},
            'weworkremotely': {'created': 3, 'updated': 1, ...}
        }
    """
    logger.info("Starting scheduled scraping of all sources")
    
    results = {}
    
    # List of all available scrapers
    scrapers = {
        'greenhouse': GreenhouseScraper(),
        'weworkremotely': WeWorkRemotelyScraper(),
    }
    
    for source_name, scraper in scrapers.items():
        try:
            logger.info(f"Scraping {source_name}")
            source_results = scraper.scrape_jobs()
            results[source_name] = source_results
            
            logger.info(f"Completed {source_name}: {source_results}")
            
        except Exception as e:
            logger.error(f"Error scraping {source_name}: {str(e)}")
            results[source_name] = {'error': str(e)}
    
    # Cleanup old jobs
    try:
        cleanup_results = cleanup_old_jobs(days_old=30)
        results['cleanup'] = cleanup_results
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")
        results['cleanup'] = {'error': str(e)}
    
    logger.info(f"Scheduled scraping completed: {results}")
    return results


def scrape_specific_source(source_name: str, **kwargs) -> Dict[str, int]:
    """
    Scrape jobs from a specific source.
    
    Args:
        source_name: Name of the source to scrape ('greenhouse', 'weworkremotely')
        **kwargs: Additional arguments to pass to the scraper
    
    Returns:
        Dictionary with scraping results
    """
    logger.info(f"Starting scraping of {source_name}")
    
    scrapers = {
        'greenhouse': GreenhouseScraper,
        'weworkremotely': WeWorkRemotelyScraper,
    }
    
    if source_name not in scrapers:
        raise ValueError(f"Unknown source: {source_name}")
    
    scraper_class = scrapers[source_name]
    scraper = scraper_class()
    
    try:
        results = scraper.scrape_jobs(**kwargs)
        logger.info(f"Completed scraping {source_name}: {results}")
        return results
    except Exception as e:
        logger.error(f"Error scraping {source_name}: {str(e)}")
        raise


def scrape_greenhouse_companies(company_names: List[str]) -> Dict[str, int]:
    """
    Scrape specific companies from Greenhouse.
    
    Args:
        company_names: List of company identifiers to scrape
    
    Returns:
        Dictionary with scraping results
    """
    logger.info(f"Scraping Greenhouse companies: {company_names}")
    
    scraper = GreenhouseScraper(company_names=company_names)
    
    try:
        results = scraper.scrape_jobs()
        logger.info(f"Completed Greenhouse company scraping: {results}")
        return results
    except Exception as e:
        logger.error(f"Error scraping Greenhouse companies: {str(e)}")
        raise


def cleanup_old_jobs(days_old: int = 30, source: Optional[str] = None) -> Dict[str, int]:
    """
    Deactivate old job postings that haven't been seen in recent scrapes.
    
    Args:
        days_old: Number of days since last scrape to consider "old"
        source: Optional source filter. If None, cleans all sources.
    
    Returns:
        Dictionary with cleanup results
    """
    logger.info(f"Cleaning up jobs older than {days_old} days")
    
    service = JobScrapingService()
    
    if source:
        # Clean specific source
        deactivated = service.deactivate_old_jobs(source, days_old)
        results = {source: deactivated}
    else:
        # Clean all sources
        sources = ['greenhouse', 'weworkremotely']
        results = {}
        
        for src in sources:
            try:
                deactivated = service.deactivate_old_jobs(src, days_old)
                results[src] = deactivated
            except Exception as e:
                logger.error(f"Error cleaning {src}: {str(e)}")
                results[src] = 0
    
    total_deactivated = sum(results.values())
    logger.info(f"Cleanup completed. Total deactivated: {total_deactivated}")
    
    return {
        'total_deactivated': total_deactivated,
        'by_source': results
    }


def get_scraping_statistics() -> Dict[str, any]:
    """
    Get comprehensive statistics about scraped jobs.
    
    Returns:
        Dictionary with detailed statistics
    """
    logger.info("Generating scraping statistics")
    
    service = JobScrapingService()
    
    try:
        # Overall stats
        overall_stats = service.get_job_stats()
        
        # Per-source stats
        source_stats = {}
        for source in ['greenhouse', 'weworkremotely']:
            source_stats[source] = service.get_job_stats(source=source)
        
        results = {
            'overall': overall_stats,
            'by_source': source_stats,
            'timestamp': logging.time.time()
        }
        
        logger.info(f"Statistics generated: {results}")
        return results
        
    except Exception as e:
        logger.error(f"Error generating statistics: {str(e)}")
        raise


# Future Celery task definitions (commented out for Phase 1)
# When ready to integrate with Celery, uncomment and modify as needed:

# from celery import shared_task
# 
# @shared_task
# def scrape_all_sources_task():
#     """Celery task to scrape all sources."""
#     return scrape_all_sources()
# 
# @shared_task
# def scrape_specific_source_task(source_name: str, **kwargs):
#     """Celery task to scrape a specific source."""
#     return scrape_specific_source(source_name, **kwargs)
# 
# @shared_task
# def cleanup_old_jobs_task(days_old: int = 30):
#     """Celery task to cleanup old jobs."""
#     return cleanup_old_jobs(days_old)


# Example cron job configurations:
# Add these to your crontab or equivalent scheduler:
#
# # Scrape all sources daily at 2 AM
# 0 2 * * * cd /path/to/project && python manage.py scrape_jobs --all
#
# # Cleanup old jobs weekly on Sunday at 3 AM
# 0 3 * * 0 cd /path/to/project && python manage.py scrape_jobs --deactivate-old
#
# # Scrape only Greenhouse every 12 hours
# 0 */12 * * * cd /path/to/project && python manage.py scrape_jobs --source greenhouse
