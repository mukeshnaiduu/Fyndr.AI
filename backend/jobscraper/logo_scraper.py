"""
Company Logo Scraper Service

This service scrapes company logos from various sources:
1. Company website favicon
2. Clearbit Logo API
3. Logo APIs (e.g., Brandfetch)
4. Google favicon service
5. Social media profile images
"""

import logging
import requests
from urllib.parse import urljoin, urlparse
from typing import Optional, List
import re
import time
from bs4 import BeautifulSoup


logger = logging.getLogger(__name__)


class LogoScraper:
    """Service to scrape company logos from various sources."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.request_delay = 0.5  # seconds between requests
        
    def get_company_logo(self, company_name: str, job_url: str = None) -> Optional[str]:
        """
        Get company logo URL using multiple strategies.
        
        Args:
            company_name: Name of the company
            job_url: URL of the job posting (might contain company domain)
            
        Returns:
            URL to company logo or None if not found
        """
        logo_url = None
        
        # Strategy 1: Try Clearbit Logo API (free tier)
        try:
            logo_url = self._get_clearbit_logo(company_name)
            if logo_url:
                logger.info(f"Found logo for {company_name} via Clearbit")
                return logo_url
        except Exception as e:
            logger.debug(f"Clearbit logo search failed for {company_name}: {e}")
        
        # Strategy 2: Try to extract company domain from job URL
        if job_url:
            try:
                logo_url = self._get_logo_from_job_url(job_url)
                if logo_url:
                    logger.info(f"Found logo for {company_name} via job URL")
                    return logo_url
            except Exception as e:
                logger.debug(f"Logo extraction from job URL failed for {company_name}: {e}")
        
        # Strategy 3: Try Google favicon service
        try:
            logo_url = self._get_google_favicon(company_name)
            if logo_url:
                logger.info(f"Found logo for {company_name} via Google favicon")
                return logo_url
        except Exception as e:
            logger.debug(f"Google favicon search failed for {company_name}: {e}")
        
        # Strategy 4: Try company website search
        try:
            logo_url = self._search_company_website(company_name)
            if logo_url:
                logger.info(f"Found logo for {company_name} via website search")
                return logo_url
        except Exception as e:
            logger.debug(f"Company website search failed for {company_name}: {e}")
        
        logger.warning(f"No logo found for company: {company_name}")
        return None
    
    def _get_clearbit_logo(self, company_name: str) -> Optional[str]:
        """
        Use Clearbit Logo API to get company logo.
        
        Clearbit provides free logo API: https://logo.clearbit.com/{domain}
        """
        # Try to guess company domain
        domain = self._guess_company_domain(company_name)
        if not domain:
            return None
        
        logo_url = f"https://logo.clearbit.com/{domain}"
        
        # Check if the logo exists
        try:
            response = self.session.head(logo_url, timeout=5)
            if response.status_code == 200:
                return logo_url
        except Exception:
            pass
        
        return None
    
    def _get_logo_from_job_url(self, job_url: str) -> Optional[str]:
        """
        Extract company logo from the job posting page.
        """
        try:
            time.sleep(self.request_delay)
            response = self.session.get(job_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for common logo selectors
            logo_selectors = [
                'img[alt*="logo" i]',
                'img[class*="logo" i]',
                'img[id*="logo" i]',
                '.company-logo img',
                '.logo img',
                '[data-testid*="logo"] img',
                '.navbar-brand img',
                '.header-logo img',
                'img[src*="logo" i]',
            ]
            
            for selector in logo_selectors:
                logo_elements = soup.select(selector)
                for img in logo_elements:
                    src = img.get('src') or img.get('data-src')
                    if src:
                        # Convert relative URLs to absolute
                        logo_url = urljoin(job_url, src)
                        if self._is_valid_logo_url(logo_url):
                            return logo_url
            
            # Try to get favicon as fallback
            favicon_links = soup.find_all('link', rel=lambda x: x and 'icon' in x.lower())
            for link in favicon_links:
                href = link.get('href')
                if href:
                    favicon_url = urljoin(job_url, href)
                    if self._is_valid_logo_url(favicon_url):
                        return favicon_url
                        
        except Exception as e:
            logger.debug(f"Error extracting logo from job URL {job_url}: {e}")
        
        return None
    
    def _get_google_favicon(self, company_name: str) -> Optional[str]:
        """
        Use Google's favicon service to get company logo.
        """
        domain = self._guess_company_domain(company_name)
        if not domain:
            return None
        
        # Google's favicon service
        favicon_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
        
        try:
            response = self.session.head(favicon_url, timeout=5)
            if response.status_code == 200:
                return favicon_url
        except Exception:
            pass
        
        return None
    
    def _search_company_website(self, company_name: str) -> Optional[str]:
        """
        Search for company website and extract logo.
        """
        domain = self._guess_company_domain(company_name)
        if not domain:
            return None
        
        try:
            company_url = f"https://{domain}"
            time.sleep(self.request_delay)
            response = self.session.get(company_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for logo in common locations
            logo_selectors = [
                'img[alt*="logo" i]',
                'img[class*="logo" i]',
                '.logo img',
                '.navbar-brand img',
                '.header img:first-child',
                'header img:first-child',
            ]
            
            for selector in logo_selectors:
                logo_elements = soup.select(selector)
                for img in logo_elements[:3]:  # Check first 3 matches
                    src = img.get('src') or img.get('data-src')
                    if src:
                        logo_url = urljoin(company_url, src)
                        if self._is_valid_logo_url(logo_url):
                            return logo_url
                            
        except Exception as e:
            logger.debug(f"Error searching company website for {company_name}: {e}")
        
        return None
    
    def _guess_company_domain(self, company_name: str) -> Optional[str]:
        """
        Guess company domain from company name.
        """
        if not company_name:
            return None
        
        # Clean company name
        cleaned_name = re.sub(r'[^\w\s]', '', company_name.lower())
        cleaned_name = re.sub(r'\s+', '', cleaned_name)
        
        # Remove common company suffixes
        suffixes = ['inc', 'llc', 'corp', 'corporation', 'company', 'co', 'ltd', 'limited', 'technologies', 'tech']
        for suffix in suffixes:
            if cleaned_name.endswith(suffix):
                cleaned_name = cleaned_name[:-len(suffix)]
                break
        
        # Try common domain extensions
        possible_domains = [
            f"{cleaned_name}.com",
            f"{cleaned_name}.io",
            f"{cleaned_name}.co",
            f"{cleaned_name}.net",
        ]
        
        return possible_domains[0] if possible_domains else None
    
    def _is_valid_logo_url(self, url: str) -> bool:
        """
        Check if URL points to a valid image.
        """
        if not url:
            return False
        
        try:
            # Check if URL looks like an image
            if not any(ext in url.lower() for ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']):
                # If no image extension, try to check content type
                response = self.session.head(url, timeout=5)
                content_type = response.headers.get('content-type', '')
                if not content_type.startswith('image/'):
                    return False
            
            # Additional checks
            if len(url) > 500:  # URL too long
                return False
            
            if any(skip in url.lower() for skip in ['placeholder', 'default', 'avatar', 'profile']):
                return False
                
            return True
            
        except Exception:
            return False


# Singleton instance
logo_scraper = LogoScraper()


def scrape_company_logo(company_name: str, job_url: str = None) -> Optional[str]:
    """
    Convenience function to scrape company logo.
    
    Args:
        company_name: Name of the company
        job_url: URL of the job posting
        
    Returns:
        URL to company logo or None
    """
    return logo_scraper.get_company_logo(company_name, job_url)
