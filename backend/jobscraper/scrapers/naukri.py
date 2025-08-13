import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import re
from bs4 import BeautifulSoup
from .base import BaseScraper


logger = logging.getLogger(__name__)


class NaukriScraper(BaseScraper):
    """
    Scraper for Naukri.com - India's largest job portal.
    
    Scrapes job listings from various technology and skill-based searches.
    """
    
    def __init__(self):
        """Initialize the Naukri scraper."""
        super().__init__(
            source_name='naukri',
            base_url='https://www.naukri.com'
        )
        
        # Technology skills and keywords to search for
        self.search_keywords = [
            'python developer',
            'java developer',
            'javascript developer',
            'react developer',
            'node.js developer',
            'angular developer',
            'full stack developer',
            'backend developer',
            'frontend developer',
            'software engineer',
            'senior software engineer',
            'data scientist',
            'machine learning engineer',
            'devops engineer',
            'cloud engineer',
            'aws developer',
            'azure developer',
            'django developer',
            'flask developer',
            'spring boot developer',
            'microservices developer',
            'api developer',
            'mobile app developer',
            'android developer',
            'ios developer',
            'flutter developer',
            'react native developer',
            'ui ux designer',
            'product manager',
            'scrum master',
            'business analyst',
            'qa engineer',
            'test automation engineer',
            'selenium tester',
            'database administrator',
            'sql developer',
            'mongodb developer',
            'postgresql developer',
            'redis developer',
            'elasticsearch developer',
            'docker developer',
            'kubernetes engineer',
            'jenkins engineer',
            'github developer',
            'git developer',
            'linux administrator',
            'system administrator',
            'network engineer',
            'security engineer',
            'cybersecurity analyst',
            'blockchain developer',
            'solidity developer',
            'smart contract developer',
            'web3 developer',
            'fintech developer',
            'edtech developer',
            'healthtech developer',
            'hr tech developer',
            'saas developer',
            'ecommerce developer',
            'marketplace developer',
            'payment gateway developer',
            'api integration developer',
            'third party integration',
            'erp developer',
            'crm developer',
            'chatbot developer',
            'ai developer',
            'ml engineer',
            'nlp engineer',
            'computer vision engineer',
            'deep learning engineer',
            'tensorflow developer',
            'pytorch developer',
            'data engineer',
            'data analyst',
            'business intelligence',
            'tableau developer',
            'power bi developer',
            'spark developer',
            'hadoop developer',
            'kafka developer',
            'airflow developer',
            'etl developer',
            'aws solution architect',
            'azure solution architect',
            'gcp developer',
            'terraform developer',
            'ansible developer',
            'chef developer',
            'puppet developer',
            'monitoring engineer',
            'observability engineer',
            'site reliability engineer',
            'platform engineer',
            'infrastructure engineer',
            'cloud architect',
            'enterprise architect',
            'solution architect',
            'technical architect',
            'lead developer',
            'senior developer',
            'principal engineer',
            'staff engineer',
            'engineering manager',
            'technical lead',
            'team lead',
            'project manager',
            'delivery manager',
            'agile coach',
            'technical writer',
            'documentation specialist',
            'developer relations',
            'developer advocate',
            'community manager',
            'startup developer',
            'remote developer',
            'freelance developer',
            'contract developer',
            'intern developer',
            'entry level developer',
            'fresher developer',
            'graduate developer'
        ]
        
        # Indian cities for location filtering
        self.india_locations = [
            'mumbai', 'delhi', 'bangalore', 'bengaluru', 'chennai', 'hyderabad',
            'pune', 'kolkata', 'ahmedabad', 'surat', 'jaipur', 'lucknow',
            'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam',
            'pimpri', 'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra',
            'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan', 'vasai',
            'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar',
            'navi mumbai', 'allahabad', 'prayagraj', 'ranchi', 'haora',
            'jabalpur', 'gwalior', 'coimbatore', 'vijayawada', 'jodhpur',
            'madurai', 'raipur', 'kota', 'guwahati', 'chandigarh',
            'thiruvananthapuram', 'solapur', 'hubballi', 'tiruchirappalli',
            'bareilly', 'mysore', 'tiruppur', 'gurgaon', 'gurugram',
            'aligarh', 'jalandhar', 'bhubaneswar', 'salem', 'warangal',
            'guntur', 'bhiwandi', 'saharanpur', 'gorakhpur', 'bikaner',
            'amravati', 'noida', 'jamshedpur', 'bhilai', 'cuttack',
            'firozabad', 'kochi', 'ernakulam', 'bhavnagar', 'dehradun',
            'durgapur', 'asansol', 'rourkela', 'nanded', 'kolhapur',
            'ajmer', 'akola', 'gulbarga', 'jamnagar', 'ujjain'
        ]
    
    def build_search_url(self, keyword: str, location: str = '', page: int = 1) -> str:
        """
        Build search URL for Naukri.com
        
        Args:
            keyword: Job search keyword
            location: Location filter
            page: Page number
            
        Returns:
            Complete search URL
        """
        base_search_url = f"{self.base_url}/jobs"
        
        # URL encode the keyword
        keyword_encoded = keyword.replace(' ', '-').replace('+', '-')
        
        if location:
            location_encoded = location.replace(' ', '-').replace('+', '-')
            search_url = f"{base_search_url}/{keyword_encoded}-jobs-in-{location_encoded}"
        else:
            search_url = f"{base_search_url}/{keyword_encoded}-jobs"
        
        if page > 1:
            search_url += f"?k={keyword.replace(' ', '%20')}&p={page}"
        
        return search_url
    
    def fetch_data_for_scraping(self, **kwargs) -> List[str]:
        """
        Fetch job listing URLs from Naukri.com search pages.
        
        Returns:
            List of job detail page URLs
        """
        job_urls = []
        max_pages_per_keyword = 3  # Limit to avoid too many requests
        
        # Search with a subset of keywords to avoid overloading
        priority_keywords = self.search_keywords[:20]  # Use first 20 keywords
        priority_locations = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai']
        
        for keyword in priority_keywords:
            for location in priority_locations:
                try:
                    logger.info(f"Searching for '{keyword}' jobs in {location}")
                    
                    for page in range(1, max_pages_per_keyword + 1):
                        search_url = self.build_search_url(keyword, location, page)
                        logger.info(f"Fetching page {page}: {search_url}")
                        
                        response_text = self.fetch_data(search_url)
                        if not response_text:
                            break
                        
                        # Parse job URLs from search results
                        page_job_urls = self.extract_job_urls(response_text)
                        job_urls.extend(page_job_urls)
                        
                        logger.info(f"Found {len(page_job_urls)} job URLs on page {page}")
                        
                        # Break if no more jobs found
                        if len(page_job_urls) == 0:
                            break
                            
                        # Add delay to be respectful
                        self.sleep()
                        
                except Exception as e:
                    logger.error(f"Error searching for {keyword} in {location}: {str(e)}")
                    continue
        
        # Remove duplicates
        unique_job_urls = list(set(job_urls))
        logger.info(f"Total unique job URLs found: {len(unique_job_urls)}")
        
        return unique_job_urls
    
    def extract_job_urls(self, html_content: str) -> List[str]:
        """
        Extract job detail URLs from Naukri search results page.
        
        Args:
            html_content: HTML content of search results page
            
        Returns:
            List of job detail URLs
        """
        job_urls = []
        
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Find job links - Naukri uses various selectors
            job_selectors = [
                'a[href*="/job-listings/"]',
                'a[href*="/jobs/"]',
                '.jobTuple a',
                '.jobTupleHeader a',
                '.title a',
                'a.title'
            ]
            
            for selector in job_selectors:
                job_links = soup.select(selector)
                for link in job_links:
                    href = link.get('href', '')
                    if href and ('/job-listings/' in href or '/jobs/' in href):
                        if href.startswith('/'):
                            href = self.base_url + href
                        elif not href.startswith('http'):
                            href = self.base_url + '/' + href
                        job_urls.append(href)
            
        except Exception as e:
            logger.error(f"Error extracting job URLs: {str(e)}")
        
        return job_urls
    
    def parse_data(self, job_urls: List[str]) -> List[Dict[str, Any]]:
        """
        Parse job data from Naukri job detail pages.
        
        Args:
            job_urls: List of job detail page URLs
            
        Returns:
            List of parsed job dictionaries
        """
        parsed_jobs = []
        
        # Limit the number of jobs to parse to avoid overloading
        max_jobs_to_parse = 100
        job_urls_to_parse = job_urls[:max_jobs_to_parse]
        
        for i, job_url in enumerate(job_urls_to_parse, 1):
            try:
                logger.info(f"Parsing job {i}/{len(job_urls_to_parse)}: {job_url}")
                
                html_content = self.fetch_data(job_url)
                if not html_content:
                    continue
                
                job_data = self.parse_job_detail(html_content, job_url)
                if job_data:
                    parsed_jobs.append(job_data)
                
                # Add delay to be respectful
                self.sleep()
                
            except Exception as e:
                logger.error(f"Error parsing job URL {job_url}: {str(e)}")
                continue
        
        return parsed_jobs
    
    def parse_job_detail(self, html_content: str, job_url: str) -> Optional[Dict[str, Any]]:
        """
        Parse individual job detail page.
        
        Args:
            html_content: HTML content of job detail page
            job_url: URL of the job posting
            
        Returns:
            Parsed job data dictionary or None if parsing fails
        """
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract job title
            title_selectors = [
                'h1.jd-header-title',
                '.jd-header h1',
                'h1',
                '.job-title',
                '.jobTitle'
            ]
            title = self.extract_text_by_selectors(soup, title_selectors)
            
            # Extract company name
            company_selectors = [
                '.jd-header-comp-name',
                '.comp-name',
                '.company-name',
                '.employerName'
            ]
            company = self.extract_text_by_selectors(soup, company_selectors)
            
            # Extract location
            location_selectors = [
                '.jd-location',
                '.location',
                '.job-location',
                '.loc'
            ]
            location = self.extract_text_by_selectors(soup, location_selectors)
            
            # Extract job description
            description_selectors = [
                '.jd-desc',
                '.job-description',
                '.description',
                '.jd-description'
            ]
            description = self.extract_text_by_selectors(soup, description_selectors)
            
            # Extract external ID from URL
            external_id = self.extract_job_id_from_url(job_url)
            
            if not title or not company:
                logger.warning(f"Missing required fields for job: {job_url}")
                return None
            
            return {
                'external_id': external_id,
                'title': title.strip(),
                'company': company.strip(),
                'location': location.strip() if location else 'India',
                'description': description.strip() if description else '',
                'url': job_url,
                'date_posted': date.today()  # Naukri doesn't always show posting date
            }
            
        except Exception as e:
            logger.error(f"Error parsing job detail: {str(e)}")
            return None
    
    def extract_text_by_selectors(self, soup: BeautifulSoup, selectors: List[str]) -> str:
        """
        Extract text using multiple CSS selectors (fallback approach).
        
        Args:
            soup: BeautifulSoup object
            selectors: List of CSS selectors to try
            
        Returns:
            Extracted text or empty string
        """
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)
        return ''
    
    def extract_job_id_from_url(self, url: str) -> str:
        """
        Extract job ID from Naukri URL.
        
        Args:
            url: Job posting URL
            
        Returns:
            Job ID string
        """
        # Try to extract ID from URL patterns
        patterns = [
            r'/job-listings/([^/?]+)',
            r'/jobs/([^/?]+)',
            r'jid=([^&]+)',
            r'jobId=([^&]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        # Fallback: use last part of URL path
        try:
            return url.split('/')[-1].split('?')[0]
        except:
            return url[-50:]  # Use last 50 characters as ID
    
    # Required abstract methods from BaseScraper
    def _extract_external_id(self, raw_job: Dict[str, Any]) -> str:
        """Extract external ID from raw job data."""
        return raw_job.get('external_id', '')
    
    def _extract_title(self, raw_job: Dict[str, Any]) -> str:
        """Extract job title from raw job data."""
        return raw_job.get('title', '').strip()
    
    def _extract_company(self, raw_job: Dict[str, Any]) -> str:
        """Extract company name from raw job data."""
        return raw_job.get('company', '').strip()
    
    def _extract_location(self, raw_job: Dict[str, Any]) -> str:
        """Extract location from raw job data."""
        return raw_job.get('location', '').strip()
    
    def _extract_description(self, raw_job: Dict[str, Any]) -> str:
        """Extract job description from raw job data."""
        return raw_job.get('description', '').strip()
    
    def _extract_url(self, raw_job: Dict[str, Any]) -> str:
        """Extract job URL from raw job data."""
        return raw_job.get('url', '')
    
    def _extract_date_posted(self, raw_job: Dict[str, Any]) -> date:
        """Extract posting date from raw job data."""
        return raw_job.get('date_posted', date.today())
