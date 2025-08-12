"""
AI-Powered Cover Letter Generator

This service creates personalized cover letters that complement tailored resumes.
Includes hooks for AI integration to generate compelling, job-specific content.

Future AI Enhancements:
- GPT/Claude integration for natural language generation
- Company culture analysis and tone matching
- Personalized storytelling based on user experience
- A/B testing for cover letter effectiveness
"""

import re
import logging
from typing import Dict, List, Optional
from datetime import datetime
from django.template import Template, Context
from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile
from .models import PreparedJob

logger = logging.getLogger(__name__)


class CoverLetterGenerator:
    """
    Intelligent cover letter generation engine that creates personalized content
    """
    
    def __init__(self):
        # Cover letter structure templates
        self.letter_structures = {
            'traditional': [
                'header', 'greeting', 'opening_hook', 'value_proposition', 
                'experience_highlight', 'company_connection', 'call_to_action', 'closing'
            ],
            'modern': [
                'header', 'greeting', 'attention_grabber', 'skill_alignment', 
                'achievement_story', 'culture_fit', 'next_steps', 'closing'
            ],
            'startup': [
                'header', 'greeting', 'passion_statement', 'relevant_experience', 
                'growth_mindset', 'company_mission_alignment', 'enthusiasm_close', 'closing'
            ]
        }
        
        # Industry-specific tone mapping
        self.industry_tones = {
            'technology': 'innovative and technical',
            'finance': 'professional and analytical',
            'healthcare': 'caring and detail-oriented',
            'education': 'passionate and collaborative',
            'marketing': 'creative and results-driven',
            'consulting': 'strategic and problem-solving',
            'default': 'professional and enthusiastic'
        }
    
    def analyze_company_info(self, job: JobPosting) -> Dict[str, str]:
        """
        Analyze company and job posting to extract key information
        
        TODO: Add AI-powered company analysis:
        - Web scraping for company culture insights
        - LinkedIn company page analysis
        - Recent news and achievements
        - Employee testimonials and reviews
        """
        company_info = {
            'name': job.company or 'the company',
            'industry': 'technology',  # TODO: Extract from job description
            'size': 'growing',  # TODO: Determine company size
            'culture': 'innovative',  # TODO: Analyze company culture
            'mission': 'excellence',  # TODO: Extract mission/values
        }
        
        # Extract industry from job description
        if job.description:
            desc_lower = job.description.lower()
            if any(word in desc_lower for word in ['fintech', 'financial', 'banking']):
                company_info['industry'] = 'finance'
            elif any(word in desc_lower for word in ['healthcare', 'medical', 'patient']):
                company_info['industry'] = 'healthcare'
            elif any(word in desc_lower for word in ['education', 'learning', 'teaching']):
                company_info['industry'] = 'education'
            elif any(word in desc_lower for word in ['marketing', 'advertising', 'brand']):
                company_info['industry'] = 'marketing'
        
        return company_info
    
    def extract_key_achievements(self, user_profile: JobSeekerProfile) -> List[str]:
        """
        Extract user's key achievements for highlighting
        
        TODO: Add AI-powered achievement extraction:
        - Parse resume for quantifiable achievements
        - Identify impact metrics and results
        - Match achievements to job requirements
        - Generate compelling achievement statements
        """
        achievements = []
        
        # Extract from bio if available
        if user_profile.bio:
            bio_lower = user_profile.bio.lower()
            
            # Look for quantifiable achievements
            metrics_patterns = [
                r'(\d+)%\s*(?:increase|improvement|growth)',
                r'(\d+)\s*(?:users|customers|clients)',
                r'\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:revenue|savings|budget)',
                r'(\d+)\s*(?:projects|applications|systems)',
            ]
            
            for pattern in metrics_patterns:
                matches = re.findall(pattern, user_profile.bio)
                if matches:
                    achievements.append(f"Achieved measurable results with {matches[0]} impact")
        
        # Default achievements based on experience level
        experience_years = user_profile.years_of_experience or 0
        
        if experience_years >= 5:
            achievements.append("Led cross-functional teams to deliver complex projects")
            achievements.append("Mentored junior developers and contributed to team growth")
        elif experience_years >= 2:
            achievements.append("Contributed to multiple successful project deliveries")
            achievements.append("Collaborated effectively with diverse stakeholders")
        else:
            achievements.append("Demonstrated strong learning ability and adaptability")
            achievements.append("Brought fresh perspectives and modern technical skills")
        
        # Add skill-based achievements
        user_skills = user_profile.skills if isinstance(user_profile.skills, list) else []
        if 'python' in [skill.lower() for skill in user_skills]:
            achievements.append("Developed robust Python applications and automation scripts")
        if 'leadership' in [skill.lower() for skill in user_skills]:
            achievements.append("Successfully led teams and drove project initiatives")
        
        return achievements[:3]  # Return top 3 achievements
    
    def generate_opening_hook(self, job: JobPosting, user_profile: JobSeekerProfile, 
                             company_info: Dict) -> str:
        """
        Generate an engaging opening paragraph
        
        TODO: Add AI-powered hook generation:
        - Analyze successful cover letter openings
        - Generate industry-specific hooks
        - Personalize based on user background
        - A/B test different hook styles
        """
        hooks = [
            f"I was excited to discover the {job.title} position at {company_info['name']}, as it perfectly aligns with my passion for {company_info['industry']} and my {user_profile.years_of_experience or 'several'} years of experience in {user_profile.job_title or 'software development'}.",
            
            f"As a {user_profile.experience_level or 'dedicated'} {user_profile.job_title or 'professional'} with expertise in {', '.join((user_profile.skills or [])[:2])}, I am thrilled to apply for the {job.title} role at {company_info['name']}.",
            
            f"Your recent job posting for {job.title} immediately caught my attention because of {company_info['name']}'s commitment to {company_info['mission']} and my background in {user_profile.job_title or 'technology'}."
        ]
        
        # Choose hook based on available user data
        if user_profile.skills and len(user_profile.skills) >= 2:
            return hooks[1]
        elif user_profile.years_of_experience and user_profile.years_of_experience > 3:
            return hooks[0]
        else:
            return hooks[2]
    
    def generate_value_proposition(self, job: JobPosting, user_profile: JobSeekerProfile,
                                  achievements: List[str]) -> str:
        """
        Generate a compelling value proposition paragraph
        """
        user_skills = user_profile.skills if isinstance(user_profile.skills, list) else []
        experience_years = user_profile.years_of_experience or 0
        
        value_prop = f"With my background in {user_profile.job_title or 'technology'}"
        
        if experience_years > 0:
            value_prop += f" and {experience_years} years of hands-on experience"
        
        if user_skills:
            value_prop += f", particularly in {', '.join(user_skills[:3])}"
        
        value_prop += f", I am well-positioned to contribute to your team's success."
        
        # Add an achievement if available
        if achievements:
            value_prop += f" {achievements[0]}, demonstrating my ability to deliver results that align with your needs."
        
        return value_prop
    
    def generate_experience_highlight(self, job: JobPosting, user_profile: JobSeekerProfile) -> str:
        """
        Generate a paragraph highlighting relevant experience
        """
        # TODO: Match specific experiences to job requirements
        highlight = f"In my role as {user_profile.job_title or 'a professional'}, I have successfully "
        
        user_skills = user_profile.skills if isinstance(user_profile.skills, list) else []
        
        if any('python' in skill.lower() for skill in user_skills):
            highlight += "developed scalable Python applications, "
        if any('javascript' in skill.lower() for skill in user_skills):
            highlight += "built responsive web applications, "
        if any('leadership' in skill.lower() for skill in user_skills):
            highlight += "led cross-functional teams, "
        
        highlight += "consistently delivering high-quality solutions that meet business objectives."
        
        # Add specific connection to the role
        highlight += f" This experience directly translates to the {job.title} role, where I can leverage my technical expertise and problem-solving skills to drive innovation."
        
        return highlight
    
    def generate_company_connection(self, job: JobPosting, company_info: Dict) -> str:
        """
        Generate a paragraph showing connection to the company
        
        TODO: Add AI-powered company research:
        - Recent company news and achievements
        - Company values and mission alignment
        - Specific projects or initiatives to mention
        - Industry trends and company positioning
        """
        connections = [
            f"I am particularly drawn to {company_info['name']}'s commitment to {company_info['mission']} and its reputation for {company_info['culture']} solutions in the {company_info['industry']} industry.",
            
            f"What excites me most about {company_info['name']} is its {company_info['culture']} approach to {company_info['industry']} and the opportunity to work with a {company_info['size']} team that values innovation.",
            
            f"I have been following {company_info['name']}'s growth in the {company_info['industry']} space and am impressed by the company's dedication to {company_info['mission']} and technical excellence."
        ]
        
        return connections[0]  # TODO: Choose based on company analysis
    
    def generate_call_to_action(self, user_profile: JobSeekerProfile) -> str:
        """
        Generate a strong closing call to action
        """
        ctas = [
            "I would welcome the opportunity to discuss how my experience and passion can contribute to your team's continued success.",
            
            "I am excited about the possibility of bringing my skills and enthusiasm to your organization and would love to discuss how I can add value to your team.",
            
            "I look forward to the opportunity to discuss how my background and drive for excellence align with your team's goals."
        ]
        
        return ctas[0]  # TODO: Personalize based on user profile
    
    def select_letter_structure(self, company_info: Dict) -> List[str]:
        """
        Select appropriate letter structure based on company/industry
        """
        industry = company_info.get('industry', 'default')
        
        if industry in ['technology', 'startup']:
            return self.letter_structures['modern']
        elif industry in ['finance', 'consulting', 'healthcare']:
            return self.letter_structures['traditional']
        else:
            return self.letter_structures['modern']
    
    def generate_cover_letter(self, job: JobPosting, user_profile: JobSeekerProfile) -> Dict:
        """
        Generate a complete, personalized cover letter
        
        This is the main function that coordinates the cover letter generation process.
        """
        try:
            # Analyze company and job
            company_info = self.analyze_company_info(job)
            
            # Extract user achievements
            achievements = self.extract_key_achievements(user_profile)
            
            # Select letter structure
            structure = self.select_letter_structure(company_info)
            
            # Generate letter components
            user_name = f"{user_profile.first_name} {user_profile.last_name}".strip() or "Applicant"
            
            letter_components = {
                'header': {
                    'applicant_name': user_name,
                    'email': user_profile.email or user_profile.user.email,
                    'phone': user_profile.phone or '',
                    'location': user_profile.location or '',
                    'date': datetime.now().strftime('%B %d, %Y'),
                    'company_name': company_info['name'],
                    'job_title': job.title,
                },
                
                'greeting': f"Dear Hiring Manager," if not job.contact_email else f"Dear Hiring Team,",
                
                'opening_hook': self.generate_opening_hook(job, user_profile, company_info),
                
                'value_proposition': self.generate_value_proposition(job, user_profile, achievements),
                
                'experience_highlight': self.generate_experience_highlight(job, user_profile),
                
                'company_connection': self.generate_company_connection(job, company_info),
                
                'call_to_action': self.generate_call_to_action(user_profile),
                
                'closing': f"Sincerely,\\n{user_name}",
            }
            
            # Combine into full letter
            full_letter = self.assemble_letter(letter_components, structure)
            
            # Return structured data
            return {
                'full_text': full_letter,
                'components': letter_components,
                'structure_used': structure,
                'company_analysis': company_info,
                'achievements_highlighted': achievements,
                'tone': self.industry_tones.get(company_info['industry'], 'professional'),
                'generated_at': datetime.now().isoformat(),
                
                # AI Enhancement placeholders
                'ai_enhancements': {
                    'readability_score': None,  # TODO: Add readability analysis
                    'tone_analysis': None,  # TODO: Add tone scoring
                    'personalization_score': None,  # TODO: Add personalization rating
                    'ai_suggestions': [],  # TODO: Add AI improvement suggestions
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating cover letter for job {job.id}: {str(e)}")
            return {
                'error': str(e),
                'full_text': f"Dear Hiring Manager,\\n\\nI am writing to express my interest in the {job.title} position at {job.company}. I believe my background and skills make me a strong candidate for this role.\\n\\nThank you for your consideration.\\n\\nSincerely,\\n{user_profile.first_name} {user_profile.last_name}",
                'generated_at': datetime.now().isoformat(),
            }
    
    def assemble_letter(self, components: Dict, structure: List[str]) -> str:
        """
        Assemble letter components into a complete cover letter
        """
        letter_parts = []
        
        # Header
        header = components['header']
        header_text = f"{header['applicant_name']}\\n"
        if header['email']:
            header_text += f"{header['email']}\\n"
        if header['phone']:
            header_text += f"{header['phone']}\\n"
        if header['location']:
            header_text += f"{header['location']}\\n"
        
        header_text += f"\\n{header['date']}\\n\\n"
        header_text += f"{header['company_name']}\\n"
        header_text += f"Re: {header['job_title']} Position\\n\\n"
        
        letter_parts.append(header_text)
        
        # Greeting
        letter_parts.append(components['greeting'] + "\\n\\n")
        
        # Body paragraphs based on structure
        for section in structure[2:-1]:  # Skip header, greeting, and closing
            if section in components:
                letter_parts.append(components[section] + "\\n\\n")
        
        # Closing
        letter_parts.append(components['closing'])
        
        return ''.join(letter_parts)
    
    def update_prepared_job_with_cover_letter(self, prepared_job: PreparedJob) -> PreparedJob:
        """
        Add generated cover letter to an existing PreparedJob
        """
        try:
            cover_letter_data = self.generate_cover_letter(prepared_job.job, prepared_job.user_profile)
            
            prepared_job.tailored_cover_letter = cover_letter_data
            prepared_job.save()
            
            logger.info(f"Added cover letter to prepared job {prepared_job.id}")
            return prepared_job
            
        except Exception as e:
            logger.error(f"Error updating prepared job with cover letter: {str(e)}")
            raise


# Singleton instance
cover_letter_generator = CoverLetterGenerator()


# Convenience functions
def generate_cover_letter(job: JobPosting, user_profile: JobSeekerProfile) -> Dict:
    """Generate a personalized cover letter for a job"""
    return cover_letter_generator.generate_cover_letter(job, user_profile)


def update_prepared_job_with_cover_letter(prepared_job: PreparedJob) -> PreparedJob:
    """Add a cover letter to an existing prepared job"""
    return cover_letter_generator.update_prepared_job_with_cover_letter(prepared_job)
