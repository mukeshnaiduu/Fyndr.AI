import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from time import sleep
from .base import BaseScraper


logger = logging.getLogger(__name__)


class GreenhouseIndiaScraper(BaseScraper):
    """
    Scraper for Greenhouse job boards specifically targeting India-based jobs.
    
    Focuses on companies with significant Indian operations and filters for India locations.
    """
    
    def __init__(self):
        """Initialize the Greenhouse India scraper."""
        super().__init__(source_name='greenhouse_india', base_url='https://boards-api.greenhouse.io/v1/boards')
        
        # Companies with known Indian operations or offices
        self.company_names = [
            # Major tech companies with Indian offices
            'microsoft',
            'google',
            'amazon',
            'meta',
            'apple',
            'netflix',
            'salesforce',
            'adobe',
            'oracle',
            'ibm',
            'linkedin',
            'twitter',
            'spotify',
            'uber',
            'airbnb',
            'stripe',
            'github',
            'slack',
            'discord',
            'notion',
            'figma',
            'atlassian',
            'zoom',
            'servicenow',
            'workday',
            'snowflake',
            'databricks',
            'coinbase',
            'shopify',
            'twilio',
            'okta',
            'cloudflare',
            'mongodb',
            'elastic',
            'confluent',
            'hashicorp',
            'gitlab',
            'jetbrains',
            'unity',
            'epic-games',
            'roblox',
            # Indian unicorns and major companies
            'zomato',
            'swiggy',
            'flipkart',
            'paytm',
            'byju',
            'ola',
            'freshworks',
            'razorpay',
            'zerodha',
            'policybazaar',
            'nykaa',
            'unacademy',
            'vedantu',
            'pharmeasy',
            'grofers',
            'bigbasket',
            'myntra',
            'makeMyTrip',
            'goibibo',
            'yatra',
            'redbus',
            'bookmyshow',
            'zomatoMedia',
            'hike',
            'sharechat',
            'dailyhunt',
            'inshorts',
            'phonepe',
            'payu',
            'mobikwik',
            'freecharge',
            'lendingkart',
            'capitalone',
            'hdfc',
            'icici',
            'axis',
            'kotak',
            'bajaj',
            'tcs',
            'infosys',
            'wipro',
            'hcl',
            'techMahindra',
            'mindtree',
            'ltimindtree',
            'mphasis',
            'cognizant',
            'accenture',
            'deloitte',
            'ey',
            'pwc',
            'kpmg'
        ]
        
        # Indian cities and locations to filter for
        self.india_locations = [
            'india', 'भारत',
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
            'ajmer', 'akola', 'gulbarga', 'jamnagar', 'ujjain',
            'loni', 'siliguri', 'jhansi', 'ulhasnagar', 'jammu',
            'sangli', 'miraj', 'kupwad', 'belgaum', 'mangalore',
            'ambattur', 'tirunelveli', 'malegaon', 'gaya', 'jalgaon',
            'udaipur', 'maheshtala', 'davanagere', 'kozhikode', 'kurnool',
            'rajpur sonarpur', 'rajahmundry', 'bokaro', 'south dumdum',
            'bellary', 'patiala', 'gopalpur', 'agartala', 'bhagalpur',
            'muzaffarnagar', 'bhatpara', 'panihati', 'latur', 'dhule',
            'rohtak', 'korba', 'bhilwara', 'berhampur', 'muzaffarpur',
            'ahmednagar', 'mathura', 'kollam', 'avadi', 'kadapa',
            'kamarhati', 'sambalpur', 'bilaspur', 'shahjahanpur',
            'satara', 'bijapur', 'rampur', 'shivamogga', 'chandrapur',
            'junagadh', 'thrissur', 'alwar', 'bardhaman', 'kulti',
            'kakinada', 'nizamabad', 'parbhani', 'tumkur', 'khammam',
            'ozhukarai', 'bihar sharif', 'panipat', 'darbhanga',
            'bally', 'aizawl', 'dewas', 'ichalkaranji', 'karnal',
            'bathinda', 'jalna', 'eluru', 'kirari suleman nagar',
            'barabanki', 'purnia', 'satna', 'mau', 'sonipat',
            'farrukhabad', 'sagar', 'rourkela', 'durg', 'imphal',
            'ratlam', 'hapur', 'arrah', 'anantapur', 'karimnagar',
            'etawah', 'ambernath', 'north dumdum', 'bharatpur',
            'begusarai', 'new delhi', 'old delhi', 'central delhi',
            'north delhi', 'south delhi', 'east delhi', 'west delhi',
            'mumbai suburban', 'thane district', 'pune district',
            'bangalore urban', 'bangalore rural', 'hyderabad district',
            'chennai district', 'kolkata district', 'ahmedabad district',
            'kanpur district', 'lucknow district', 'jaipur district',
            'indore district', 'nagpur district', 'patna district',
            'bhopal district', 'vadodara district', 'ludhiana district',
            'agra district', 'meerut district', 'nashik district',
            'faridabad district', 'rajkot district', 'varanasi district',
            'srinagar district', 'aurangabad district', 'dhanbad district',
            'amritsar district', 'allahabad district', 'ranchi district',
            'jabalpur district', 'gwalior district', 'coimbatore district',
            'vijayawada district', 'jodhpur district', 'madurai district',
            'raipur district', 'kota district', 'guwahati district',
            'chandigarh district', 'thiruvananthapuram district',
            'solapur district', 'hubballi district', 'tiruchirappalli district',
            'bareilly district', 'mysore district', 'tiruppur district',
            'aligarh district', 'jalandhar district', 'bhubaneswar district',
            'salem district', 'warangal district', 'guntur district',
            'bhiwandi district', 'saharanpur district', 'gorakhpur district',
            'bikaner district', 'amravati district', 'jamshedpur district',
            'bhilai district', 'cuttack district', 'firozabad district',
            'kochi district', 'bhavnagar district', 'dehradun district',
            'durgapur district', 'asansol district', 'rourkela district',
            'nanded district', 'kolhapur district', 'ajmer district',
            'akola district', 'gulbarga district', 'jamnagar district',
            'ujjain district', 'loni district', 'siliguri district',
            'jhansi district', 'ulhasnagar district', 'jammu district',
            'sangli district', 'belgaum district', 'mangalore district',
            'ambattur district', 'tirunelveli district', 'malegaon district',
            'gaya district', 'jalgaon district', 'udaipur district',
            'maheshtala district', 'davanagere district', 'kozhikode district',
            'kurnool district', 'rajahmundry district', 'bokaro district',
            'bellary district', 'patiala district', 'agartala district',
            'bhagalpur district', 'muzaffarnagar district', 'bhatpara district',
            'panihati district', 'latur district', 'dhule district',
            'rohtak district', 'korba district', 'bhilwara district',
            'berhampur district', 'muzaffarpur district', 'ahmednagar district',
            'mathura district', 'kollam district', 'avadi district',
            'kadapa district', 'kamarhati district', 'sambalpur district',
            'bilaspur district', 'shahjahanpur district', 'satara district',
            'bijapur district', 'rampur district', 'shivamogga district',
            'chandrapur district', 'junagadh district', 'thrissur district',
            'alwar district', 'bardhaman district', 'kulti district',
            'kakinada district', 'nizamabad district', 'parbhani district',
            'tumkur district', 'khammam district', 'ozhukarai district',
            'bihar sharif district', 'panipat district', 'darbhanga district',
            'bally district', 'aizawl district', 'dewas district',
            'ichalkaranji district', 'karnal district', 'bathinda district',
            'jalna district', 'eluru district', 'barabanki district',
            'purnia district', 'satna district', 'mau district',
            'sonipat district', 'farrukhabad district', 'sagar district',
            'durg district', 'imphal district', 'ratlam district',
            'hapur district', 'arrah district', 'anantapur district',
            'karimnagar district', 'etawah district', 'ambernath district',
            'bharatpur district', 'begusarai district'
        ]
    
    def is_india_location(self, location: str) -> bool:
        """
        Check if a location string indicates an Indian location.
        
        Args:
            location: Location string to check
            
        Returns:
            True if location appears to be in India
        """
        if not location:
            return False
            
        location_lower = location.lower().strip()
        
        # Direct matches
        for india_loc in self.india_locations:
            if india_loc.lower() in location_lower:
                return True
                
        # Additional patterns
        india_patterns = [
            'in ',  # "Mumbai, IN"
            ', in',  # "Mumbai, IN"
            'india',
            'भारत',
            ' in)',  # "(Mumbai, IN)"
            '(in)',
            'karnataka', 'maharashtra', 'tamil nadu', 'delhi', 'punjab',
            'gujarat', 'rajasthan', 'uttar pradesh', 'madhya pradesh',
            'west bengal', 'bihar', 'odisha', 'telangana', 'andhra pradesh',
            'kerala', 'haryana', 'jharkhand', 'assam', 'chhattisgarh',
            'uttarakhand', 'himachal pradesh', 'tripura', 'meghalaya',
            'manipur', 'nagaland', 'goa', 'arunachal pradesh', 'mizoram',
            'sikkim', 'jammu and kashmir', 'ladakh', 'andaman and nicobar',
            'chandigarh', 'dadra and nagar haveli', 'daman and diu',
            'lakshadweep', 'puducherry'
        ]
        
        for pattern in india_patterns:
            if pattern in location_lower:
                return True
                
        return False
    
    def filter_india_jobs(self, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter jobs to only include those in Indian locations."""
        india_jobs = []
        
        for job in jobs:
            # Check location field
            location_info = job.get('location', {})
            location = location_info.get('name', '') if location_info else ''
            
            # Check offices field as well
            offices = job.get('offices', [])
            office_locations = [office.get('name', '') for office in offices if office.get('name')]
            
            # Combine all location info
            all_locations = [location] + office_locations
            location_text = ' '.join(filter(None, all_locations))
            
            if self.is_india_location(location_text):
                india_jobs.append(job)
                
        return india_jobs

    def fetch_jobs_for_company(self, company: str) -> List[Dict[str, Any]]:
        """Fetch all jobs for a specific company from Greenhouse API."""
        url = f"{self.base_url}/{company}/jobs"
        data = self.fetch_data(url)
        
        if isinstance(data, dict) and 'jobs' in data:
            return data['jobs']
        elif isinstance(data, list):
            return data
        else:
            logger.warning(f"Unexpected data format for {company}: {type(data)}")
            return []
    
    def fetch_data_for_scraping(self) -> List[Dict[str, Any]]:
        """Fetch job data from multiple companies and filter for India locations."""
        all_india_jobs = []
        
        for company in self.company_names:
            logger.info(f"Fetching jobs for {company} from Greenhouse")
            
            try:
                company_jobs = self.fetch_jobs_for_company(company)
                india_jobs = self.filter_india_jobs(company_jobs)
                
                # Add company name to each job
                for job in india_jobs:
                    job['company_name'] = company.title()  # Store company name
                
                if india_jobs:
                    logger.info(f"Found {len(india_jobs)} India jobs for {company}")
                    all_india_jobs.extend(india_jobs)
                else:
                    logger.info(f"No India jobs found for {company}")
                    
            except Exception as e:
                logger.error(f"Failed to fetch jobs for {company}: {e}")
                continue
            
            # Add delay between companies to be respectful
            sleep(1)
        
        logger.info(f"Total India jobs found across all companies: {len(all_india_jobs)}")
        return all_india_jobs
    
    def parse_data(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Parse Greenhouse job data - already filtered for India in fetch_data_for_scraping.
        
        Args:
            raw_data: Raw job data from Greenhouse API (already filtered for India)
            
        Returns:
            List of parsed job dictionaries
        """
        # Raw data is already filtered for India, so just return it
        return raw_data
    
    # Required abstract methods from BaseScraper
    def _extract_external_id(self, raw_job: Dict[str, Any]) -> str:
        """Extract external ID from raw job data."""
        return str(raw_job.get('id', ''))
    
    def _extract_title(self, raw_job: Dict[str, Any]) -> str:
        """Extract job title from raw job data."""
        return raw_job.get('title', '').strip()
    
    def _extract_company(self, raw_job: Dict[str, Any]) -> str:
        """Extract company name from raw job data."""
        # First try the stored company name we added during fetching
        if 'company_name' in raw_job:
            return raw_job['company_name']
        
        # Fallback to Greenhouse API structure
        company_data = raw_job.get('company', {})
        return company_data.get('name', '') if company_data else ''
    
    def _extract_location(self, raw_job: Dict[str, Any]) -> str:
        """Extract location from raw job data."""
        location_info = raw_job.get('location', {})
        location = location_info.get('name', '') if location_info else ''
        
        # Extract offices
        offices = raw_job.get('offices', [])
        office_names = [office.get('name', '') for office in offices if office.get('name')]
        
        # Combine location info
        location_parts = [location]
        if office_names:
            location_parts.extend(office_names)
        
        return ', '.join(filter(None, location_parts))
    
    def _extract_description(self, raw_job: Dict[str, Any]) -> str:
        """Extract job description from raw job data."""
        return raw_job.get('content', '').strip()
    
    def _extract_url(self, raw_job: Dict[str, Any]) -> str:
        """Extract job URL from raw job data."""
        return raw_job.get('absolute_url', '')
    
    def _extract_date_posted(self, raw_job: Dict[str, Any]) -> date:
        """Extract posting date from raw job data."""
        updated_at = raw_job.get('updated_at')
        if updated_at:
            try:
                # Greenhouse uses ISO format: "2023-12-07T10:30:00.000Z"
                return datetime.fromisoformat(
                    updated_at.replace('Z', '+00:00')
                ).date()
            except (ValueError, AttributeError):
                return date.today()
        return date.today()
