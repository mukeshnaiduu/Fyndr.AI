import logging
import requests
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import time


logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """
    Abstract base class for all job scrapers.
    
    Provides common functionality for fetching, parsing, normalizing,
    and saving job data. Concrete scrapers should inherit from this
    and implement the abstract methods.
    """
    
    def __init__(self, source_name: str, base_url: str = None):
        """
        Initialize the scraper.
        
        Args:
            source_name: Identifier for this source (e.g., 'greenhouse')
            base_url: Base URL for the job source (optional)
        """
        self.source_name = source_name
        self.base_url = base_url
        self.session = requests.Session()
        
        # Set common headers to appear more like a real browser
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Rate limiting
        self.request_delay = 1  # seconds between requests
        self.last_request_time = 0
    
    def fetch_data(self, url: str, **kwargs) -> Any:
        """
        Fetch raw data from a URL with rate limiting and error handling.
        
        Args:
            url: URL to fetch
            **kwargs: Additional arguments for requests
            
        Returns:
            Response object or parsed JSON data
        """
        # Rate limiting
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.request_delay:
            time.sleep(self.request_delay - time_since_last)
        
        try:
            logger.info(f"Fetching data from: {url}")
            response = self.session.get(url, timeout=30, **kwargs)
            response.raise_for_status()
            
            self.last_request_time = time.time()
            
            # Try to return JSON if possible, otherwise return response
            try:
                return response.json()
            except ValueError:
                return response
                
        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {str(e)}")
            raise
    
    @abstractmethod
    def parse_data(self, raw_data: Any) -> List[Dict[str, Any]]:
        """
        Parse raw data into a list of job dictionaries.
        
        Args:
            raw_data: Raw data from fetch_data()
            
        Returns:
            List of job dictionaries with source-specific fields
        """
        pass
    
    def normalize_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize a job dictionary to the standard schema.
        
        Args:
            job_data: Raw job data from parse_data()
            
        Returns:
            Normalized job dictionary with standard fields
        """
        # Standard schema fields
        normalized = {
            'external_id': self._extract_external_id(job_data),
            'title': self._extract_title(job_data),
            'company': self._extract_company(job_data),
            'location': self._extract_location(job_data),
            'description': self._extract_description(job_data),
            'url': self._extract_url(job_data),
            'source': self.source_name,
            'date_posted': self._extract_date_posted(job_data),
            'date_scraped': datetime.now().date(),
        }
        
        # Remove None values
        return {k: v for k, v in normalized.items() if v is not None}
    
    @abstractmethod
    def _extract_external_id(self, job_data: Dict[str, Any]) -> str:
        """Extract or generate external_id from job data."""
        pass
    
    @abstractmethod
    def _extract_title(self, job_data: Dict[str, Any]) -> str:
        """Extract job title from job data."""
        pass
    
    @abstractmethod
    def _extract_company(self, job_data: Dict[str, Any]) -> str:
        """Extract company name from job data."""
        pass
    
    @abstractmethod
    def _extract_location(self, job_data: Dict[str, Any]) -> Optional[str]:
        """Extract location from job data."""
        pass
    
    @abstractmethod
    def _extract_description(self, job_data: Dict[str, Any]) -> str:
        """Extract job description from job data."""
        pass
    
    @abstractmethod
    def _extract_url(self, job_data: Dict[str, Any]) -> str:
        """Extract job URL from job data."""
        pass
    
    @abstractmethod
    def _extract_date_posted(self, job_data: Dict[str, Any]) -> Optional[date]:
        """Extract posting date from job data."""
        pass
    
    def save_jobs(self, jobs: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Save normalized jobs to database using the service layer.
        
        Args:
            jobs: List of normalized job dictionaries
            
        Returns:
            Dictionary with counts of created/updated/skipped jobs
        """
        from ..services import JobScrapingService
        
        service = JobScrapingService()
        return service.save_jobs(jobs)
    
    def scrape_jobs(self, **kwargs) -> Dict[str, int]:
        """
        Main method to scrape jobs. Template method pattern.
        
        Args:
            **kwargs: Scraper-specific parameters
            
        Returns:
            Dictionary with scraping results and statistics
        """
        logger.info(f"Starting job scraping from {self.source_name}")
        
        try:
            # Step 1: Fetch raw data
            raw_data = self.fetch_data_for_scraping(**kwargs)
            
            # Step 2: Parse into job dictionaries
            job_list = self.parse_data(raw_data)
            logger.info(f"Parsed {len(job_list)} jobs from {self.source_name}")
            
            # Step 3: Normalize jobs
            normalized_jobs = []
            for job_data in job_list:
                try:
                    normalized_job = self.normalize_job(job_data)
                    normalized_jobs.append(normalized_job)
                except Exception as e:
                    logger.warning(f"Failed to normalize job: {str(e)}")
                    continue
            
            logger.info(f"Normalized {len(normalized_jobs)} jobs from {self.source_name}")
            
            # Step 4: Save to database
            results = self.save_jobs(normalized_jobs)
            
            logger.info(f"Scraping complete for {self.source_name}: {results}")
            return results
            
        except Exception as e:
            logger.error(f"Error during scraping from {self.source_name}: {str(e)}")
            raise
    
    @abstractmethod
    def fetch_data_for_scraping(self, **kwargs) -> Any:
        """
        Fetch the initial data needed for scraping.
        This might be different from fetch_data for multi-step scraping.
        """
        pass
