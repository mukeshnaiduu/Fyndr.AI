import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from .base import BaseScraper


logger = logging.getLogger(__name__)


class GreenhouseScraper(BaseScraper):
    """
    Scraper for Greenhouse job boards using their public API.
    
    Uses the public JSON endpoint: https://boards-api.greenhouse.io/v1/boards/<company>/jobs
    """
    
    def __init__(self, company_names: List[str] = None):
        """
        Initialize the Greenhouse scraper.
        
        Args:
            company_names: List of company identifiers for Greenhouse boards
                          If None, uses a default list of popular companies
        """
        super().__init__(source_name='greenhouse', base_url='https://boards-api.greenhouse.io/v1/boards')
        
        # Default companies with public Greenhouse boards
        self.company_names = company_names or [
            'airbnb',
            'spotify',
            'shopify',
            'uber',
            'stripe',
            'github',
            'slack',
            'discord',
            'notion',
            'figma'
        ]
    
    def fetch_data_for_scraping(self, **kwargs) -> List[Dict[str, Any]]:
        """
        Fetch job data from multiple Greenhouse company boards.
        
        Returns:
            List of all jobs from all companies
        """
        all_jobs = []
        
        for company in self.company_names:
            try:
                url = f"{self.base_url}/{company}/jobs"
                logger.info(f"Fetching jobs for {company} from Greenhouse")
                
                data = self.fetch_data(url)
                
                if isinstance(data, dict) and 'jobs' in data:
                    jobs = data['jobs']
                elif isinstance(data, list):
                    jobs = data
                else:
                    logger.warning(f"Unexpected data format for {company}: {type(data)}")
                    continue
                
                # Add company identifier to each job
                for job in jobs:
                    job['_company_identifier'] = company
                
                all_jobs.extend(jobs)
                logger.info(f"Found {len(jobs)} jobs for {company}")
                
            except Exception as e:
                logger.error(f"Failed to fetch jobs for {company}: {str(e)}")
                continue
        
        return all_jobs
    
    def parse_data(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Parse Greenhouse API response data.
        
        Args:
            raw_data: List of job dictionaries from Greenhouse API
            
        Returns:
            List of parsed job dictionaries
        """
        parsed_jobs = []
        
        for job_data in raw_data:
            try:
                # Greenhouse API provides well-structured data, minimal parsing needed
                parsed_job = {
                    'id': job_data.get('id'),
                    'title': job_data.get('title'),
                    'location': self._parse_location(job_data.get('location', {})),
                    'absolute_url': job_data.get('absolute_url'),
                    'content': job_data.get('content'),
                    'updated_at': job_data.get('updated_at'),
                    'company_identifier': job_data.get('_company_identifier'),
                    'departments': job_data.get('departments', []),
                    'offices': job_data.get('offices', []),
                }
                
                parsed_jobs.append(parsed_job)
                
            except Exception as e:
                logger.warning(f"Failed to parse Greenhouse job: {str(e)}")
                continue
        
        return parsed_jobs
    
    def _parse_location(self, location_data: Dict[str, Any]) -> str:
        """Parse location data from Greenhouse API."""
        if not location_data:
            return "Not specified"
        
        # Try to get location name
        location_name = location_data.get('name', '')
        if location_name:
            return location_name
        
        # Fallback to constructing from city/state/country
        parts = []
        if location_data.get('city'):
            parts.append(location_data['city'])
        if location_data.get('state'):
            parts.append(location_data['state'])
        if location_data.get('country'):
            parts.append(location_data['country'])
        
        return ', '.join(parts) if parts else "Not specified"
    
    def _extract_external_id(self, job_data: Dict[str, Any]) -> str:
        """Extract external_id from Greenhouse job data."""
        job_id = job_data.get('id')
        if job_id:
            return str(job_id)
        
        # Fallback: generate from URL
        url = job_data.get('absolute_url', '')
        return self.__class__.generate_external_id(url, job_data.get('title'))
    
    def _extract_title(self, job_data: Dict[str, Any]) -> str:
        """Extract job title from Greenhouse job data."""
        return job_data.get('title', 'Untitled Position')
    
    def _extract_company(self, job_data: Dict[str, Any]) -> str:
        """Extract company name from Greenhouse job data."""
        # Use the company identifier we added during fetching
        company_identifier = job_data.get('company_identifier', '')
        
        # Convert identifier to readable company name
        company_map = {
            'airbnb': 'Airbnb',
            'spotify': 'Spotify',
            'shopify': 'Shopify',
            'uber': 'Uber',
            'stripe': 'Stripe',
            'github': 'GitHub',
            'slack': 'Slack',
            'discord': 'Discord',
            'notion': 'Notion',
            'figma': 'Figma',
        }
        
        return company_map.get(company_identifier, company_identifier.title())
    
    def _extract_location(self, job_data: Dict[str, Any]) -> Optional[str]:
        """Extract location from Greenhouse job data."""
        return job_data.get('location') or None
    
    def _extract_description(self, job_data: Dict[str, Any]) -> str:
        """Extract job description from Greenhouse job data."""
        content = job_data.get('content', '')
        
        # Greenhouse content is usually HTML, we'll keep it as-is for now
        # In a production system, you might want to clean HTML tags
        return content if content else 'No description available'
    
    def _extract_url(self, job_data: Dict[str, Any]) -> str:
        """Extract job URL from Greenhouse job data."""
        return job_data.get('absolute_url', '')
    
    def _extract_date_posted(self, job_data: Dict[str, Any]) -> Optional[date]:
        """Extract posting date from Greenhouse job data."""
        updated_at = job_data.get('updated_at')
        if not updated_at:
            return None
        
        try:
            # Greenhouse uses ISO format: "2025-01-15T14:30:00.000Z"
            dt = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
            return dt.date()
        except (ValueError, AttributeError):
            logger.warning(f"Could not parse date: {updated_at}")
            return None
