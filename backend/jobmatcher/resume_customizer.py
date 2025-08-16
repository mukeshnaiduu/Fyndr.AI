"""
AI-Powered Resume Customizer

This service analyzes job descriptions and tailors user resumes to maximize match scores.
Includes hooks for AI integration to automatically generate personalized content.

Future AI Enhancements:
- GPT/Claude integration for intelligent content rewriting
- Semantic keyword optimization using embeddings
- ATS (Applicant Tracking System) compatibility analysis
- Industry-specific formatting and terminology
"""

import json
import re
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from django.template import Template, Context
from django.utils.html import strip_tags
from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile
from fyndr_auth.utils.profile_utils import normalize_skills_field
from .models import PreparedJob, JobScore

logger = logging.getLogger(__name__)


class ResumeCustomizer:
    """
    Intelligent resume customization engine that tailors resumes to specific job requirements
    """
    
    def __init__(self):
        self.common_resume_sections = [
            'summary', 'objective', 'experience', 'skills', 'education', 
            'projects', 'certifications', 'achievements', 'volunteering'
        ]
        
        # Keywords to emphasize for different job types
        self.job_type_keywords = {
            'software engineer': ['development', 'programming', 'coding', 'algorithms', 'systems'],
            'data scientist': ['analytics', 'machine learning', 'statistics', 'modeling', 'insights'],
            'product manager': ['strategy', 'roadmap', 'stakeholders', 'requirements', 'user experience'],
            'designer': ['user interface', 'user experience', 'visual design', 'prototyping', 'wireframes'],
            'marketing': ['campaigns', 'brand', 'analytics', 'growth', 'content'],
        }
    
    def extract_key_requirements(self, job_description: str) -> Dict[str, List[str]]:
        """
        Extract key requirements from job description
        
        TODO: Replace with AI-powered requirement extraction:
        - Use NLP models to identify must-have vs nice-to-have skills
        - Extract years of experience requirements
        - Identify specific tools/technologies mentioned
        - Parse education/certification requirements
        """
        requirements = {
            'technical_skills': [],
            'soft_skills': [],
            'experience_level': '',
            'tools': [],
            'education': [],
            'certifications': []
        }
        
        if not job_description:
            return requirements
        
        text_lower = job_description.lower()
        
        # Technical skills patterns
        tech_patterns = [
            r'\b(?:python|java|javascript|typescript|react|angular|vue|node\.?js)\b',
            r'\b(?:sql|postgresql|mysql|mongodb|redis|elasticsearch)\b',
            r'\b(?:aws|azure|gcp|docker|kubernetes|terraform)\b',
            r'\b(?:git|linux|agile|scrum|ci/cd)\b',
        ]
        
        for pattern in tech_patterns:
            matches = re.findall(pattern, text_lower)
            requirements['technical_skills'].extend(matches)
        
        # Soft skills patterns
        soft_skills_patterns = [
            r'\b(?:leadership|communication|problem[- ]solving|teamwork)\b',
            r'\b(?:analytical|creative|detail[- ]oriented|self[- ]motivated)\b',
        ]
        
        for pattern in soft_skills_patterns:
            matches = re.findall(pattern, text_lower)
            requirements['soft_skills'].extend(matches)
        
        # Experience level
        exp_patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)',
            r'(?:senior|junior|entry[- ]level|mid[- ]level)',
        ]
        
        for pattern in exp_patterns:
            matches = re.findall(pattern, text_lower)
            if matches:
                requirements['experience_level'] = str(matches[0])
                break
        
        # Clean and deduplicate
        for key in requirements:
            if isinstance(requirements[key], list):
                requirements[key] = list(set([item.strip() for item in requirements[key] if item.strip()]))
        
        return requirements
    
    def analyze_user_profile(self, user_profile: JobSeekerProfile) -> Dict[str, any]:
        """
        Analyze user profile to extract customizable content
        """
        profile_data = {
            'personal_info': {
                'name': f"{user_profile.first_name} {user_profile.last_name}".strip(),
                'email': user_profile.email or user_profile.user.email,
                'phone': user_profile.phone,
                'location': user_profile.location,
                'linkedin': user_profile.linkedin_url,
                'github': user_profile.github_url,
                'portfolio': user_profile.portfolio_url,
                'website': user_profile.website_url,
            },
            'skills': normalize_skills_field(user_profile.skills if isinstance(user_profile.skills, list) else [])[0],
            'experience_level': user_profile.experience_level,
            'years_experience': user_profile.years_of_experience,
            'education': user_profile.education if isinstance(user_profile.education, list) else [],
            'certifications': user_profile.certifications if isinstance(user_profile.certifications, list) else [],
            'bio': user_profile.bio,
            'job_title': user_profile.job_title,
            'preferred_roles': user_profile.job_types if isinstance(user_profile.job_types, list) else [],
        }
        
        return profile_data
    
    def generate_tailored_summary(self, user_data: Dict, job_requirements: Dict, job_title: str) -> str:
        """
        Generate a tailored professional summary
        
        TODO: Add AI-powered summary generation:
        - Use GPT/Claude to rewrite summary for specific job
        - Incorporate job-specific keywords naturally
        - Optimize for ATS compatibility
        - Match tone and style to company culture
        """
        
        # Extract relevant skills that match job requirements
        user_skills = set([skill.lower() for skill in user_data.get('skills', [])])
        required_skills = set(job_requirements.get('technical_skills', []) + job_requirements.get('soft_skills', []))
        matching_skills = user_skills.intersection(required_skills)
        
        # Build summary components
        experience_years = user_data.get('years_experience', 0)
        experience_level = user_data.get('experience_level', '')
        current_title = user_data.get('job_title', 'Professional')
        
        # Template for summary (TODO: Replace with AI generation)
        summary_template = """
        {{experience_statement}} {{current_title}} with {{years}} years of experience in {{key_skills}}. 
        Proven track record in {{achievements}} with expertise in {{technical_skills}}. 
        {{soft_skills_statement}} Seeking to leverage {{relevant_experience}} in a {{target_role}} role.
        """.strip()
        
        # Fill template variables
        context_data = {
            'experience_statement': f"{experience_level.title()}" if experience_level else "Experienced",
            'current_title': current_title,
            'years': experience_years if experience_years else "several",
            'key_skills': ", ".join(list(matching_skills)[:3]) if matching_skills else "technology",
            'achievements': "delivering high-quality solutions",
            'technical_skills': ", ".join(job_requirements.get('technical_skills', [])[:3]),
            'soft_skills_statement': "Strong communication and problem-solving skills.",
            'relevant_experience': "technical expertise and leadership experience",
            'target_role': job_title.lower(),
        }
        
        template = Template(summary_template)
        context = Context(context_data)
        tailored_summary = template.render(context)
        
        # Clean up extra spaces and formatting
        tailored_summary = re.sub(r'\s+', ' ', tailored_summary).strip()
        
        return tailored_summary
    
    def prioritize_skills_for_job(self, user_skills: List[str], job_requirements: Dict) -> List[str]:
        """
        Reorder user skills to prioritize those mentioned in job requirements
        """
        if not user_skills:
            return []
        
        required_skills = set([skill.lower() for skill in 
                              job_requirements.get('technical_skills', []) + 
                              job_requirements.get('soft_skills', [])])
        
        # Separate matching and non-matching skills
        matching = []
        non_matching = []
        
        for skill in user_skills:
            if skill.lower() in required_skills:
                matching.append(skill)
            else:
                non_matching.append(skill)
        
        # Return matching skills first, then others
        return matching + non_matching
    
    def suggest_resume_improvements(self, user_data: Dict, job_requirements: Dict) -> List[str]:
        """
        Generate actionable suggestions for resume improvement
        
        TODO: Add AI-powered suggestion generation:
        - Analyze resume against successful applications
        - Suggest specific metrics and achievements to highlight
        - Recommend industry-specific formatting
        - Identify potential red flags or missing elements
        """
        suggestions = []
        
        # Check for missing required skills
        user_skills = set([skill.lower() for skill in user_data.get('skills', [])])
        required_skills = set(job_requirements.get('technical_skills', []))
        missing_skills = required_skills - user_skills
        
        if missing_skills:
            suggestions.append(f"Consider highlighting experience with: {', '.join(list(missing_skills)[:3])}")
        
        # Check experience level alignment
        if job_requirements.get('experience_level'):
            req_exp = job_requirements['experience_level']
            user_exp = user_data.get('years_experience', 0)
            
            if isinstance(req_exp, str) and req_exp.isdigit():
                req_years = int(req_exp)
                if user_exp < req_years:
                    suggestions.append(f"Emphasize relevant projects to demonstrate {req_years}+ years equivalent experience")
        
        # General improvements
        if not user_data.get('certifications'):
            tech_skills = job_requirements.get('technical_skills', [])
            if any(skill in ' '.join(tech_skills) for skill in ['aws', 'azure', 'google cloud']):
                suggestions.append("Consider obtaining cloud certifications to strengthen your profile")
        
        if len(user_data.get('skills', [])) < 8:
            suggestions.append("Add more relevant technical skills to your profile")
        
        if not user_data.get('bio'):
            suggestions.append("Add a professional summary to highlight your key strengths")
        
        return suggestions
    
    def generate_tailored_resume_data(self, job: JobPosting, user_profile: JobSeekerProfile) -> Dict:
        """
        Generate complete tailored resume data for a specific job
        
        This is the main function that coordinates the resume customization process.
        """
        try:
            # Extract job requirements
            job_description = f"{job.title} {job.description or ''}"
            job_requirements = self.extract_key_requirements(job_description)
            
            # Analyze user profile
            user_data = self.analyze_user_profile(user_profile)
            
            # Generate tailored content
            tailored_summary = self.generate_tailored_summary(user_data, job_requirements, job.title)
            prioritized_skills = self.prioritize_skills_for_job(user_data['skills'], job_requirements)
            suggestions = self.suggest_resume_improvements(user_data, job_requirements)
            
            # Build complete resume data
            resume_data = {
                'personal_info': user_data['personal_info'],
                'professional_summary': tailored_summary,
                'skills': prioritized_skills,
                'experience': user_data.get('experience', []),  # TODO: Add experience data model
                'education': user_data['education'],
                'certifications': user_data['certifications'],
                'projects': [],  # TODO: Add projects data model
                
                # Customization metadata
                'customization_info': {
                    'job_title': job.title,
                    'company': job.company,
                    'job_requirements': job_requirements,
                    'matching_skills': list(set(user_data['skills']).intersection(
                        set(job_requirements.get('technical_skills', []))
                    )),
                    'suggestions': suggestions,
                    'customized_at': datetime.now().isoformat(),
                },
                
                # AI Enhancement placeholders
                'ai_enhancements': {
                    'ats_score': None,  # TODO: Add ATS compatibility scoring
                    'keyword_density': None,  # TODO: Add keyword analysis
                    'readability_score': None,  # TODO: Add readability analysis
                    'ai_suggestions': [],  # TODO: Add AI-generated suggestions
                }
            }
            
            return resume_data
            
        except Exception as e:
            logger.error(f"Error generating tailored resume for job {job.id}: {str(e)}")
            return {
                'error': str(e),
                'personal_info': self.analyze_user_profile(user_profile)['personal_info'],
                'professional_summary': user_profile.bio or "Professional seeking new opportunities",
                'skills': user_profile.skills if isinstance(user_profile.skills, list) else [],
            }
    
    def create_prepared_job(self, job: JobPosting, user_profile: JobSeekerProfile, 
                           job_score: Optional[JobScore] = None) -> PreparedJob:
        """
        Create a PreparedJob with tailored resume data
        """
        try:
            # Generate tailored resume
            resume_data = self.generate_tailored_resume_data(job, user_profile)
            
            # Create or update PreparedJob
            prepared_job, created = PreparedJob.objects.update_or_create(
                job=job,
                user_profile=user_profile,
                defaults={
                    'score': job_score.score if job_score else 0,
                    'tailored_resume': resume_data,
                    'packet_ready': True,
                }
            )
            
            logger.info(f"{'Created' if created else 'Updated'} prepared job for {job.title} - {user_profile.user.email}")
            return prepared_job
            
        except Exception as e:
            logger.error(f"Error creating prepared job: {str(e)}")
            raise


# Singleton instance
resume_customizer = ResumeCustomizer()


# Convenience functions
def generate_tailored_resume(job: JobPosting, user_profile: JobSeekerProfile) -> Dict:
    """Generate tailored resume data for a job"""
    return resume_customizer.generate_tailored_resume_data(job, user_profile)


def create_prepared_job(job: JobPosting, user_profile: JobSeekerProfile, 
                       job_score: Optional[JobScore] = None) -> PreparedJob:
    """Create a prepared job with tailored documents"""
    return resume_customizer.create_prepared_job(job, user_profile, job_score)
