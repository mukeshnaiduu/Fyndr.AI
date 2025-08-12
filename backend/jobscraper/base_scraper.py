"""
Base Scraper Class

Abstract base class that provides common functionality for all job scrapers.
This follows the template method pattern to ensure consistent behavior across
different scraping implementations.
"""

import logging
import time
from abc import ABC, abstractmethod
from datetime import datetime, date
from typing import List, Dict, Optional, Union
import requests
from bs4 import BeautifulSoup
import hashlib

from django.utils import timezone
from .models import JobPosting, ScrapingLog
from .simple_job_parser import parse_job_content


logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """
    Abstract base class for all job scrapers.
    
    This class defines the common interface and shared functionality
    that all concrete scrapers must implement or can override.
    """
    
    def __init__(self, source_name: str, base_url: str = None):
        """
        Initialize the scraper.
        
        Args:
            source_name (str): Unique identifier for this scraper source
            base_url (str, optional): Base URL for the job board
        """
        self.source_name = source_name
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.scraping_log = None
        self.jobs_found = 0
        self.jobs_created = 0
        self.jobs_updated = 0
        self.errors = []
    
    def fetch_data(self, url: str, params: Dict = None, headers: Dict = None) -> Union[requests.Response, None]:
        """
        Fetch data from a URL with error handling and retries.
        
        Args:
            url (str): URL to fetch
            params (Dict, optional): Query parameters
            headers (Dict, optional): Additional headers
            
        Returns:
            requests.Response or None: Response object or None if failed
        """
        if headers:
            session_headers = self.session.headers.copy()
            session_headers.update(headers)
        else:
            session_headers = self.session.headers
        
        max_retries = 3
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Fetching data from {url} (attempt {attempt + 1}/{max_retries})")
                
                response = self.session.get(
                    url,
                    params=params,
                    headers=session_headers,
                    timeout=30
                )
                response.raise_for_status()
                
                # Add delay to be respectful to the server
                time.sleep(1)
                return response
                
            except requests.exceptions.RequestException as e:
                error_msg = f"Error fetching {url}: {str(e)}"
                logger.warning(error_msg)
                self.errors.append(error_msg)
                
                if attempt < max_retries - 1:
                    time.sleep(retry_delay * (2 ** attempt))  # Exponential backoff
                else:
                    logger.error(f"Failed to fetch {url} after {max_retries} attempts")
                    return None
    
    def parse_html(self, html_content: str) -> BeautifulSoup:
        """
        Parse HTML content using BeautifulSoup.
        
        Args:
            html_content (str): Raw HTML content
            
        Returns:
            BeautifulSoup: Parsed HTML object
        """
        return BeautifulSoup(html_content, 'html.parser')
    
    def clean_text(self, text: str) -> str:
        """
        Clean and normalize text data.
        
        Args:
            text (str): Raw text to clean
            
        Returns:
            str: Cleaned text
        """
        if not text:
            return ""
        
        # Remove extra whitespace and normalize
        cleaned = " ".join(text.split())
        return cleaned.strip()
    
    def parse_date(self, date_str: str) -> Optional[date]:
        """
        Parse date string into a date object.
        
        Args:
            date_str (str): Date string to parse
            
        Returns:
            date or None: Parsed date or None if parsing failed
        """
        if not date_str:
            return None
        
        # Common date formats to try
        date_formats = [
            '%Y-%m-%d',
            '%m/%d/%Y',
            '%d/%m/%Y',
            '%B %d, %Y',
            '%b %d, %Y',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%S.%f'
        ]
        
        for fmt in date_formats:
            try:
                parsed_date = datetime.strptime(date_str.strip(), fmt).date()
                return parsed_date
            except ValueError:
                continue
        
        logger.warning(f"Could not parse date: {date_str}")
        return None
    
    def normalize_job(self, raw_job_data: Dict) -> Dict:
        """
        Normalize raw job data into the standard schema using comprehensive parsing.
        
        Args:
            raw_job_data (Dict): Raw job data from the source
            
        Returns:
            Dict: Normalized job data matching our comprehensive schema
        """
        # Extract and clean the required fields
        title = self.clean_text(raw_job_data.get('title', ''))
        company = self.clean_text(raw_job_data.get('company', ''))
        location = self.clean_text(raw_job_data.get('location', ''))
        description = self.clean_text(raw_job_data.get('description', ''))
        url = raw_job_data.get('url', '').strip()
        
        # Create external_id if not provided
        external_id = raw_job_data.get('external_id')
        if not external_id:
            external_id = JobPosting.generate_external_id(url, title, company)
        
        # Parse date_posted
        date_posted = None
        if raw_job_data.get('date_posted'):
            date_posted = self.parse_date(raw_job_data['date_posted'])
        
        # Start with basic normalized job data
        normalized_job = {
            'external_id': external_id,
            'title': title,
            'company': company,
            'location': location,
            'description': description,
            'url': url,
            'source': self.source_name,
            'date_posted': date_posted,
            'date_scraped': timezone.now()
        }
        
        # Use comprehensive job parser for enhanced field extraction
        try:
            # Get HTML content for parsing
            html_content = raw_job_data.get('html_content', '')
            
            # Parse comprehensive job information
            parsed_data = parse_job_content(
                html_content=html_content,
                text_content=description,
                url=url
            )
            
            # Integrate parsed data with normalized job
            # Job Classification
            if parsed_data.get('job_type'):
                normalized_job['job_type'] = parsed_data['job_type']
            if parsed_data.get('employment_mode'):
                normalized_job['employment_mode'] = parsed_data['employment_mode']
            if parsed_data.get('experience_level'):
                normalized_job['experience_level'] = parsed_data['experience_level']
            if parsed_data.get('education_level'):
                normalized_job['education_level'] = parsed_data['education_level']
            
            # Job Content
            if parsed_data.get('responsibilities'):
                normalized_job['responsibilities'] = parsed_data['responsibilities']
            if parsed_data.get('requirements'):
                normalized_job['requirements'] = parsed_data['requirements']
            if parsed_data.get('skills_required'):
                normalized_job['skills_required'] = parsed_data['skills_required']
            if parsed_data.get('skills_preferred'):
                normalized_job['skills_preferred'] = parsed_data['skills_preferred']
            if parsed_data.get('tools_technologies'):
                normalized_job['tools_technologies'] = parsed_data['tools_technologies']
            if parsed_data.get('certifications'):
                normalized_job['certifications'] = parsed_data['certifications']
            
            # Compensation & Benefits
            if parsed_data.get('salary_min'):
                normalized_job['salary_min'] = parsed_data['salary_min']
            if parsed_data.get('salary_max'):
                normalized_job['salary_max'] = parsed_data['salary_max']
            if parsed_data.get('currency'):
                normalized_job['currency'] = parsed_data['currency']
            if parsed_data.get('compensation_type'):
                normalized_job['compensation_type'] = parsed_data['compensation_type']
            if parsed_data.get('benefits'):
                normalized_job['benefits'] = parsed_data['benefits']
            if parsed_data.get('bonus_equity'):
                normalized_job['bonus_equity'] = parsed_data['bonus_equity']
            
            # Company Insights
            if parsed_data.get('company_size'):
                normalized_job['company_size'] = parsed_data['company_size']
            if parsed_data.get('industry'):
                normalized_job['industry'] = parsed_data['industry']
            if parsed_data.get('company_website'):
                normalized_job['company_website'] = parsed_data['company_website']
            
            # Recruitment Details
            if parsed_data.get('application_deadline'):
                normalized_job['application_deadline'] = parsed_data['application_deadline']
            if parsed_data.get('hiring_manager'):
                normalized_job['hiring_manager'] = parsed_data['hiring_manager']
            if parsed_data.get('number_of_openings'):
                normalized_job['number_of_openings'] = parsed_data['number_of_openings']
            
            # Contextual Data
            if parsed_data.get('visa_sponsorship') is not None:
                normalized_job['visa_sponsorship'] = parsed_data['visa_sponsorship']
            if parsed_data.get('relocation_assistance') is not None:
                normalized_job['relocation_assistance'] = parsed_data['relocation_assistance']
            if parsed_data.get('travel_requirements'):
                normalized_job['travel_requirements'] = parsed_data['travel_requirements']
            if parsed_data.get('languages_required'):
                normalized_job['languages_required'] = parsed_data['languages_required']
            
            # ML Enrichments
            if parsed_data.get('job_category'):
                normalized_job['job_category'] = parsed_data['job_category']
            if parsed_data.get('seniority_score'):
                normalized_job['seniority_score'] = parsed_data['seniority_score']
            if parsed_data.get('keywords'):
                normalized_job['keywords'] = parsed_data['keywords']
            if parsed_data.get('projects_portfolio_examples'):
                normalized_job['projects_portfolio_examples'] = parsed_data['projects_portfolio_examples']
            
            # Metadata
            if parsed_data.get('parse_confidence'):
                normalized_job['parse_confidence'] = parsed_data['parse_confidence']
            if parsed_data.get('raw_data'):
                normalized_job['raw_data'] = parsed_data['raw_data']
                
            logger.debug(f"Enhanced parsing completed for job: {title} with confidence: {parsed_data.get('parse_confidence', 0)}%")
            
        except Exception as e:
            logger.warning(f"Enhanced parsing failed for job {title}, falling back to basic parsing: {str(e)}")
            # Continue with basic normalization
        
        # Add any remaining optional fields from raw data
        optional_fields = ['salary_min', 'salary_max', 'employment_type']
        for field in optional_fields:
            if field in raw_job_data and field not in normalized_job:
                normalized_job[field] = raw_job_data[field]
        
        return normalized_job
    
    def save_job(self, job_data: Dict) -> Optional[JobPosting]:
        """
        Save a single job to the database.
        
        Args:
            job_data (Dict): Normalized job data
            
        Returns:
            JobPosting or None: Created or updated job posting
        """
        try:
            # Check if job already exists
            existing_job = JobPosting.objects.filter(
                external_id=job_data['external_id'],
                source=job_data['source']
            ).first()
            
            if existing_job:
                # Update existing job
                for key, value in job_data.items():
                    setattr(existing_job, key, value)
                existing_job.save()
                self.jobs_updated += 1
                logger.debug(f"Updated job: {job_data['title']} at {job_data['company']}")
                return existing_job
            else:
                # Create new job
                new_job = JobPosting.objects.create(**job_data)
                self.jobs_created += 1
                logger.info(f"Created new job: {job_data['title']} at {job_data['company']}")
                return new_job
                
        except Exception as e:
            error_msg = f"Error saving job {job_data.get('title', 'Unknown')}: {str(e)}"
            logger.error(error_msg)
            self.errors.append(error_msg)
            return None
    
    def save_jobs(self, jobs_data: List[Dict]) -> int:
        """
        Save multiple jobs to the database.
        
        Args:
            jobs_data (List[Dict]): List of normalized job data
            
        Returns:
            int: Number of jobs successfully saved
        """
        saved_count = 0
        for job_data in jobs_data:
            if self.save_job(job_data):
                saved_count += 1
        
        return saved_count
    
    def start_scraping_session(self) -> ScrapingLog:
        """
        Start a new scraping session and create a log entry.
        
        Returns:
            ScrapingLog: Created scraping log instance
        """
        self.scraping_log = ScrapingLog.objects.create(
            source=self.source_name,
            status='running'
        )
        logger.info(f"Started scraping session for {self.source_name}")
        return self.scraping_log
    
    def end_scraping_session(self, status: str = 'completed'):
        """
        End the current scraping session and update the log.
        
        Args:
            status (str): Final status ('completed' or 'failed')
        """
        if self.scraping_log:
            self.scraping_log.completed_at = timezone.now()
            self.scraping_log.jobs_found = self.jobs_found
            self.scraping_log.jobs_created = self.jobs_created
            self.scraping_log.jobs_updated = self.jobs_updated
            self.scraping_log.errors_count = len(self.errors)
            self.scraping_log.status = status
            
            if self.errors:
                self.scraping_log.error_details = "\n".join(self.errors)
            
            self.scraping_log.save()
            
            logger.info(f"Ended scraping session for {self.source_name}: "
                       f"{self.jobs_found} found, {self.jobs_created} created, "
                       f"{self.jobs_updated} updated, {len(self.errors)} errors")
    
    def run(self) -> Dict:
        """
        Main entry point to run the scraper.
        
        Returns:
            Dict: Summary of scraping results
        """
        try:
            # Start the scraping session
            self.start_scraping_session()
            
            # Fetch and parse job data
            logger.info(f"Starting {self.source_name} scraper")
            raw_jobs = self.fetch_jobs()
            
            if not raw_jobs:
                logger.warning(f"No jobs found from {self.source_name}")
                self.end_scraping_session('completed')
                return self.get_scraping_summary()
            
            self.jobs_found = len(raw_jobs)
            logger.info(f"Found {self.jobs_found} jobs from {self.source_name}")
            
            # Normalize and save jobs
            normalized_jobs = []
            for raw_job in raw_jobs:
                try:
                    normalized_job = self.normalize_job(raw_job)
                    normalized_jobs.append(normalized_job)
                except Exception as e:
                    error_msg = f"Error normalizing job: {str(e)}"
                    logger.error(error_msg)
                    self.errors.append(error_msg)
            
            # Save jobs to database
            self.save_jobs(normalized_jobs)
            
            # End the session
            self.end_scraping_session('completed')
            
        except Exception as e:
            error_msg = f"Fatal error in {self.source_name} scraper: {str(e)}"
            logger.error(error_msg)
            self.errors.append(error_msg)
            self.end_scraping_session('failed')
        
        return self.get_scraping_summary()
    
    def get_scraping_summary(self) -> Dict:
        """
        Get a summary of the scraping session.
        
        Returns:
            Dict: Summary of scraping results
        """
        return {
            'source': self.source_name,
            'jobs_found': self.jobs_found,
            'jobs_created': self.jobs_created,
            'jobs_updated': self.jobs_updated,
            'errors_count': len(self.errors),
            'errors': self.errors,
            'success': len(self.errors) == 0
        }
    
    # Abstract methods that must be implemented by concrete scrapers
    
    @abstractmethod
    def fetch_jobs(self) -> List[Dict]:
        """
        Fetch jobs from the specific source.
        
        This method must be implemented by each concrete scraper.
        It should return a list of raw job dictionaries.
        
        Returns:
            List[Dict]: List of raw job data from the source
        """
        pass
