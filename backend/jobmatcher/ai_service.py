"""
AI Enhancement Service

Provides AI-powered enhancements for job matching, document generation,
and intelligent insights using OpenAI GPT, Claude, and other AI services.

This service replaces template-based generation with true AI intelligence.
"""

import json
import logging
import os
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from django.conf import settings
from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile
from .models import JobScore, PreparedJob

logger = logging.getLogger(__name__)


class AIEnhancementService:
    """
    Core AI service for intelligent job matching enhancements
    """
    
    def __init__(self):
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.anthropic_api_key = getattr(settings, 'ANTHROPIC_API_KEY', None)
        self.ai_enabled = bool(self.openai_api_key or self.anthropic_api_key)
        
        # AI model configurations
        self.models = {
            'gpt': {
                'reasoning': 'gpt-4o-mini',
                'content_generation': 'gpt-4o',
                'embeddings': 'text-embedding-3-small'
            },
            'claude': {
                'reasoning': 'claude-3-haiku-20240307',
                'content_generation': 'claude-3-sonnet-20240229'
            }
        }
        
        # Initialize AI clients if available
        self.openai_client = None
        self.anthropic_client = None
        
        if self.ai_enabled:
            self._initialize_ai_clients()
    
    def _initialize_ai_clients(self):
        """Initialize AI service clients"""
        try:
            if self.openai_api_key:
                import openai
                self.openai_client = openai.OpenAI(api_key=self.openai_api_key)
                logger.info("OpenAI client initialized successfully")
            
            if self.anthropic_api_key:
                import anthropic
                self.anthropic_client = anthropic.Anthropic(api_key=self.anthropic_api_key)
                logger.info("Anthropic client initialized successfully")
                
        except ImportError as e:
            logger.warning(f"AI libraries not installed: {e}")
            self.ai_enabled = False
        except Exception as e:
            logger.error(f"Failed to initialize AI clients: {e}")
            self.ai_enabled = False
    
    def generate_job_match_reasoning(self, job: JobPosting, user_profile: JobSeekerProfile, 
                                   score: float, matched_skills: List[str], 
                                   missing_skills: List[str]) -> str:
        """
        Generate AI-powered reasoning for job match score
        """
        if not self.ai_enabled:
            return self._fallback_reasoning(score, matched_skills, missing_skills)
        
        try:
            prompt = f"""
            Analyze this job match and provide clear, actionable reasoning:

            Job: {job.title} at {job.company}
            Job Description: {job.description[:500] if job.description else 'Not provided'}
            
            Candidate Profile:
            - Skills: {', '.join(user_profile.skills) if user_profile.skills else 'Not specified'}
            - Experience: {user_profile.years_of_experience or 'Not specified'} years
            - Bio: {user_profile.bio[:200] if user_profile.bio else 'Not provided'}
            
            Match Results:
            - Score: {score}%
            - Matched Skills: {', '.join(matched_skills) if matched_skills else 'None'}
            - Missing Skills: {', '.join(missing_skills) if missing_skills else 'None'}
            
            Provide a 2-3 sentence explanation of:
            1. Why this score was calculated
            2. Key strengths that align
            3. Main areas for improvement (if any)
            
            Be specific, actionable, and encouraging.
            """
            
            if self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model=self.models['gpt']['reasoning'],
                    messages=[
                        {"role": "system", "content": "You are an expert career counselor and technical recruiter. Provide clear, specific, and actionable job match analysis."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=300,
                    temperature=0.7
                )
                return response.choices[0].message.content.strip()
            
            elif self.anthropic_client:
                response = self.anthropic_client.messages.create(
                    model=self.models['claude']['reasoning'],
                    max_tokens=300,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.content[0].text.strip()
                
        except Exception as e:
            logger.error(f"AI reasoning generation failed: {e}")
            return self._fallback_reasoning(score, matched_skills, missing_skills)
    
    def generate_enhanced_resume_summary(self, job: JobPosting, user_profile: JobSeekerProfile,
                                       job_score: JobScore) -> str:
        """
        Generate AI-enhanced professional summary tailored to specific job
        """
        if not self.ai_enabled:
            return self._fallback_resume_summary(user_profile, job)
        
        try:
            prompt = f"""
            Create a compelling 3-4 sentence professional summary for this job application:

            Target Job: {job.title} at {job.company}
            Job Requirements: {job.description[:400] if job.description else 'Not provided'}
            
            Candidate Background:
            - Current Title: {user_profile.job_title or 'Professional'}
            - Experience: {user_profile.years_of_experience or 'Several'} years
            - Skills: {', '.join(user_profile.skills[:8]) if user_profile.skills else 'Various technical skills'}
            - Bio: {user_profile.bio[:200] if user_profile.bio else 'Experienced professional'}
            - Match Score: {job_score.score}%
            - Matching Skills: {', '.join(job_score.skills_matched[:5]) if job_score.skills_matched else 'Core competencies'}
            
            Requirements:
            - Start with years of experience and current role
            - Highlight 2-3 most relevant skills for this specific job
            - Include a quantifiable achievement if possible
            - End with enthusiasm for this particular opportunity
            - Keep it professional, confident, and ATS-friendly
            - Maximum 4 sentences
            """
            
            if self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model=self.models['gpt']['content_generation'],
                    messages=[
                        {"role": "system", "content": "You are an expert resume writer and career coach. Create compelling, ATS-optimized professional summaries that highlight relevant experience for specific job opportunities."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=200,
                    temperature=0.8
                )
                return response.choices[0].message.content.strip()
                
        except Exception as e:
            logger.error(f"AI resume summary generation failed: {e}")
            return self._fallback_resume_summary(user_profile, job)
    
    def generate_enhanced_cover_letter(self, job: JobPosting, user_profile: JobSeekerProfile,
                                     job_score: JobScore) -> str:
        """
        Generate AI-enhanced cover letter with company research and personalization
        """
        if not self.ai_enabled:
            return self._fallback_cover_letter(user_profile, job)
        
        try:
            prompt = f"""
            Write a compelling, personalized cover letter for this job application:

            Job Details:
            - Position: {job.title}
            - Company: {job.company}
            - Location: {job.location or 'Remote/TBD'}
            - Job Description: {job.description[:500] if job.description else 'Not provided'}
            
            Candidate Profile:
            - Name: {user_profile.first_name} {user_profile.last_name}
            - Current Role: {user_profile.job_title or 'Professional'}
            - Experience: {user_profile.years_of_experience or 'Several'} years
            - Key Skills: {', '.join(job_score.skills_matched[:5]) if job_score.skills_matched else 'Relevant technical skills'}
            - Bio: {user_profile.bio[:300] if user_profile.bio else 'Experienced professional with strong technical background'}
            - Match Score: {job_score.score}%
            
            Requirements:
            - Professional business letter format
            - Engaging opening that shows knowledge of the company/role
            - 2-3 body paragraphs highlighting relevant experience and achievements
            - Specific examples that demonstrate value to this company
            - Confident closing with call to action
            - Professional tone but personable
            - 250-350 words total
            - Include specific skills mentioned in job requirements
            """
            
            if self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model=self.models['gpt']['content_generation'],
                    messages=[
                        {"role": "system", "content": "You are an expert career coach and professional writer. Create compelling, personalized cover letters that demonstrate genuine interest and relevant qualifications for specific opportunities."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=500,
                    temperature=0.8
                )
                return response.choices[0].message.content.strip()
                
        except Exception as e:
            logger.error(f"AI cover letter generation failed: {e}")
            return self._fallback_cover_letter(user_profile, job)
    
    def generate_application_strategy(self, job: JobPosting, user_profile: JobSeekerProfile,
                                    job_score: JobScore) -> Dict:
        """
        Generate AI-powered application strategy and recommendations
        """
        if not self.ai_enabled:
            return self._fallback_strategy(job_score.score)
        
        try:
            prompt = f"""
            Create a strategic application plan for this job opportunity:

            Job: {job.title} at {job.company}
            Industry: Extract from job description
            Match Score: {job_score.score}%
            Candidate Experience: {user_profile.years_of_experience or 'Several'} years
            
            Provide specific, actionable advice in JSON format:
            {{
                "application_timing": "immediate/within_24h/within_week",
                "priority_level": "high/medium/low",
                "networking_strategy": ["specific action 1", "specific action 2"],
                "interview_prep_focus": ["skill/topic 1", "skill/topic 2", "skill/topic 3"],
                "follow_up_timeline": ["1 week: action", "2 weeks: action"],
                "success_probability": "high/medium/low",
                "key_selling_points": ["point 1", "point 2", "point 3"],
                "potential_concerns": ["concern 1", "mitigation strategy"]
            }}
            
            Base recommendations on the match score and job requirements.
            """
            
            if self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model=self.models['gpt']['reasoning'],
                    messages=[
                        {"role": "system", "content": "You are a strategic career advisor. Provide specific, actionable application strategies based on job match analysis. Always respond with valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=400,
                    temperature=0.7
                )
                
                # Parse JSON response
                strategy_text = response.choices[0].message.content.strip()
                return json.loads(strategy_text)
                
        except Exception as e:
            logger.error(f"AI strategy generation failed: {e}")
            return self._fallback_strategy(job_score.score)
    
    def calculate_semantic_similarity(self, job_description: str, user_profile_text: str) -> float:
        """
        Calculate semantic similarity using AI embeddings
        """
        if not self.ai_enabled or not self.openai_client:
            return 0.0  # Fallback to no similarity score
        
        try:
            # Generate embeddings for job and user profile
            job_embedding = self.openai_client.embeddings.create(
                model=self.models['gpt']['embeddings'],
                input=job_description[:1000]  # Limit text length
            ).data[0].embedding
            
            profile_embedding = self.openai_client.embeddings.create(
                model=self.models['gpt']['embeddings'],
                input=user_profile_text[:1000]
            ).data[0].embedding
            
            # Calculate cosine similarity
            import numpy as np
            similarity = np.dot(job_embedding, profile_embedding) / (
                np.linalg.norm(job_embedding) * np.linalg.norm(profile_embedding)
            )
            
            # Convert to percentage
            return float(similarity * 100)
            
        except Exception as e:
            logger.error(f"Semantic similarity calculation failed: {e}")
            return 0.0
    
    # Fallback methods for when AI is not available
    
    def _fallback_reasoning(self, score: float, matched_skills: List[str], missing_skills: List[str]) -> str:
        """Fallback reasoning when AI is not available"""
        if score >= 80:
            return f"Excellent match with {len(matched_skills)} key skills aligned. Strong candidate for this position."
        elif score >= 60:
            return f"Good match with solid skill alignment. Consider highlighting {', '.join(matched_skills[:2])} in application."
        else:
            return f"Moderate match. Focus on transferable skills and consider developing {', '.join(missing_skills[:2])}."
    
    def _fallback_resume_summary(self, user_profile: JobSeekerProfile, job: JobPosting) -> str:
        """Fallback resume summary when AI is not available"""
        experience = user_profile.years_of_experience or "several"
        role = user_profile.job_title or "Professional"
        return f"Experienced {role} with {experience} years of expertise. Proven track record in delivering high-quality solutions and driving results. Seeking to leverage technical skills and leadership experience in a {job.title} role."
    
    def _fallback_cover_letter(self, user_profile: JobSeekerProfile, job: JobPosting) -> str:
        """Fallback cover letter when AI is not available"""
        name = f"{user_profile.first_name} {user_profile.last_name}".strip()
        return f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job.title} position at {job.company}. With my background in {user_profile.job_title or 'technology'} and {user_profile.years_of_experience or 'several'} years of experience, I am confident I can contribute meaningfully to your team.

My experience has equipped me with the skills necessary to excel in this role, and I am particularly excited about the opportunity to bring my expertise to {job.company}. I would welcome the opportunity to discuss how my background and enthusiasm can benefit your organization.

Thank you for your consideration.

Sincerely,
{name}"""
    
    def _fallback_strategy(self, score: float) -> Dict:
        """Fallback strategy when AI is not available"""
        if score >= 80:
            priority = "high"
            timing = "immediate"
            success = "high"
        elif score >= 60:
            priority = "medium" 
            timing = "within_24h"
            success = "medium"
        else:
            priority = "low"
            timing = "within_week"
            success = "low"
        
        return {
            "application_timing": timing,
            "priority_level": priority,
            "networking_strategy": ["Research company on LinkedIn", "Connect with current employees"],
            "interview_prep_focus": ["Technical skills", "Company culture", "Role requirements"],
            "follow_up_timeline": ["1 week: Check application status", "2 weeks: Send follow-up email"],
            "success_probability": success,
            "key_selling_points": ["Relevant experience", "Technical skills", "Strong work ethic"],
            "potential_concerns": ["Skills gap: Continue learning", "Experience level: Highlight achievements"]
        }


# Singleton instance
ai_service = AIEnhancementService()


# Convenience functions
def enhance_job_score_with_ai(job: JobPosting, user_profile: JobSeekerProfile, 
                             job_score: JobScore) -> JobScore:
    """Enhance job score with AI-generated insights"""
    try:
        # Generate AI reasoning
        ai_reasoning = ai_service.generate_job_match_reasoning(
            job, user_profile, job_score.score, 
            job_score.skills_matched, job_score.keywords_missed
        )
        
        # Calculate semantic similarity if available
        if job.description and user_profile.bio:
            profile_text = f"{user_profile.bio} {' '.join(user_profile.skills or [])}"
            semantic_score = ai_service.calculate_semantic_similarity(
                job.description, profile_text
            )
            job_score.embedding_similarity = semantic_score
        
        # Update job score with AI insights
        job_score.ai_reasoning = ai_reasoning
        job_score.save()
        
        logger.info(f"Enhanced job score {job_score.id} with AI insights")
        return job_score
        
    except Exception as e:
        logger.error(f"Failed to enhance job score with AI: {e}")
        return job_score


def enhance_prepared_job_with_ai(prepared_job: PreparedJob) -> PreparedJob:
    """Enhance prepared job with AI-generated content"""
    try:
        job_score = JobScore.objects.filter(
            job=prepared_job.job, 
            user_profile=prepared_job.user_profile
        ).first()
        
        if not job_score:
            logger.warning(f"No job score found for prepared job {prepared_job.id}")
            return prepared_job
        
        # Generate AI-enhanced resume summary
        ai_summary = ai_service.generate_enhanced_resume_summary(
            prepared_job.job, prepared_job.user_profile, job_score
        )
        
        # Generate AI-enhanced cover letter
        ai_cover_letter = ai_service.generate_enhanced_cover_letter(
            prepared_job.job, prepared_job.user_profile, job_score
        )
        
        # Generate application strategy
        ai_strategy = ai_service.generate_application_strategy(
            prepared_job.job, prepared_job.user_profile, job_score
        )
        
        # Update prepared job with AI enhancements
        if hasattr(prepared_job, 'tailored_resume') and isinstance(prepared_job.tailored_resume, dict):
            prepared_job.tailored_resume['ai_enhanced_summary'] = ai_summary
        
        prepared_job.tailored_cover_letter = {
            'ai_generated_letter': ai_cover_letter,
            'application_strategy': ai_strategy,
            'generated_at': datetime.now().isoformat()
        }
        
        prepared_job.ai_customization_notes = f"AI-enhanced content generated at {datetime.now().isoformat()}"
        prepared_job.save()
        
        logger.info(f"Enhanced prepared job {prepared_job.id} with AI content")
        return prepared_job
        
    except Exception as e:
        logger.error(f"Failed to enhance prepared job with AI: {e}")
        return prepared_job
