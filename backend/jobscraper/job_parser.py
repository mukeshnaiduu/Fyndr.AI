"""
Enhanced Job Parser

Intelligent parsing system to extract comprehensive job information
from job posting HTML and text content using NLP and pattern matching.
"""

import re
import json
import logging
from typing import Dict, List, Optional, Union
from datetime import datetime, date
from decimal import Decimal
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.chunk import ne_chunk
from nltk.tag import pos_tag

logger = logging.getLogger(__name__)

# Download required NLTK data (run once)
def _ensure_nltk_data():
    """Ensure NLTK data is available"""
    required_data = [
        ('tokenizers/punkt', 'punkt'),
        ('tokenizers/punkt_tab', 'punkt_tab'),
        ('corpora/stopwords', 'stopwords'),
        ('taggers/averaged_perceptron_tagger', 'averaged_perceptron_tagger'),
        ('chunkers/maxent_ne_chunker', 'maxent_ne_chunker'),
        ('corpora/words', 'words')
    ]
    
    for data_path, data_name in required_data:
        try:
            nltk.data.find(data_path)
        except LookupError:
            try:
                nltk.download(data_name, quiet=True)
            except Exception as e:
                logger.warning(f"Failed to download NLTK data {data_name}: {e}")

# Initialize NLTK data
_ensure_nltk_data()


class JobParser:
    """
    Comprehensive job posting parser that extracts structured data
    from unstructured job descriptions and posting content.
    """
    
    def __init__(self):
        # Initialize stop words with fallback
        try:
            self.stop_words = set(stopwords.words('english'))
        except Exception as e:
            logger.warning(f"Failed to load NLTK stopwords, using fallback: {e}")
            # Fallback stop words list
            self.stop_words = {
                'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 
                'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 
                'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 
                'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 
                'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 
                'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 
                'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 
                'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 
                'after', 'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 
                'under', 'again', 'further', 'then', 'once'
            }
        
        # Load predefined skill sets and patterns
        self._load_patterns()
        self._load_skill_databases()
        self._load_company_data()
    
    def _load_patterns(self):
        """Load regex patterns for various job attributes"""
        
        # Salary patterns
        self.salary_patterns = [
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',  # $80,000 - $120,000
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*to\s*\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',  # $80,000 to $120,000
            r'(\d{1,3}(?:,\d{3})*)\s*-\s*(\d{1,3}(?:,\d{3})*)\s*(?:USD|dollars?|per\s+year)',  # 80,000 - 120,000 USD
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*/\s*(?:hour|hr)',  # $25.00/hour
            r'(\d{1,2})\s*-\s*(\d{1,2})\s*(?:LPA|lakhs?)',  # 8 - 12 LPA (Indian salary)
        ]
        
        # Experience level patterns
        self.experience_patterns = {
            'entry': r'(?:entry|junior|graduate|fresher|0-2\s+years?|new\s+grad)',
            'junior': r'(?:junior|1-3\s+years?|early\s+career)',
            'mid': r'(?:mid|middle|3-5\s+years?|4-6\s+years?|intermediate)',
            'senior': r'(?:senior|5\+\s+years?|6\+\s+years?|experienced|lead)',
            'lead': r'(?:lead|principal|staff|architect|team\s+lead)',
            'executive': r'(?:director|vp|vice\s+president|head\s+of|chief|executive)',
        }
        
        # Job type patterns
        self.job_type_patterns = {
            'full-time': r'(?:full.?time|permanent|fte)',
            'part-time': r'(?:part.?time|pte)',
            'contract': r'(?:contract|contractor|freelance|consulting)',
            'internship': r'(?:intern|internship|co.?op)',
            'temporary': r'(?:temp|temporary|seasonal)',
        }
        
        # Employment mode patterns
        self.employment_mode_patterns = {
            'remote': r'(?:remote|work\s+from\s+home|wfh|distributed)',
            'hybrid': r'(?:hybrid|flexible|mix|combination)',
            'on-site': r'(?:on.?site|office|in.?person|onsite)',
        }
        
        # Education patterns
        self.education_patterns = {
            'high-school': r'(?:high\s+school|hs|secondary)',
            'associate': r'(?:associate|aa|as)\s+degree',
            'bachelor': r'(?:bachelor|ba|bs|btech|be)\s+degree',
            'master': r'(?:master|ma|ms|mtech|mba|me)\s+degree',
            'phd': r'(?:phd|doctorate|doctoral)',
        }
        
        # Benefit patterns
        self.benefit_patterns = [
            r'health\s+insurance', r'medical\s+coverage', r'dental',
            r'401\(k\)', r'retirement', r'pension',
            r'paid\s+time\s+off', r'pto', r'vacation',
            r'stock\s+options', r'equity', r'rsu',
            r'life\s+insurance', r'disability',
            r'parental\s+leave', r'maternity', r'paternity',
            r'tuition\s+reimbursement', r'education',
            r'gym\s+membership', r'wellness',
            r'flexible\s+hours', r'work.life\s+balance',
        ]
    
    def _load_skill_databases(self):
        """Load comprehensive skill databases"""
        
        # Programming languages
        self.programming_languages = {
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php',
            'ruby', 'go', 'rust', 'kotlin', 'swift', 'scala', 'r', 'matlab',
            'sql', 'html', 'css', 'sass', 'less', 'coffeescript'
        }
        
        # Frameworks and libraries
        self.frameworks = {
            'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask',
            'spring', 'hibernate', 'laravel', 'symfony', 'rails', 'gin',
            'fastapi', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'keras',
            'scikit-learn', 'opencv', 'matplotlib', 'seaborn'
        }
        
        # Cloud platforms
        self.cloud_platforms = {
            'aws', 'azure', 'gcp', 'google cloud', 'digitalocean', 'heroku',
            'vercel', 'netlify', 'cloudflare'
        }
        
        # Databases
        self.databases = {
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
            'sqlite', 'oracle', 'sql server', 'cassandra', 'dynamodb',
            'firebase', 'supabase'
        }
        
        # Tools and technologies
        self.tools = {
            'docker', 'kubernetes', 'jenkins', 'github', 'gitlab', 'bitbucket',
            'jira', 'confluence', 'slack', 'figma', 'sketch', 'photoshop',
            'illustrator', 'tableau', 'power bi', 'excel', 'git', 'svn',
            'webpack', 'vite', 'babel', 'eslint', 'jest', 'cypress',
            'selenium', 'postman', 'insomnia'
        }
        
        # Soft skills
        self.soft_skills = {
            'leadership', 'communication', 'teamwork', 'problem solving',
            'analytical thinking', 'creativity', 'adaptability', 'time management',
            'project management', 'mentoring', 'collaboration', 'initiative'
        }
        
        # Certifications
        self.certifications = {
            'aws certified', 'azure certified', 'gcp certified', 'pmp',
            'scrum master', 'agile', 'cissp', 'cisa', 'comptia', 'cisco',
            'oracle certified', 'microsoft certified', 'google certified'
        }
    
    def _load_company_data(self):
        """Load company size and industry mappings"""
        
        self.industry_keywords = {
            'technology': ['tech', 'software', 'saas', 'ai', 'ml', 'data science'],
            'finance': ['fintech', 'banking', 'insurance', 'investment', 'trading'],
            'healthcare': ['health', 'medical', 'pharmaceutical', 'biotech'],
            'education': ['edtech', 'university', 'school', 'learning'],
            'ecommerce': ['retail', 'marketplace', 'shopping', 'commerce'],
            'media': ['entertainment', 'gaming', 'streaming', 'content'],
            'consulting': ['consulting', 'advisory', 'services'],
            'manufacturing': ['automotive', 'aerospace', 'industrial'],
        }
        
        self.company_size_indicators = {
            'startup': ['startup', 'seed', 'series a', 'early stage'],
            'small': ['small team', 'growing team', '50-200'],
            'medium': ['mid-size', '200-1000', 'established'],
            'large': ['fortune 500', 'enterprise', '1000+', 'multinational'],
            'enterprise': ['global', 'worldwide', '5000+', 'fortune 100'],
        }
    
    def parse_job_posting(self, html_content: str, text_content: str, url: str) -> Dict:
        """
        Main parsing function that extracts all job information
        
        Args:
            html_content: Raw HTML of the job posting
            text_content: Cleaned text content
            url: Job posting URL
            
        Returns:
            Dictionary with parsed job information
        """
        
        # Initialize result dictionary
        result = {
            'url': url,
            'raw_data': {'html_length': len(html_content), 'text_length': len(text_content)},
            'parse_confidence': 0.0,
        }
        
        try:
            # Basic extraction
            result.update(self._extract_basic_info(text_content))
            
            # Job classification
            result.update(self._extract_job_classification(text_content))
            
            # Content extraction
            result.update(self._extract_job_content(text_content))
            
            # Compensation extraction
            result.update(self._extract_compensation(text_content))
            
            # Company insights
            result.update(self._extract_company_info(text_content))
            
            # Recruitment details
            result.update(self._extract_recruitment_details(text_content))
            
            # Contextual data
            result.update(self._extract_contextual_data(text_content))
            
            # ML enrichments
            result.update(self._extract_ml_enrichments(text_content))
            
            # Calculate parse confidence
            result['parse_confidence'] = self._calculate_confidence(result)
            
        except Exception as e:
            logger.error(f"Error parsing job posting: {e}")
            result['parse_confidence'] = 0.0
        
        return result
    
    def _extract_basic_info(self, text: str) -> Dict:
        """Extract basic job information"""
        
        result = {}
        
        # Try to extract title from first few lines
        lines = text.split('\n')[:5]
        for line in lines:
            line = line.strip()
            if len(line) > 10 and len(line) < 100:
                # Likely a job title
                result['title'] = line
                break
        
        return result
    
    def _extract_job_classification(self, text: str) -> Dict:
        """Extract job type and employment mode"""
        
        result = {}
        text_lower = text.lower()
        
        # Job type
        for job_type, pattern in self.job_type_patterns.items():
            if re.search(pattern, text_lower, re.IGNORECASE):
                result['job_type'] = job_type
                break
        
        # Employment mode
        for mode, pattern in self.employment_mode_patterns.items():
            if re.search(pattern, text_lower, re.IGNORECASE):
                result['employment_mode'] = mode
                break
        
        # Experience level
        for level, pattern in self.experience_patterns.items():
            if re.search(pattern, text_lower, re.IGNORECASE):
                result['experience_level'] = level
                break
        
        # Education level
        for edu, pattern in self.education_patterns.items():
            if re.search(pattern, text_lower, re.IGNORECASE):
                result['education_level'] = edu
                break
        
        return result
    
    def _extract_job_content(self, text: str) -> Dict:
        """Extract job description components"""
        
        result = {}
        
        # Split text into sections
        sections = self._identify_sections(text)
        
        # Extract responsibilities
        if 'responsibilities' in sections:
            result['responsibilities'] = sections['responsibilities']
        
        # Extract requirements
        if 'requirements' in sections:
            result['requirements'] = sections['requirements']
        
        # Extract skills
        skills = self._extract_skills(text)
        result['skills_required'] = skills['required']
        result['skills_preferred'] = skills['preferred']
        
        # Extract tools and technologies
        result['tools_technologies'] = self._extract_tools(text)
        
        # Extract certifications
        result['certifications'] = self._extract_certifications(text)
        
        return result
    
    def _extract_compensation(self, text: str) -> Dict:
        """Extract salary and benefits information"""
        
        result = {}
        
        # Extract salary
        salary_info = self._extract_salary(text)
        result.update(salary_info)
        
        # Extract benefits
        result['benefits'] = self._extract_benefits(text)
        
        # Extract bonus/equity information
        bonus_patterns = [
            r'bonus', r'equity', r'stock\s+options', r'rsu',
            r'commission', r'profit\s+sharing'
        ]
        
        bonus_text = []
        for pattern in bonus_patterns:
            matches = re.findall(rf'.{{0,50}}{pattern}.{{0,50}}', text, re.IGNORECASE)
            bonus_text.extend(matches)
        
        if bonus_text:
            result['bonus_equity'] = '; '.join(bonus_text[:3])  # Limit to 3 matches
        
        return result
    
    def _extract_company_info(self, text: str) -> Dict:
        """Extract company-related information"""
        
        result = {}
        text_lower = text.lower()
        
        # Industry detection
        for industry, keywords in self.industry_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    result['industry'] = industry.title()
                    break
            if 'industry' in result:
                break
        
        # Company size detection
        for size, indicators in self.company_size_indicators.items():
            for indicator in indicators:
                if indicator in text_lower:
                    result['company_size'] = size
                    break
            if 'company_size' in result:
                break
        
        # Look for company website
        website_pattern = r'https?://(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}'
        websites = re.findall(website_pattern, text)
        if websites:
            result['company_website'] = websites[0]
        
        return result
    
    def _extract_recruitment_details(self, text: str) -> Dict:
        """Extract recruitment and application details"""
        
        result = {}
        
        # Application deadline
        deadline_patterns = [
            r'deadline[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',
            r'apply\s+by[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',
            r'closing\s+date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',
        ]
        
        for pattern in deadline_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    # Parse date (simplified)
                    date_str = match.group(1)
                    result['application_deadline'] = date_str
                    break
                except:
                    pass
        
        # Number of openings
        opening_patterns = [
            r'(\d+)\s+openings?',
            r'(\d+)\s+positions?',
            r'hiring\s+(\d+)',
        ]
        
        for pattern in opening_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                result['number_of_openings'] = int(match.group(1))
                break
        
        # Hiring manager
        manager_patterns = [
            r'contact[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)',
            r'recruiter[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)',
            r'hiring\s+manager[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)',
        ]
        
        for pattern in manager_patterns:
            match = re.search(pattern, text)
            if match:
                result['hiring_manager'] = match.group(1)
                break
        
        return result
    
    def _extract_contextual_data(self, text: str) -> Dict:
        """Extract visa, relocation, travel, and language requirements"""
        
        result = {}
        text_lower = text.lower()
        
        # Visa sponsorship
        visa_patterns = [
            'visa sponsorship', 'h1b', 'work authorization',
            'eligible to work', 'sponsor visa'
        ]
        result['visa_sponsorship'] = any(pattern in text_lower for pattern in visa_patterns)
        
        # Relocation assistance
        relocation_patterns = [
            'relocation', 'moving assistance', 'relo package'
        ]
        result['relocation_assistance'] = any(pattern in text_lower for pattern in relocation_patterns)
        
        # Travel requirements
        travel_patterns = [
            r'(\d{1,2})%\s+travel',
            r'travel\s+(\d{1,2})%',
            r'minimal\s+travel',
            r'extensive\s+travel',
            r'no\s+travel',
        ]
        
        for pattern in travel_patterns:
            match = re.search(pattern, text_lower)
            if match:
                if match.groups():
                    result['travel_requirements'] = f"{match.group(1)}% travel"
                else:
                    result['travel_requirements'] = match.group(0)
                break
        
        # Language requirements
        language_patterns = [
            r'fluent\s+in\s+(\w+)',
            r'(\w+)\s+language\s+required',
            r'bilingual\s+(\w+)',
        ]
        
        languages = []
        for pattern in language_patterns:
            matches = re.findall(pattern, text_lower)
            languages.extend(matches)
        
        if languages:
            result['languages_required'] = list(set(languages))
        
        return result
    
    def _extract_ml_enrichments(self, text: str) -> Dict:
        """Extract ML-derived insights and classifications"""
        
        result = {}
        
        # Job category classification
        result['job_category'] = self._classify_job_category(text)
        
        # Seniority score
        result['seniority_score'] = self._calculate_seniority_score(text)
        
        # Extract keywords
        result['keywords'] = self._extract_keywords(text)
        
        # Portfolio requirements
        portfolio_patterns = [
            r'portfolio', r'github', r'code\s+samples',
            r'work\s+samples', r'examples\s+of\s+work'
        ]
        
        portfolio_matches = []
        for pattern in portfolio_patterns:
            matches = re.findall(rf'.{{0,50}}{pattern}.{{0,50}}', text, re.IGNORECASE)
            portfolio_matches.extend(matches)
        
        if portfolio_matches:
            result['projects_portfolio_examples'] = '; '.join(portfolio_matches[:2])
        
        return result
    
    def _identify_sections(self, text: str) -> Dict[str, str]:
        """Identify and extract different sections of the job posting"""
        
        sections = {}
        
        # Common section headers
        section_patterns = {
            'responsibilities': r'(?:responsibilities|duties|what\s+you.ll\s+do|role\s+description)',
            'requirements': r'(?:requirements|qualifications|what\s+we.re\s+looking\s+for|skills)',
            'benefits': r'(?:benefits|perks|what\s+we\s+offer|compensation)',
            'about': r'(?:about\s+us|company\s+overview|who\s+we\s+are)',
        }
        
        # Split text into paragraphs
        paragraphs = text.split('\n\n')
        
        for section, pattern in section_patterns.items():
            for i, paragraph in enumerate(paragraphs):
                if re.search(pattern, paragraph, re.IGNORECASE):
                    # Take this paragraph and potentially the next few
                    section_text = []
                    for j in range(i, min(i + 3, len(paragraphs))):
                        section_text.append(paragraphs[j])
                    sections[section] = '\n\n'.join(section_text)
                    break
        
        return sections
    
    def _extract_skills(self, text: str) -> Dict[str, List[str]]:
        """Extract required and preferred skills"""
        
        text_lower = text.lower()
        
        required_skills = set()
        preferred_skills = set()
        
        # Check all skill databases
        all_skills = (
            self.programming_languages | self.frameworks | 
            self.cloud_platforms | self.databases | 
            self.tools | self.soft_skills
        )
        
        for skill in all_skills:
            if skill in text_lower:
                # Determine if required or preferred based on context
                skill_context = self._get_skill_context(text_lower, skill)
                if 'preferred' in skill_context or 'nice' in skill_context:
                    preferred_skills.add(skill)
                else:
                    required_skills.add(skill)
        
        return {
            'required': list(required_skills),
            'preferred': list(preferred_skills)
        }
    
    def _get_skill_context(self, text: str, skill: str) -> str:
        """Get the context around a skill mention"""
        
        pattern = rf'.{{0,100}}{re.escape(skill)}.{{0,100}}'
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(0) if match else ""
    
    def _extract_tools(self, text: str) -> List[str]:
        """Extract tools and technologies"""
        
        text_lower = text.lower()
        found_tools = []
        
        for tool in self.tools:
            if tool in text_lower:
                found_tools.append(tool)
        
        return found_tools
    
    def _extract_certifications(self, text: str) -> List[str]:
        """Extract certifications"""
        
        text_lower = text.lower()
        found_certs = []
        
        for cert in self.certifications:
            if cert in text_lower:
                found_certs.append(cert)
        
        return found_certs
    
    def _extract_salary(self, text: str) -> Dict:
        """Extract salary information"""
        
        result = {}
        
        for pattern in self.salary_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    if len(match.groups()) >= 2:
                        # Range found
                        min_sal = float(match.group(1).replace(',', ''))
                        max_sal = float(match.group(2).replace(',', ''))
                        result['salary_min'] = Decimal(str(min_sal))
                        result['salary_max'] = Decimal(str(max_sal))
                    else:
                        # Single value
                        sal = float(match.group(1).replace(',', ''))
                        result['salary_min'] = Decimal(str(sal))
                    
                    # Determine compensation type
                    if 'hour' in match.group(0).lower():
                        result['compensation_type'] = 'hourly'
                    else:
                        result['compensation_type'] = 'annual'
                    
                    break
                except:
                    continue
        
        # Currency detection
        if '$' in text:
            result['currency'] = 'USD'
        elif '₹' in text or 'INR' in text or 'lakh' in text.lower():
            result['currency'] = 'INR'
        elif '€' in text or 'EUR' in text:
            result['currency'] = 'EUR'
        elif '£' in text or 'GBP' in text:
            result['currency'] = 'GBP'
        
        return result
    
    def _extract_benefits(self, text: str) -> List[str]:
        """Extract benefits and perks"""
        
        found_benefits = []
        text_lower = text.lower()
        
        for pattern in self.benefit_patterns:
            if re.search(pattern, text_lower):
                # Clean up the pattern for display
                benefit = pattern.replace(r'\s+', ' ').replace(r'\(', '(').replace(r'\)', ')')
                found_benefits.append(benefit)
        
        return found_benefits
    
    def _classify_job_category(self, text: str) -> Optional[str]:
        """Classify job into a category"""
        
        text_lower = text.lower()
        
        categories = {
            'software-engineering': ['software', 'developer', 'engineer', 'programming'],
            'data-science': ['data scientist', 'machine learning', 'ai', 'analytics'],
            'product-management': ['product manager', 'product owner', 'pm'],
            'design': ['designer', 'ux', 'ui', 'design'],
            'marketing': ['marketing', 'growth', 'digital marketing'],
            'sales': ['sales', 'business development', 'account manager'],
            'operations': ['operations', 'ops', 'devops', 'infrastructure'],
            'finance': ['finance', 'accounting', 'financial analyst'],
            'hr': ['hr', 'human resources', 'recruiter', 'people'],
        }
        
        for category, keywords in categories.items():
            if any(keyword in text_lower for keyword in keywords):
                return category
        
        return None
    
    def _calculate_seniority_score(self, text: str) -> int:
        """Calculate seniority score (0-10)"""
        
        text_lower = text.lower()
        score = 5  # Default mid-level
        
        # Increase score for senior keywords
        senior_keywords = ['senior', 'lead', 'principal', 'staff', 'architect']
        for keyword in senior_keywords:
            if keyword in text_lower:
                score += 2
                break
        
        # Decrease score for junior keywords
        junior_keywords = ['junior', 'entry', 'graduate', 'fresher']
        for keyword in junior_keywords:
            if keyword in text_lower:
                score -= 2
                break
        
        # Experience years
        exp_pattern = r'(\d+)\+?\s*years?\s+(?:of\s+)?experience'
        match = re.search(exp_pattern, text_lower)
        if match:
            years = int(match.group(1))
            if years >= 8:
                score += 2
            elif years >= 5:
                score += 1
            elif years <= 2:
                score -= 1
        
        return max(0, min(10, score))
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords for searchability"""
        
        try:
            # Try NLTK tokenization
            tokens = word_tokenize(text.lower())
            
            # Remove stop words and short words
            filtered_tokens = [
                word for word in tokens 
                if word not in self.stop_words and len(word) > 2
                and word.isalpha()
            ]
            
            # Get word frequency
            from collections import Counter
            word_freq = Counter(filtered_tokens)
            
            # Get top keywords
            top_keywords = [word for word, freq in word_freq.most_common(20)]
            
            return top_keywords
            
        except Exception as e:
            logger.warning(f"NLTK keyword extraction failed, using fallback: {e}")
            
            # Fallback: simple regex-based keyword extraction
            import re
            words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
            
            # Remove common words manually
            common_words = {
                'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 
                'can', 'her', 'was', 'one', 'our', 'had', 'have', 'what',
                'said', 'each', 'which', 'she', 'how', 'other', 'will',
                'work', 'job', 'company', 'team', 'role', 'position'
            }
            
            filtered_words = [w for w in words if w not in common_words and len(w) > 3]
            
            # Get top words by frequency
            from collections import Counter
            word_freq = Counter(filtered_words)
            top_keywords = [word for word, freq in word_freq.most_common(15)]
            
            return top_keywords
    
    def _calculate_confidence(self, result: Dict) -> float:
        """Calculate parsing confidence score"""
        
        total_fields = 30  # Total number of possible fields
        filled_fields = sum(1 for value in result.values() if value)
        
        base_confidence = (filled_fields / total_fields) * 100
        
        # Boost confidence for critical fields
        critical_fields = ['title', 'company', 'description', 'skills_required']
        critical_filled = sum(1 for field in critical_fields if result.get(field))
        
        confidence_boost = (critical_filled / len(critical_fields)) * 20
        
        final_confidence = min(100, base_confidence + confidence_boost)
        
        return round(final_confidence, 2)


# Singleton instance
job_parser = JobParser()


def parse_job_content(html_content: str, text_content: str, url: str) -> Dict:
    """
    Convenience function to parse job content
    
    Args:
        html_content: Raw HTML content
        text_content: Cleaned text content  
        url: Job posting URL
        
    Returns:
        Parsed job data dictionary
    """
    return job_parser.parse_job_posting(html_content, text_content, url)
