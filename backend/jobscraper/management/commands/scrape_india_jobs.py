"""
Management command to scrape 1000 fresh, active jobs specifically in India
"""

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from datetime import timedelta
import requests
import json
import time
import random
import logging
from jobscraper.models import JobPosting


class IndiaJobScraper:
    """Enhanced scraper specifically for India jobs from multiple sources"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.target_location = "India"
        self.scraped_count = 0
        self.target_count = 1000
        
        # Major Indian job boards and their APIs/endpoints
        self.sources = {
            'naukri': {
                'base_url': 'https://www.naukri.com/jobapi/v3/search',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Referer': 'https://www.naukri.com/'
                },
                'easy_scrape': True
            },
            'indeed_india': {
                'base_url': 'https://in.indeed.com/jobs',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                'easy_scrape': True
            },
            'linkedin_jobs': {
                'base_url': 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                'easy_scrape': True
            },
            'freshersjobs': {
                'base_url': 'https://www.freshersworld.com',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                'easy_scrape': True
            },
            'foundit': {  # Previously Monster India
                'base_url': 'https://www.foundit.in/jobs',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                'easy_scrape': True
            },
            'timesjobs': {
                'base_url': 'https://www.timesjobs.com/candidate/job-search.html',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                'easy_scrape': True
            },
            'instahyre': {
                'base_url': 'https://www.instahyre.com/search-jobs',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                'easy_scrape': True
            },
            'cutshort': {
                'base_url': 'https://cutshort.io/jobs',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                'easy_scrape': True
            },
            'wellfound': {  # Previously AngelList
                'base_url': 'https://wellfound.com/jobs',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                'easy_scrape': True
            },
            'internshala': {
                'base_url': 'https://internshala.com/jobs',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                'easy_scrape': True
            },
            'shine': {
                'base_url': 'https://www.shine.com/job-search',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                'easy_scrape': True
            },
            'hirist': {
                'base_url': 'https://www.hirist.com/jobs',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                'easy_scrape': True
            }
        }
        
        # Popular India tech hubs for location targeting
        self.india_locations = [
            'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 
            'Pune', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida',
            'Kochi', 'Indore', 'Chandigarh', 'Jaipur', 'Coimbatore'
        ]
        
        # Popular job categories in India
        self.job_categories = [
            'Software Developer', 'Data Scientist', 'DevOps Engineer',
            'Product Manager', 'Business Analyst', 'Digital Marketing',
            'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
            'Mobile App Developer', 'UI/UX Designer', 'QA Engineer',
            'Cloud Engineer', 'Cybersecurity Analyst', 'AI/ML Engineer'
        ]

    def scrape_naukri_jobs(self, location, category, limit=50):
        """Scrape jobs from Naukri.com"""
        jobs = []
        try:
            params = {
                'noOfResults': limit,
                'urlType': 'search_by_key_loc',
                'searchType': 'adv',
                'location': location,
                'keyword': category,
                'experience': '0,15',  # 0-15 years experience
                'salary': '0,50',      # 0-50 lakh salary range
                'sort': '1'            # Sort by relevance
            }
            
            response = requests.get(
                self.sources['naukri']['base_url'],
                params=params,
                headers=self.sources['naukri']['headers'],
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'jobDetails' in data:
                    for job_data in data['jobDetails'][:limit]:
                        job = self.parse_naukri_job(job_data, location)
                        if job:
                            jobs.append(job)
                            
        except Exception as e:
            self.logger.error(f"Error scraping Naukri jobs: {str(e)}")
            
        return jobs

    def parse_naukri_job(self, job_data, location):
        """Parse job data from Naukri API response with comprehensive fields"""
        try:
            # Basic job details
            title = job_data.get('title', '').strip()
            company = job_data.get('companyName', '').strip()
            job_location = job_data.get('placeholders', [{}])[0].get('label', location)
            
            # Salary information
            salary_info = job_data.get('placeholders', [])
            salary_text = ''
            for placeholder in salary_info:
                if 'lakh' in placeholder.get('label', '').lower() or '₹' in placeholder.get('label', ''):
                    salary_text = placeholder.get('label', '')
                    break
            
            # Experience and skills
            experience = job_data.get('experience', '')
            skills = job_data.get('tagsAndSkills', '')
            
            # Job description
            description = job_data.get('jobDescription', '')
            
            # Job URL
            job_url = f"https://www.naukri.com{job_data.get('jdURL', '')}"
            
            # Extract posting date (if available)
            posted_date = timezone.now() - timedelta(days=random.randint(0, 7))  # Estimate recent posting
            
            # Extract job type and education
            job_type = 'Full-time'  # Default for Naukri
            education = job_data.get('education', '')
            
            # Extract company logo
            company_logo = job_data.get('logoPath', '') or job_data.get('companyLogo', '')
            if company_logo and not company_logo.startswith('http'):
                company_logo = f"https://img.naukimg.com/logo_images/{company_logo}"
            
            # Create comprehensive job posting object
            job_posting = {
                # Core Fields
                'title': title,
                'company': company,
                'location': f"{job_location}, India",
                'url': job_url,
                'source': 'naukri.com',
                
                # Salary Information
                'salary_min': self.extract_salary_min(salary_text),
                'salary_max': self.extract_salary_max(salary_text),
                'salary_text': salary_text or 'Not disclosed',
                'currency': 'INR',
                
                # Job Details
                'job_type': job_type,
                'employment_mode': 'Full-time',
                'experience_level': experience,
                'experience_min': self.extract_experience_min(experience),
                'experience_max': self.extract_experience_max(experience),
                
                # Content
                'description': description[:500] + '...' if len(description) > 500 else description,
                'full_description': description,
                'requirements': skills,
                'skills': self.extract_skills_list(skills),
                
                # Education & Benefits
                'education_requirement': education,
                'benefits': self.extract_benefits(description),
                
                # Metadata
                'date_posted': posted_date,
                'date_scraped': timezone.now(),
                'is_active': True,
                'external_id': str(job_data.get('jobId', '')),
                'company_logo': company_logo,
                'verification_status': 'verified',  # Naukri is verified
                
                # Raw data for future processing
                'raw_data': job_data
            }
            
            return job_posting
            
        except Exception as e:
            self.logger.error(f"Error parsing Naukri job: {str(e)}")
            return None

    def scrape_linkedin_jobs(self, location, category, limit=50):
        """Scrape jobs from LinkedIn"""
        jobs = []
        try:
            params = {
                'keywords': category,
                'location': f"{location}, India",
                'start': 0,
                'count': limit,
                'f_TPR': 'r604800',  # Past week
                'f_JT': 'F'  # Full-time
            }
            
            # Use the jobs guest API endpoint
            search_url = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search'
            
            response = requests.get(
                search_url,
                params=params,
                headers=self.sources['linkedin_jobs']['headers'],
                timeout=30
            )
            
            if response.status_code == 200:
                jobs = self.parse_linkedin_html(response.text, location)
                
        except Exception as e:
            self.logger.error(f"Error scraping LinkedIn jobs: {str(e)}")
            
        return jobs[:limit]

    def parse_linkedin_html(self, html_content, location):
        """Parse job data from LinkedIn HTML response"""
        jobs = []
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            job_cards = soup.find_all('div', {'class': 'base-card'}) or \
                       soup.find_all('li', {'class': 'result-card'}) or \
                       soup.find_all('div', {'class': 'job-search-card'})
            
            for card in job_cards:
                try:
                    title_elem = card.find('h3', {'class': 'base-search-card__title'}) or \
                                card.find('a', {'class': 'result-card__full-card-link'}) or \
                                card.find('h3', {'class': 'job-search-card__title'})
                    title = title_elem.get_text().strip() if title_elem else ''
                    
                    company_elem = card.find('h4', {'class': 'base-search-card__subtitle'}) or \
                                  card.find('a', {'class': 'result-card__subtitle-link'}) or \
                                  card.find('a', {'class': 'job-search-card__subtitle-link'})
                    company = company_elem.get_text().strip() if company_elem else ''
                    
                    location_elem = card.find('span', {'class': 'job-search-card__location'})
                    job_location = location_elem.get_text().strip() if location_elem else location
                    
                    job_link = title_elem.get('href', '') if title_elem else ''
                    job_url = job_link if job_link.startswith('http') else f"https://www.linkedin.com{job_link}"
                    
                    # Extract description/snippet
                    desc_elem = card.find('p', {'class': 'job-search-card__snippet'}) or \
                               card.find('div', {'class': 'job-search-card__snippet'})
                    description = desc_elem.get_text().strip() if desc_elem else ''
                    
                    # Extract posting date
                    time_elem = card.find('time') or card.find('span', {'class': 'job-search-card__listdate'})
                    posted_date = self.parse_posting_date(time_elem.get_text() if time_elem else '')
                    
                    # Extract job type
                    job_type = self.extract_job_type(description, title)
                    
                    if title and company:
                        job_posting = {
                            # Core Fields
                            'title': title,
                            'company': company,
                            'location': f"{job_location}, India",
                            'url': job_url,
                            'source': 'linkedin.com',
                            
                            # Salary Information (LinkedIn rarely shows salary)
                            'salary_text': 'Not disclosed',
                            'currency': 'INR',
                            
                            # Job Details
                            'job_type': job_type,
                            'employment_mode': job_type,
                            'experience_level': self.extract_experience_from_description(description),
                            'experience_min': self.extract_experience_min(description),
                            'experience_max': self.extract_experience_max(description),
                            
                            # Content
                            'description': description[:500] + '...' if len(description) > 500 else description,
                            'full_description': description,
                            'requirements': description,
                            'skills': self.extract_skills_list(title + ' ' + description),
                            
                            # Benefits
                            'benefits': self.extract_benefits(description),
                            
                            # Metadata
                            'date_posted': posted_date,
                            'date_scraped': timezone.now(),
                            'is_active': True,
                            'verification_status': 'verified',  # LinkedIn is verified
                            
                            # Raw data
                            'raw_data': {'description': description}
                        }
                        jobs.append(job_posting)
                        
                except Exception as e:
                    continue
                    
        except ImportError:
            self.logger.error("BeautifulSoup not installed. Please install: pip install beautifulsoup4")
        except Exception as e:
            self.logger.error(f"Error parsing LinkedIn HTML: {str(e)}")
            
        return jobs

    def scrape_timesjobs(self, location, category, limit=50):
        """Scrape jobs from TimesJobs"""
        jobs = []
        try:
            params = {
                'searchType': 'personalizedSearch',
                'from': 'submit',
                'txtKeywords': category,
                'txtLocation': location
            }
            
            response = requests.get(
                self.sources['timesjobs']['base_url'],
                params=params,
                headers=self.sources['timesjobs']['headers'],
                timeout=30
            )
            
            if response.status_code == 200:
                jobs = self.parse_timesjobs_html(response.text, location)
                
        except Exception as e:
            self.logger.error(f"Error scraping TimesJobs: {str(e)}")
            
        return jobs[:limit]

    def parse_timesjobs_html(self, html_content, location):
        """Parse job data from TimesJobs HTML response"""
        jobs = []
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            job_cards = soup.find_all('li', {'class': 'clearfix job-bx'}) or \
                       soup.find_all('div', {'class': 'job-bx'})
            
            for card in job_cards:
                try:
                    title_elem = card.find('h2') or card.find('a', {'class': 'job-title'})
                    title = title_elem.get_text().strip() if title_elem else ''
                    
                    company_elem = card.find('h3', {'class': 'joblist-comp-name'}) or \
                                  card.find('span', {'class': 'comp-name'})
                    company = company_elem.get_text().strip() if company_elem else ''
                    
                    if title and company:
                        job_posting = {
                            'title': title,
                            'company': company,
                            'location': f"{location}, India",
                            'url': 'https://www.timesjobs.com',
                            'source': 'timesjobs.com',
                            'description': '',
                            'employment_mode': 'Full-time',
                            'date_posted': timezone.now(),
                            'date_scraped': timezone.now(),
                            'is_active': True,
                            'currency': 'INR'
                        }
                        jobs.append(job_posting)
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error parsing TimesJobs HTML: {str(e)}")
            
        return jobs

    def scrape_instahyre_jobs(self, location, category, limit=50):
        """Scrape jobs from Instahyre"""
        jobs = []
        try:
            search_url = f"https://www.instahyre.com/search-jobs/?q={category}&l={location}"
            
            response = requests.get(
                search_url,
                headers=self.sources['instahyre']['headers'],
                timeout=30
            )
            
            if response.status_code == 200:
                jobs = self.parse_instahyre_html(response.text, location)
                
        except Exception as e:
            self.logger.error(f"Error scraping Instahyre jobs: {str(e)}")
            
        return jobs[:limit]

    def parse_instahyre_html(self, html_content, location):
        """Parse job data from Instahyre HTML response"""
        jobs = []
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            job_cards = soup.find_all('div', {'class': 'job-listing'}) or \
                       soup.find_all('div', {'class': 'search-job-item'})
            
            for card in job_cards:
                try:
                    title_elem = card.find('h3') or card.find('a', {'class': 'job-title'})
                    title = title_elem.get_text().strip() if title_elem else ''
                    
                    company_elem = card.find('span', {'class': 'company-name'}) or \
                                  card.find('div', {'class': 'company'})
                    company = company_elem.get_text().strip() if company_elem else ''
                    
                    if title and company:
                        job_posting = {
                            'title': title,
                            'company': company,
                            'location': f"{location}, India",
                            'url': 'https://www.instahyre.com',
                            'source': 'instahyre.com',
                            'description': '',
                            'employment_mode': 'Full-time',
                            'date_posted': timezone.now(),
                            'date_scraped': timezone.now(),
                            'is_active': True,
                            'currency': 'INR'
                        }
                        jobs.append(job_posting)
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error parsing Instahyre HTML: {str(e)}")
            
        return jobs

    def scrape_indeed_india_jobs(self, location, category, limit=50):
        """Scrape jobs from Indeed India"""
        jobs = []
        try:
            params = {
                'q': category,
                'l': f"{location}, India",
                'limit': limit,
                'sort': 'date',
                'fromage': '7'  # Jobs posted in last 7 days
            }
            
            response = requests.get(
                self.sources['indeed_india']['base_url'],
                params=params,
                headers=self.sources['indeed_india']['headers'],
                timeout=30
            )
            
            if response.status_code == 200:
                # Parse HTML response (Indeed doesn't have public API)
                jobs = self.parse_indeed_html(response.text, location)
                
        except Exception as e:
            self.logger.error(f"Error scraping Indeed India jobs: {str(e)}")
            
        return jobs[:limit]

    def parse_indeed_html(self, html_content, location):
        """Parse job data from Indeed HTML response"""
        jobs = []
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Find job cards
            job_cards = soup.find_all('div', {'class': 'job_seen_beacon'}) or \
                       soup.find_all('div', {'data-jk': True})
            
            for card in job_cards:
                try:
                    title_elem = card.find('h2', {'class': 'jobTitle'}) or \
                                card.find('a', {'data-jk': True})
                    title = title_elem.get_text().strip() if title_elem else ''
                    
                    company_elem = card.find('span', {'class': 'companyName'})
                    company = company_elem.get_text().strip() if company_elem else ''
                    
                    location_elem = card.find('div', {'class': 'companyLocation'})
                    job_location = location_elem.get_text().strip() if location_elem else location
                    
                    # Job URL
                    job_link = title_elem.get('href', '') if title_elem else ''
                    job_url = f"https://in.indeed.com{job_link}" if job_link else ''
                    
                    # Salary
                    salary_elem = card.find('span', {'class': 'salary-snippet'})
                    salary_text = salary_elem.get_text().strip() if salary_elem else ''
                    
                    # Summary/Description
                    summary_elem = card.find('div', {'class': 'summary'}) or \
                                  card.find('div', {'class': 'job-snippet'})
                    summary = summary_elem.get_text().strip() if summary_elem else ''
                    
                    # Extract job type from title and description
                    job_type = self.extract_job_type(summary, title)
                    
                    # Extract posting date
                    date_elem = card.find('span', {'class': 'date'})
                    posted_date = self.parse_posting_date(date_elem.get_text() if date_elem else '')
                    
                    # Extract company rating if available
                    rating_elem = card.find('span', {'class': 'ratingsDisplay'})
                    company_rating = rating_elem.get_text().strip() if rating_elem else ''
                    
                    if title and company:
                        job_posting = {
                            # Core Fields
                            'title': title,
                            'company': company,
                            'location': f"{job_location}, India",
                            'url': job_url,
                            'source': 'indeed.com',
                            
                            # Salary Information
                            'salary_min': self.extract_salary_min(salary_text),
                            'salary_max': self.extract_salary_max(salary_text),
                            'salary_text': salary_text or 'Not disclosed',
                            'currency': 'INR',
                            
                            # Job Details
                            'job_type': job_type,
                            'employment_mode': job_type,
                            'experience_level': self.extract_experience_from_description(summary),
                            'experience_min': self.extract_experience_min(summary),
                            'experience_max': self.extract_experience_max(summary),
                            
                            # Content
                            'description': summary[:500] + '...' if len(summary) > 500 else summary,
                            'full_description': summary,
                            'requirements': summary,
                            'skills': self.extract_skills_list(summary),
                            
                            # Benefits
                            'benefits': self.extract_benefits(summary),
                            
                            # Metadata
                            'date_posted': posted_date,
                            'date_scraped': timezone.now(),
                            'is_active': True,
                            'company_rating': company_rating,
                            'verification_status': 'verified',
                            
                            # Raw data
                            'raw_data': {'html_summary': summary, 'company_rating': company_rating}
                        }
                        jobs.append(job_posting)
                        
                except Exception as e:
                    continue
                    
        except ImportError:
            self.logger.error("BeautifulSoup not installed. Please install: pip install beautifulsoup4")
        except Exception as e:
            self.logger.error(f"Error parsing Indeed HTML: {str(e)}")
            
        return jobs

    def extract_salary_min(self, salary_text):
        """Extract minimum salary from salary text"""
        try:
            if not salary_text:
                return None
            
            import re
            # Look for patterns like "5-10 lakh" or "₹500000-₹1000000"
            salary_text = salary_text.lower()
            
            if 'lakh' in salary_text:
                numbers = re.findall(r'(\d+(?:\.\d+)?)', salary_text)
                if numbers:
                    return float(numbers[0]) * 100000  # Convert lakh to rupees
            elif '₹' in salary_text:
                numbers = re.findall(r'₹(\d+(?:,\d+)*)', salary_text)
                if numbers:
                    return float(numbers[0].replace(',', ''))
                    
        except:
            pass
        return None

    def extract_salary_max(self, salary_text):
        """Extract maximum salary from salary text"""
        try:
            if not salary_text:
                return None
            
            import re
            salary_text = salary_text.lower()
            
            if 'lakh' in salary_text:
                numbers = re.findall(r'(\d+(?:\.\d+)?)', salary_text)
                if len(numbers) >= 2:
                    return float(numbers[1]) * 100000  # Convert lakh to rupees
                elif len(numbers) == 1:
                    return float(numbers[0]) * 100000
            elif '₹' in salary_text:
                numbers = re.findall(r'₹(\d+(?:,\d+)*)', salary_text)
                if len(numbers) >= 2:
                    return float(numbers[1].replace(',', ''))
                    
        except:
            pass
        return None

    def extract_experience_min(self, experience_text):
        """Extract minimum experience from experience text"""
        try:
            if not experience_text:
                return 0
            
            import re
            # Look for patterns like "2-5 years" or "3+ years"
            numbers = re.findall(r'(\d+)', experience_text.lower())
            if numbers:
                return int(numbers[0])
                
        except:
            pass
        return 0

    def extract_experience_max(self, experience_text):
        """Extract maximum experience from experience text"""
        try:
            if not experience_text:
                return None
            
            import re
            numbers = re.findall(r'(\d+)', experience_text.lower())
            if len(numbers) >= 2:
                return int(numbers[1])
            elif len(numbers) == 1:
                # If it says "3+ years", assume max is 3+5
                return int(numbers[0]) + 5
                
        except:
            pass
        return None

    def extract_skills_list(self, skills_text):
        """Extract skills as a list from skills text"""
        try:
            if not skills_text:
                return []
            
            # Common separators for skills
            separators = [',', '|', ';', '•', '·', '\n', ' - ']
            skills = [skills_text]
            
            for sep in separators:
                new_skills = []
                for skill in skills:
                    new_skills.extend([s.strip() for s in skill.split(sep) if s.strip()])
                skills = new_skills
            
            # Clean and filter skills
            cleaned_skills = []
            for skill in skills[:10]:  # Limit to 10 skills
                skill = skill.strip().title()
                if len(skill) > 1 and len(skill) < 30:  # Reasonable skill length
                    cleaned_skills.append(skill)
            
            return cleaned_skills
            
        except:
            pass
        return []

    def extract_benefits(self, description):
        """Extract benefits from job description"""
        try:
            if not description:
                return []
            
            benefits = []
            description_lower = description.lower()
            
            # Common benefits to look for
            benefit_keywords = {
                'remote': ['remote', 'work from home', 'wfh'],
                'health_insurance': ['health insurance', 'medical insurance', 'health benefits'],
                'flexible_hours': ['flexible hours', 'flexible timing', 'flexi time'],
                'esops': ['esop', 'stock option', 'equity'],
                'learning': ['training', 'learning', 'certification', 'upskilling'],
                'bonus': ['bonus', 'incentive', 'performance bonus'],
                'leaves': ['paid leave', 'sick leave', 'vacation'],
                'food': ['free food', 'meal', 'cafeteria', 'lunch']
            }
            
            for benefit_type, keywords in benefit_keywords.items():
                for keyword in keywords:
                    if keyword in description_lower:
                        benefits.append(benefit_type.replace('_', ' ').title())
                        break
            
            return list(set(benefits))  # Remove duplicates
            
        except:
            pass
        return []

    def extract_job_type(self, description, title):
        """Extract job type from description and title"""
        try:
            text = f"{title} {description}".lower()
            
            if any(word in text for word in ['intern', 'internship']):
                return 'Internship'
            elif any(word in text for word in ['contract', 'contractor', 'freelance']):
                return 'Contract'
            elif any(word in text for word in ['part time', 'part-time']):
                return 'Part-time'
            else:
                return 'Full-time'
                
        except:
            pass
        return 'Full-time'

    def extract_experience_from_description(self, text):
        """Extract experience requirement from job description"""
        try:
            if not text:
                return ''
            
            import re
            # Look for experience patterns
            exp_patterns = [
                r'(\d+)[\s\-\+]*(?:to|-)[\s]*(\d+)[\s]*years?',
                r'(\d+)\+[\s]*years?',
                r'(\d+)[\s]*years?[\s]*(?:of\s+)?experience',
                r'experience[\s]*:?[\s]*(\d+)[\s\-]*(\d+)?[\s]*years?'
            ]
            
            text_lower = text.lower()
            for pattern in exp_patterns:
                match = re.search(pattern, text_lower)
                if match:
                    if match.group(2):  # Range like "2-5 years"
                        return f"{match.group(1)}-{match.group(2)} years"
                    else:  # Single number like "3+ years"
                        return f"{match.group(1)}+ years"
            
            # If no specific pattern found, look for fresher/entry level
            if any(word in text_lower for word in ['fresher', 'entry level', 'no experience', '0 years']):
                return '0-1 years'
                
        except:
            pass
        return ''

    def parse_posting_date(self, date_text):
        """Parse posting date from various formats"""
        try:
            if not date_text:
                return timezone.now() - timedelta(days=random.randint(0, 7))
            
            date_text = date_text.lower().strip()
            now = timezone.now()
            
            if 'today' in date_text or 'just posted' in date_text:
                return now
            elif 'yesterday' in date_text:
                return now - timedelta(days=1)
            elif 'days ago' in date_text:
                import re
                days_match = re.search(r'(\d+)', date_text)
                if days_match:
                    days = int(days_match.group(1))
                    return now - timedelta(days=days)
            elif 'week' in date_text:
                weeks_match = re.search(r'(\d+)', date_text)
                weeks = int(weeks_match.group(1)) if weeks_match else 1
                return now - timedelta(weeks=weeks)
            elif 'month' in date_text:
                months_match = re.search(r'(\d+)', date_text)
                months = int(months_match.group(1)) if months_match else 1
                return now - timedelta(days=months * 30)
            
        except:
            pass
        
        # Default to random recent date
        return timezone.now() - timedelta(days=random.randint(0, 7))

    def save_job_posting(self, job_data):
        """Save job posting to database with duplicate checking"""
        try:
            # Normalize and enrich minimal fields
            # Ensure URL has a scheme
            url = (job_data.get('url') or '').strip()
            if url and not url.lower().startswith(('http://', 'https://')):
                url = f"https://{url}"
                job_data['url'] = url

            # Ensure apply_url present; default to url
            if not job_data.get('apply_url'):
                job_data['apply_url'] = job_data.get('url')

            # Default metadata for scraped jobs
            job_data.setdefault('source_type', 'scraped')
            job_data.setdefault('application_mode', 'redirect')
            # Check for duplicates by title, company, and location
            existing = JobPosting.objects.filter(
                title__iexact=job_data['title'],
                company__iexact=job_data['company'],
                location__icontains=job_data['location']
            ).first()
            
            if existing:
                self.logger.info(f"Duplicate job found, skipping: {job_data['title']} at {job_data['company']}")
                return None
            
            # Create new job posting
            job_posting = JobPosting.objects.create(**job_data)
            self.scraped_count += 1
            self.logger.info(f"Saved job {self.scraped_count}: {job_posting.title} at {job_posting.company}")
            return job_posting
            
        except Exception as e:
            self.logger.error(f"Error saving job posting: {str(e)}")
            return None

    def scrape_all_sources(self):
        """Scrape jobs from all sources until target count is reached"""
        self.logger.info(f"Starting India job scraping - Target: {self.target_count} jobs")
        
        # Define scraping methods for easy iteration
        scraping_methods = [
            ('naukri', self.scrape_naukri_jobs),
            ('indeed_india', self.scrape_indeed_india_jobs),
            ('linkedin', self.scrape_linkedin_jobs),
            ('timesjobs', self.scrape_timesjobs),
            ('instahyre', self.scrape_instahyre_jobs),
        ]
        
        jobs_per_source_location = max(5, self.target_count // (len(scraping_methods) * len(self.india_locations) * len(self.job_categories)))
        
        for location in self.india_locations:
            if self.scraped_count >= self.target_count:
                break
                
            for category in self.job_categories:
                if self.scraped_count >= self.target_count:
                    break
                
                self.logger.info(f"Scraping {category} jobs in {location}")
                
                # Scrape from each source
                for source_name, scraping_method in scraping_methods:
                    if self.scraped_count >= self.target_count:
                        break
                        
                    try:
                        self.logger.info(f"  -> Scraping from {source_name}")
                        jobs = scraping_method(location, category, jobs_per_source_location)
                        
                        for job in jobs:
                            if self.scraped_count >= self.target_count:
                                break
                            if job:
                                saved_job = self.save_job_posting(job)
                                if saved_job:
                                    self.logger.info(f"    ✓ Saved: {job['title']} at {job['company']}")
                        
                        # Add delay between sources
                        time.sleep(random.uniform(1, 3))
                        
                    except Exception as e:
                        self.logger.error(f"Error scraping from {source_name}: {str(e)}")
                        continue
                
                # Add delay between categories
                time.sleep(random.uniform(2, 4))
                
                self.logger.info(f"Progress: {self.scraped_count}/{self.target_count} jobs scraped")
                
                # If we've reached 80% of target from this location, move to next
                if self.scraped_count >= (self.target_count * 0.8):
                    break
        
        self.logger.info(f"Scraping completed! Total jobs scraped: {self.scraped_count}")
        
        # Additional scraping from random sources if we haven't reached the target
        if self.scraped_count < self.target_count:
            self.logger.info("Target not reached, doing additional scraping...")
            remaining = self.target_count - self.scraped_count
            
            for _ in range(min(remaining, 100)):  # Max 100 additional attempts
                if self.scraped_count >= self.target_count:
                    break
                    
                try:
                    # Pick random location, category, and source
                    location = random.choice(self.india_locations)
                    category = random.choice(self.job_categories)
                    source_name, scraping_method = random.choice(scraping_methods)
                    
                    jobs = scraping_method(location, category, 10)
                    for job in jobs:
                        if self.scraped_count >= self.target_count:
                            break
                        if job:
                            self.save_job_posting(job)
                    
                    time.sleep(random.uniform(3, 6))
                    
                except Exception as e:
                    self.logger.error(f"Error in additional scraping: {str(e)}")
                    continue


class Command(BaseCommand):
    help = 'Scrape 1000 fresh, active jobs specifically in India'

    def add_arguments(self, parser):
        parser.add_argument(
            '--target-count',
            type=int,
            default=1000,
            help='Number of jobs to scrape (default: 1000)'
        )
        parser.add_argument(
            '--clear-existing',
            action='store_true',
            help='Clear existing jobs before scraping'
        )

    def handle(self, *args, **options):
        target_count = options['target_count']
        clear_existing = options['clear_existing']
        
        # Clear existing jobs if requested, resilient to missing FK tables on fresh DBs
        if clear_existing:
            try:
                deleted_count = JobPosting.objects.all().delete()[0]
            except Exception:
                # Fallback: raw delete ignoring constraints
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute('TRUNCATE TABLE jobscraper_jobposting RESTART IDENTITY CASCADE')
                deleted_count = 0
            self.stdout.write(
                self.style.WARNING(f'Cleared {deleted_count} existing jobs from database')
            )
        
        # Initialize and run scraper
        scraper = IndiaJobScraper()
        scraper.target_count = target_count
        
        try:
            scraper.scrape_all_sources()
            
            # Report final statistics
            total_jobs = JobPosting.objects.count()
            india_jobs = JobPosting.objects.filter(location__icontains='India').count()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully completed! '
                    f'Total jobs in database: {total_jobs}, '
                    f'India-specific jobs: {india_jobs}'
                )
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error during scraping: {str(e)}')
            )
            raise CommandError(f'Scraping failed: {str(e)}')
