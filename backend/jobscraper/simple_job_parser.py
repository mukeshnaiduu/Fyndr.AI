"""
Simplified Job Parser

A lightweight version of the job parser that doesn't depend on NLTK
but still provides comprehensive job field extraction using regex and pattern matching.
"""

import re
import json
import logging
from typing import Dict, List, Optional, Union
from datetime import datetime, date
from decimal import Decimal

logger = logging.getLogger(__name__)


class SimpleJobParser:
    """
    Simplified job posting parser that extracts structured data
    from unstructured job descriptions and posting content without NLTK dependency.
    """
    
    def __init__(self):
        # Load predefined patterns and skill sets
        self._load_patterns()
        self._load_skill_databases()
        self._load_company_data()
        
        # Basic stop words for keyword extraction
        self.stop_words = {
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 
            'was', 'one', 'our', 'had', 'have', 'what', 'said', 'each', 'which', 
            'she', 'how', 'other', 'will', 'work', 'job', 'company', 'team', 
            'role', 'position', 'this', 'that', 'with', 'from', 'they', 'been',
            'has', 'its', 'their', 'who', 'when', 'where', 'why', 'about'
        }
    
    def _load_patterns(self):
        """Load regex patterns for various job attributes"""
        
        # Salary patterns
        self.salary_patterns = [
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*to\s*\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            r'(\d{1,3}(?:,\d{3})*)\s*-\s*(\d{1,3}(?:,\d{3})*)\s*(?:USD|dollars?|per\s+year)',
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*/\s*(?:hour|hr)',
            r'(\d{1,2})\s*-\s*(\d{1,2})\s*(?:LPA|lakhs?)',
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
            'sql', 'html', 'css', 'sass', 'less'
        }
        
        # Frameworks and libraries
        self.frameworks = {
            'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask',
            'spring', 'hibernate', 'laravel', 'symfony', 'rails', 'gin',
            'fastapi', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'keras'
        }
        
        # Cloud platforms
        self.cloud_platforms = {
            'aws', 'azure', 'gcp', 'google cloud', 'digitalocean', 'heroku',
            'vercel', 'netlify', 'cloudflare'
        }
        
        # Databases
        self.databases = {
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
            'sqlite', 'oracle', 'sql server', 'cassandra', 'dynamodb'
        }
        
        # Tools and technologies
        self.tools = {
            'docker', 'kubernetes', 'jenkins', 'github', 'gitlab', 'bitbucket',
            'jira', 'confluence', 'slack', 'figma', 'git', 'webpack', 'jest'
        }
        
        # Soft skills
        self.soft_skills = {
            'leadership', 'communication', 'teamwork', 'problem solving',
            'analytical thinking', 'creativity', 'adaptability', 'time management'
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
        
        # Extract skills
        skills = self._extract_skills(text)
        result['skills_required'] = skills['required']
        result['skills_preferred'] = skills['preferred']
        
        # Extract tools and technologies
        result['tools_technologies'] = self._extract_tools(text)
        
        return result
    
    def _extract_compensation(self, text: str) -> Dict:
        """Extract salary and benefits information"""
        
        result = {}
        
        # Extract salary
        salary_info = self._extract_salary(text)
        result.update(salary_info)
        
        # Extract benefits
        result['benefits'] = self._extract_benefits(text)
        
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
        
        return result
    
    def _extract_recruitment_details(self, text: str) -> Dict:
        """Extract recruitment and application details"""
        
        result = {}
        
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
        
        return result
    
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
        
        # Simple regex-based keyword extraction
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Remove stop words
        filtered_words = [w for w in words if w not in self.stop_words and len(w) > 3]
        
        # Get top words by frequency
        from collections import Counter
        word_freq = Counter(filtered_words)
        top_keywords = [word for word, freq in word_freq.most_common(15)]
        
        return top_keywords
    
    def _calculate_confidence(self, result: Dict) -> float:
        """Calculate parsing confidence score"""
        
        total_fields = 25  # Total number of possible fields
        filled_fields = sum(1 for value in result.values() if value)
        
        base_confidence = (filled_fields / total_fields) * 100
        
        # Boost confidence for critical fields
        critical_fields = ['title', 'skills_required']
        critical_filled = sum(1 for field in critical_fields if result.get(field))
        
        confidence_boost = (critical_filled / len(critical_fields)) * 20
        
        final_confidence = min(100, base_confidence + confidence_boost)
        
        return round(final_confidence, 2)


# Singleton instance
simple_job_parser = SimpleJobParser()


def parse_job_content(html_content: str, text_content: str, url: str) -> Dict:
    """
    Convenience function to parse job content
    """
    return simple_job_parser.parse_job_posting(html_content, text_content, url)
