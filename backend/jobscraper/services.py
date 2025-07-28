import logging
from typing import List, Dict, Any
from django.db import transaction, IntegrityError
from .models import JobPosting


logger = logging.getLogger(__name__)


class JobScrapingService:
    """
    Service layer for saving scraped job data to the database.
    
    Handles deduplication, validation, and database operations for job postings.
    """
    
    def save_jobs(self, job_data_list: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Save a list of normalized job dictionaries to the database.
        
        Args:
            job_data_list: List of normalized job dictionaries
            
        Returns:
            Dictionary with counts: {'created': 5, 'updated': 2, 'skipped': 1, 'errors': 0}
        """
        results = {
            'created': 0,
            'updated': 0,
            'skipped': 0,
            'errors': 0,
            'total': len(job_data_list)
        }
        
        for job_data in job_data_list:
            try:
                result = self._save_single_job(job_data)
                results[result] += 1
                
            except Exception as e:
                logger.error(f"Error saving job {job_data.get('title', 'Unknown')}: {str(e)}")
                results['errors'] += 1
        
        logger.info(f"Job saving results: {results}")
        return results
    
    def _save_single_job(self, job_data: Dict[str, Any]) -> str:
        """
        Save a single job to the database.
        
        Args:
            job_data: Normalized job dictionary
            
        Returns:
            String indicating the operation: 'created', 'updated', or 'skipped'
        """
        # Validate required fields
        if not self._validate_job_data(job_data):
            logger.warning(f"Invalid job data: {job_data}")
            return 'skipped'
        
        external_id = job_data.get('external_id')
        source = job_data.get('source')
        
        if not external_id or not source:
            logger.warning(f"Missing external_id or source in job data: {job_data}")
            return 'skipped'
        
        try:
            with transaction.atomic():
                # Try to get existing job
                existing_job = JobPosting.objects.filter(
                    external_id=external_id,
                    source=source
                ).first()
                
                if existing_job:
                    # Check if we should update
                    if self._should_update_job(existing_job, job_data):
                        self._update_job(existing_job, job_data)
                        return 'updated'
                    else:
                        return 'skipped'
                else:
                    # Create new job
                    self._create_job(job_data)
                    return 'created'
                    
        except IntegrityError as e:
            # Handle race condition where job was created between check and creation
            logger.debug(f"IntegrityError (likely duplicate): {str(e)}")
            return 'skipped'
    
    def _validate_job_data(self, job_data: Dict[str, Any]) -> bool:
        """
        Validate that job data contains required fields.
        
        Args:
            job_data: Job dictionary to validate
            
        Returns:
            True if valid, False otherwise
        """
        required_fields = ['title', 'company', 'url', 'source']
        
        for field in required_fields:
            if not job_data.get(field):
                logger.warning(f"Missing required field '{field}' in job data")
                return False
        
        # Validate URL format
        url = job_data.get('url', '')
        if not url.startswith(('http://', 'https://')):
            logger.warning(f"Invalid URL format: {url}")
            return False
        
        return True
    
    def _should_update_job(self, existing_job: JobPosting, new_data: Dict[str, Any]) -> bool:
        """
        Determine if an existing job should be updated with new data.
        
        Args:
            existing_job: Existing JobPosting instance
            new_data: New job data dictionary
            
        Returns:
            True if job should be updated, False otherwise
        """
        # Update if the description has changed significantly
        new_description = new_data.get('description', '')
        old_description = existing_job.description or ''
        
        # Simple check: update if descriptions differ by more than 10%
        if abs(len(new_description) - len(old_description)) > len(old_description) * 0.1:
            return True
        
        # Update if title changed
        if new_data.get('title') != existing_job.title:
            return True
        
        # Update if location changed
        if new_data.get('location') != existing_job.location:
            return True
        
        # Update if it's been more than 7 days since last update
        from django.utils import timezone
        if existing_job.updated_at < timezone.now() - timezone.timedelta(days=7):
            return True
        
        return False
    
    def _create_job(self, job_data: Dict[str, Any]) -> JobPosting:
        """
        Create a new JobPosting from job data.
        
        Args:
            job_data: Normalized job dictionary
            
        Returns:
            Created JobPosting instance
        """
        job = JobPosting(
            external_id=job_data.get('external_id'),
            title=job_data.get('title'),
            company=job_data.get('company'),
            location=job_data.get('location'),
            description=job_data.get('description', ''),
            url=job_data.get('url'),
            source=job_data.get('source'),
            date_posted=job_data.get('date_posted'),
            date_scraped=job_data.get('date_scraped'),
        )
        
        job.save()
        logger.debug(f"Created new job: {job.title} at {job.company}")
        return job
    
    def _update_job(self, existing_job: JobPosting, job_data: Dict[str, Any]) -> JobPosting:
        """
        Update an existing JobPosting with new data.
        
        Args:
            existing_job: Existing JobPosting instance
            job_data: New job data dictionary
            
        Returns:
            Updated JobPosting instance
        """
        # Update fields that might have changed
        existing_job.title = job_data.get('title', existing_job.title)
        existing_job.location = job_data.get('location', existing_job.location)
        existing_job.description = job_data.get('description', existing_job.description)
        existing_job.date_posted = job_data.get('date_posted', existing_job.date_posted)
        existing_job.date_scraped = job_data.get('date_scraped', existing_job.date_scraped)
        
        # Ensure job is marked as active (in case it was previously deactivated)
        existing_job.is_active = True
        
        existing_job.save()
        logger.debug(f"Updated job: {existing_job.title} at {existing_job.company}")
        return existing_job
    
    def deactivate_old_jobs(self, source: str, days_old: int = 30) -> int:
        """
        Deactivate jobs that haven't been seen in recent scrapes.
        
        Args:
            source: Source identifier to filter jobs
            days_old: Number of days since last scrape to consider "old"
            
        Returns:
            Number of jobs deactivated
        """
        from django.utils import timezone
        
        cutoff_date = timezone.now() - timezone.timedelta(days=days_old)
        
        old_jobs = JobPosting.objects.filter(
            source=source,
            is_active=True,
            date_scraped__lt=cutoff_date
        )
        
        count = old_jobs.count()
        old_jobs.update(is_active=False)
        
        logger.info(f"Deactivated {count} old jobs from {source}")
        return count
    
    def get_job_stats(self, source: str = None) -> Dict[str, Any]:
        """
        Get statistics about scraped jobs.
        
        Args:
            source: Optional source filter
            
        Returns:
            Dictionary with job statistics
        """
        queryset = JobPosting.objects.all()
        
        if source:
            queryset = queryset.filter(source=source)
        
        stats = {
            'total_jobs': queryset.count(),
            'active_jobs': queryset.filter(is_active=True).count(),
            'unique_companies': queryset.values('company').distinct().count(),
            'sources': list(queryset.values_list('source', flat=True).distinct()),
        }
        
        # Recent activity (last 7 days)
        from django.utils import timezone
        recent_date = timezone.now() - timezone.timedelta(days=7)
        stats['recent_jobs'] = queryset.filter(date_scraped__gte=recent_date).count()
        
        return stats
