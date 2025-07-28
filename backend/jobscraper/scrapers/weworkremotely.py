import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from bs4 import BeautifulSoup
import re
from .base import BaseScraper


logger = logging.getLogger(__name__)


class WeWorkRemotelyScraper(BaseScraper):
    """
    Scraper for WeWorkRemotely job board using HTML parsing.
    
    Scrapes job listings from https://weworkremotely.com/
    """
    
    def __init__(self):
        """Initialize the WeWorkRemotely scraper."""
        super().__init__(
            source_name='weworkremotely',
            base_url='https://weworkremotely.com'
        )
        
        # Categories to scrape (can be expanded)
        self.categories = [
            'programming',
            'design',
            'devops-sysadmin',
            'product',
            'marketing',
            'customer-support',
            'copywriting',
            'business-development'
        ]
    
    def fetch_data_for_scraping(self, **kwargs) -> List[str]:
        """
        Fetch job listing URLs from WeWorkRemotely category pages.
        
        Returns:
            List of job detail page URLs
        """
        job_urls = []
        
        for category in self.categories:
            try:
                category_url = f"{self.base_url}/remote-jobs/{category}"
                logger.info(f"Fetching jobs from category: {category}")
                
                response = self.fetch_data(category_url)
                
                if hasattr(response, 'text'):
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Find job links (WeWorkRemotely uses specific CSS classes)
                    job_links = soup.find_all('a', class_='browse_job_link')
                    
                    for link in job_links:
                        href = link.get('href')
                        if href and href.startswith('/remote-jobs/'):
                            full_url = f"{self.base_url}{href}"
                            job_urls.append(full_url)
                    
                    logger.info(f"Found {len(job_links)} jobs in {category}")
                
            except Exception as e:
                logger.error(f"Failed to fetch category {category}: {str(e)}")
                continue
        
        # Remove duplicates
        job_urls = list(set(job_urls))
        logger.info(f"Total unique job URLs found: {len(job_urls)}")
        
        return job_urls
    
    def parse_data(self, raw_data: List[str]) -> List[Dict[str, Any]]:
        """
        Parse job detail pages to extract job information.
        
        Args:
            raw_data: List of job detail page URLs
            
        Returns:
            List of parsed job dictionaries
        """
        parsed_jobs = []
        
        for url in raw_data:
            try:
                logger.debug(f"Parsing job details from: {url}")
                response = self.fetch_data(url)
                
                if hasattr(response, 'text'):
                    soup = BeautifulSoup(response.text, 'html.parser')
                    job_data = self._parse_job_page(soup, url)
                    
                    if job_data:
                        parsed_jobs.append(job_data)
                
            except Exception as e:
                logger.warning(f"Failed to parse job from {url}: {str(e)}")
                continue
        
        return parsed_jobs
    
    def _parse_job_page(self, soup: BeautifulSoup, url: str) -> Optional[Dict[str, Any]]:
        """
        Parse individual job page HTML.
        
        Args:
            soup: BeautifulSoup object of job page
            url: Job page URL
            
        Returns:
            Dictionary with job data or None if parsing fails
        """
        try:
            # Job title (usually in h1 or specific class)
            title_elem = soup.find('h1') or soup.find('div', class_='job-title')
            title = title_elem.get_text(strip=True) if title_elem else 'Untitled Position'
            
            # Company name (usually near the title)
            company_elem = (
                soup.find('h2') or 
                soup.find('div', class_='company-name') or
                soup.find('a', class_='company-link')
            )
            company = company_elem.get_text(strip=True) if company_elem else 'Unknown Company'
            
            # Location (WeWorkRemotely is remote-focused)
            location = 'Remote'
            location_elem = soup.find('div', class_='location') or soup.find('span', class_='location')
            if location_elem:
                location_text = location_elem.get_text(strip=True)
                if location_text and location_text.lower() != 'remote':
                    location = location_text
            
            # Job description (main content area)
            description = self._extract_description_from_soup(soup)
            
            # Date posted (if available)
            date_posted = self._extract_date_from_soup(soup)
            
            return {
                'title': title,
                'company': company,
                'location': location,
                'description': description,
                'url': url,
                'date_posted': date_posted,
            }
            
        except Exception as e:
            logger.warning(f"Error parsing job page: {str(e)}")
            return None
    
    def _extract_description_from_soup(self, soup: BeautifulSoup) -> str:
        """Extract job description from soup object."""
        # Try different common selectors for job descriptions
        description_selectors = [
            'div.job-description',
            'div.description',
            'div.content',
            'div.job-details',
            'div#job-description',
            'section.job-description'
        ]
        
        for selector in description_selectors:
            elem = soup.select_one(selector)
            if elem:
                return elem.get_text(strip=True, separator=' ')
        
        # Fallback: get main content area
        main_content = soup.find('main') or soup.find('div', class_='main')
        if main_content:
            # Remove navigation and header elements
            for unwanted in main_content.find_all(['nav', 'header', 'aside']):
                unwanted.decompose()
            return main_content.get_text(strip=True, separator=' ')
        
        # Last resort: get all text from body
        body = soup.find('body')
        if body:
            return body.get_text(strip=True, separator=' ')[:5000]  # Limit length
        
        return 'No description available'
    
    def _extract_date_from_soup(self, soup: BeautifulSoup) -> Optional[date]:
        """Extract posting date from soup object."""
        # Look for date patterns in common locations
        date_selectors = [
            'time',
            '.date-posted',
            '.posted-date',
            '.job-date',
            '.publish-date'
        ]
        
        for selector in date_selectors:
            elem = soup.select_one(selector)
            if elem:
                date_text = elem.get('datetime') or elem.get_text(strip=True)
                parsed_date = self._parse_date_string(date_text)
                if parsed_date:
                    return parsed_date
        
        # Look for date patterns in text
        text_content = soup.get_text()
        date_patterns = [
            r'Posted (\d{1,2}/\d{1,2}/\d{4})',
            r'(\d{1,2} days? ago)',
            r'(\d{1,2} weeks? ago)',
            r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text_content, re.IGNORECASE)
            if match:
                parsed_date = self._parse_date_string(match.group(1))
                if parsed_date:
                    return parsed_date
        
        return None
    
    def _parse_date_string(self, date_str: str) -> Optional[date]:
        """Parse various date string formats."""
        if not date_str:
            return None
        
        try:
            date_str = date_str.strip()
            
            # Handle relative dates
            if 'day' in date_str.lower():
                days_match = re.search(r'(\d+)', date_str)
                if days_match:
                    days_ago = int(days_match.group(1))
                    return (datetime.now() - datetime.timedelta(days=days_ago)).date()
            
            if 'week' in date_str.lower():
                weeks_match = re.search(r'(\d+)', date_str)
                if weeks_match:
                    weeks_ago = int(weeks_match.group(1))
                    return (datetime.now() - datetime.timedelta(weeks=weeks_ago)).date()
            
            # Handle absolute dates
            date_formats = [
                '%m/%d/%Y',
                '%d/%m/%Y',
                '%Y-%m-%d',
                '%B %d, %Y',
                '%b %d, %Y',
                '%B %d %Y',
                '%b %d %Y',
            ]
            
            for fmt in date_formats:
                try:
                    return datetime.strptime(date_str, fmt).date()
                except ValueError:
                    continue
            
        except Exception as e:
            logger.debug(f"Could not parse date '{date_str}': {str(e)}")
        
        return None
    
    # Implementation of abstract methods
    def _extract_external_id(self, job_data: Dict[str, Any]) -> str:
        """Extract external_id from WeWorkRemotely job data."""
        url = job_data.get('url', '')
        title = job_data.get('title', '')
        company = job_data.get('company', '')
        
        # Use URL-based ID since WWR doesn't provide explicit IDs
        return self.__class__.generate_external_id(url, title, company)
    
    def _extract_title(self, job_data: Dict[str, Any]) -> str:
        """Extract job title."""
        return job_data.get('title', 'Untitled Position')
    
    def _extract_company(self, job_data: Dict[str, Any]) -> str:
        """Extract company name."""
        return job_data.get('company', 'Unknown Company')
    
    def _extract_location(self, job_data: Dict[str, Any]) -> Optional[str]:
        """Extract location."""
        return job_data.get('location')
    
    def _extract_description(self, job_data: Dict[str, Any]) -> str:
        """Extract job description."""
        return job_data.get('description', 'No description available')
    
    def _extract_url(self, job_data: Dict[str, Any]) -> str:
        """Extract job URL."""
        return job_data.get('url', '')
    
    def _extract_date_posted(self, job_data: Dict[str, Any]) -> Optional[date]:
        """Extract posting date."""
        return job_data.get('date_posted')
