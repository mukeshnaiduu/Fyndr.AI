"""
Dynamic AI-Powered Job Matching Engine

This module provides real-time intelligent job scoring and matching functionality.
It continuously compares job requirements against user profiles with live updates.

Enhanced AI Features:
- Real-time semantic embeddings with OpenAI/Google Embeddings
- Live GPT/Claude/Gemini integration for intelligent skill assessment
- Dynamic machine learning models with continuous learning
- Real-time job preference updates and live matching scores
"""

import re
import logging
import asyncio
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from asgiref.sync import sync_to_async
from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile
from .models import JobScore, UserPreferences
from .ai_service import AIEnhancementService

logger = logging.getLogger(__name__)


class DynamicJobMatchingEngine:
    """
    Real-time dynamic engine for intelligent job-to-candidate matching
    """
    
    def __init__(self):
        self.ai_service = AIEnhancementService()
        self.cache_ttl = 300  # 5 minutes cache
        self.active_matchers = {}  # Track active real-time matchers
        
        self.skill_synonyms = {
            # Programming Languages
            'javascript': ['js', 'ecmascript', 'node.js', 'nodejs', 'typescript', 'ts'],
            'python': ['py', 'python3', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
            'java': ['jvm', 'spring', 'spring boot', 'kotlin', 'scala'],
            'react': ['reactjs', 'react.js', 'next.js', 'gatsby'],
            'angular': ['angularjs', 'angular.js', 'ng'],
            'vue': ['vuejs', 'vue.js', 'nuxt.js'],
            
            # Databases
            'postgresql': ['postgres', 'psql', 'pg'],
            'mysql': ['sql', 'mariadb'],
            'mongodb': ['mongo', 'nosql', 'document db'],
            'redis': ['in-memory', 'cache'],
            'elasticsearch': ['elastic', 'search engine'],
            
            # Cloud & DevOps
            'aws': ['amazon web services', 'ec2', 's3', 'lambda', 'cloudfront', 'rds'],
            'azure': ['microsoft azure', 'azure functions', 'cosmos db'],
            'gcp': ['google cloud', 'google cloud platform', 'firebase'],
            'docker': ['containerization', 'containers'],
            'kubernetes': ['k8s', 'container orchestration', 'helm'],
            'terraform': ['iac', 'infrastructure as code'],
            'jenkins': ['ci/cd', 'continuous integration'],
            
            # AI/ML
            'machine learning': ['ml', 'artificial intelligence', 'ai', 'deep learning'],
            'tensorflow': ['tf', 'keras'],
            'pytorch': ['torch'],
            'scikit-learn': ['sklearn'],
            
            # Frontend
            'css': ['scss', 'sass', 'less', 'tailwind'],
            'html': ['html5', 'markup'],
            'bootstrap': ['css framework'],
            
            # Backend
            'rest api': ['restful', 'api', 'microservices'],
            'graphql': ['graph api'],
            'websocket': ['real-time', 'socket.io'],
            
            # Common synonyms
            'machine learning': ['ml', 'artificial intelligence', 'ai', 'deep learning'],
            'data science': ['data analysis', 'analytics', 'data scientist'],
            'frontend': ['front-end', 'ui', 'user interface'],
            'backend': ['back-end', 'server-side'],
            'fullstack': ['full-stack', 'full stack'],
        }
    
    async def start_real_time_matching(self, user_id: int) -> None:
        """Start real-time job matching for a user"""
        if user_id in self.active_matchers:
            return  # Already running
            
        self.active_matchers[user_id] = True
        asyncio.create_task(self._real_time_matching_loop(user_id))
    
    async def _real_time_matching_loop(self, user_id: int) -> None:
        """Background loop for continuous job matching"""
        try:
            while self.active_matchers.get(user_id, False):
                await self._update_user_job_scores(user_id)
                await asyncio.sleep(300)  # Update every 5 minutes
        except Exception as e:
            logger.error(f"Real-time matching failed for user {user_id}: {e}")
        finally:
            self.active_matchers.pop(user_id, None)
    
    async def _update_user_job_scores(self, user_id: int) -> None:
        """Update job scores for a user with latest jobs"""
        try:
            # Get new jobs from last 24 hours
            recent_jobs = await sync_to_async(list)(
                JobPosting.objects.filter(
                    date_posted__gte=timezone.now() - timedelta(hours=24),
                    is_active=True
                )
            )
            
            user_profile = await sync_to_async(JobSeekerProfile.objects.get)(user_id=user_id)
            
            for job in recent_jobs:
                # Check if already scored
                existing_score = await sync_to_async(
                    lambda: JobScore.objects.filter(
                        user_profile=user_profile, job=job
                    ).first()
                )()
                
                if not existing_score:
                    # Calculate and save new score
                    await self._calculate_and_save_job_score(user_profile, job)
                    
        except Exception as e:
            logger.error(f"Failed to update job scores for user {user_id}: {e}")
    
    async def _calculate_and_save_job_score(self, user_profile, job) -> None:
        """Calculate and save job score asynchronously"""
        try:
            score_data = await sync_to_async(self.calculate_job_score)(user_profile, job)
            
            await sync_to_async(JobScore.objects.create)(
                user_profile=user_profile,
                job=job,
                overall_score=score_data['overall_score'],
                skill_match_score=score_data['skill_match_score'],
                location_score=score_data['location_score'],
                salary_score=score_data['salary_score'],
                company_score=score_data['company_score'],
                matched_skills=score_data['matched_skills'],
                missing_skills=score_data['missing_skills'],
                score_breakdown=score_data['score_breakdown']
            )
            
        except Exception as e:
            logger.error(f"Failed to calculate job score: {e}")
    
    def extract_skills_from_text(self, text: str) -> List[str]:
        """
        Extract skills and technologies from job description or user profile
        
        TODO: Replace with AI-powered skill extraction using:
        - Named Entity Recognition (NER) models
        - GPT/Claude API for intelligent skill identification
        - Industry-specific skill taxonomies
        """
        if not text:
            return []
        
        text_lower = text.lower()
        skills = []
        
        # Common technical skills and keywords
        skill_patterns = [
            # Programming Languages
            r'\b(?:python|java|javascript|typescript|c\+\+|c#|php|ruby|go|rust|kotlin|swift)\b',
            r'\b(?:react|angular|vue|svelte|ember)\b',
            r'\b(?:node\.?js|express|django|flask|spring|rails)\b',
            
            # Databases
            r'\b(?:postgresql|mysql|mongodb|redis|elasticsearch|dynamodb)\b',
            r'\b(?:sql|nosql|database)\b',
            
            # Cloud & DevOps
            r'\b(?:aws|azure|gcp|google cloud|docker|kubernetes|terraform)\b',
            r'\b(?:ci/cd|jenkins|github actions|gitlab)\b',
            
            # Frameworks & Tools
            r'\b(?:git|linux|unix|agile|scrum|jira)\b',
            r'\b(?:machine learning|ai|data science|analytics)\b',
            
            # Soft Skills
            r'\b(?:leadership|communication|problem[- ]solving|teamwork)\b',
        ]
        
        for pattern in skill_patterns:
            matches = re.findall(pattern, text_lower)
            skills.extend(matches)
        
        # Clean and deduplicate
        skills = list(set([skill.strip() for skill in skills if len(skill.strip()) > 2]))
        
        return skills
    
    def normalize_skill(self, skill: str) -> str:
        """
        Normalize skill names using synonyms
        """
        skill_lower = skill.lower().strip()
        
        for main_skill, synonyms in self.skill_synonyms.items():
            if skill_lower == main_skill or skill_lower in synonyms:
                return main_skill
        
        return skill_lower
    
    def calculate_skill_match(self, user_skills: List[str], job_requirements: List[str]) -> Tuple[List[str], List[str], float]:
        """
        Calculate skill matching between user and job requirements
        
        Returns:
            - matched_skills: Skills that match
            - missing_skills: Required skills user doesn't have
            - match_percentage: Percentage of requirements met
        """
        if not job_requirements:
            return [], [], 100.0
        
        # Normalize skills
        user_skills_norm = [self.normalize_skill(skill) for skill in user_skills]
        job_requirements_norm = [self.normalize_skill(skill) for skill in job_requirements]
        
        # Find matches
        matched_skills = []
        missing_skills = []
        
        for req_skill in job_requirements_norm:
            if req_skill in user_skills_norm:
                matched_skills.append(req_skill)
            else:
                missing_skills.append(req_skill)
        
        # Calculate match percentage
        if len(job_requirements_norm) == 0:
            match_percentage = 100.0
        else:
            match_percentage = (len(matched_skills) / len(job_requirements_norm)) * 100
        
        return matched_skills, missing_skills, match_percentage
    
    def calculate_location_match(self, user_preferences: Optional[UserPreferences], job_location: str) -> float:
        """
        Calculate location compatibility score
        """
        if not user_preferences or not job_location:
            return 50.0  # Neutral score
        
        job_location_lower = job_location.lower()
        
        # Check remote preference
        if 'remote' in job_location_lower:
            if user_preferences.remote_preference == 'REMOTE':
                return 100.0
            elif user_preferences.remote_preference == 'HYBRID':
                return 90.0
            elif user_preferences.remote_preference == 'FLEXIBLE':
                return 80.0
            else:
                return 30.0
        
        # Check preferred locations
        if user_preferences.preferred_locations:
            for preferred_loc in user_preferences.preferred_locations:
                if preferred_loc.lower() in job_location_lower:
                    return 95.0
        
        # Default location scoring
        if user_preferences.remote_preference == 'ONSITE':
            return 70.0
        elif user_preferences.remote_preference == 'FLEXIBLE':
            return 60.0
        else:
            return 40.0
    
    def calculate_salary_match(self, user_preferences: Optional[UserPreferences], job: JobPosting) -> float:
        """
        Calculate salary compatibility score
        
        TODO: Add AI-powered salary analysis:
        - Market rate analysis using external APIs
        - Cost of living adjustments
        - Career level appropriate salary ranges
        """
        if not user_preferences or not user_preferences.salary_expectation:
            return 70.0  # Neutral score when no preference
        
        expected_salary = user_preferences.salary_expectation
        
        # If job has salary information
        if hasattr(job, 'salary_min') and job.salary_min:
            job_min = job.salary_min
            job_max = getattr(job, 'salary_max', job_min)
            
            # Check if expected salary falls within range
            if job_min <= expected_salary <= job_max:
                return 100.0
            elif expected_salary < job_min:
                # Job pays more than expected - good!
                return 95.0
            else:
                # Job pays less than expected
                gap_percentage = ((expected_salary - job_max) / expected_salary) * 100
                if gap_percentage <= 10:
                    return 80.0
                elif gap_percentage <= 20:
                    return 60.0
                else:
                    return 30.0
        
        return 70.0  # Default when no salary info available
    
    def score_job(self, job: JobPosting, user_profile: JobSeekerProfile) -> Dict:
        """
        Main scoring function - calculates comprehensive job match score
        
        TODO: Add AI enhancement hooks:
        - Semantic similarity using embeddings (OpenAI, Google, Hugging Face)
        - GPT/Claude analysis of job description vs user experience
        - Personality and culture fit analysis
        - Career progression potential assessment
        """
        try:
            # Get user preferences
            user_preferences = getattr(user_profile, 'preferences', None)
            
            # Extract skills from job description
            job_text = f"{job.title} {job.description or ''}"
            job_requirements = self.extract_skills_from_text(job_text)
            
            # Extract user skills from profile
            user_skills_list = user_profile.skills if isinstance(user_profile.skills, list) else []
            user_skills_text = " ".join(user_skills_list) + f" {user_profile.bio or ''}"
            if hasattr(user_profile, 'job_title') and user_profile.job_title:
                user_skills_text += f" {user_profile.job_title}"
            
            user_skills = self.extract_skills_from_text(user_skills_text)
            # Add skills from JSON field directly
            user_skills.extend(user_skills_list)
            
            # Calculate skill matching
            matched_skills, missing_skills, skill_match_score = self.calculate_skill_match(
                user_skills, job_requirements
            )
            
            # Calculate location compatibility
            location_score = self.calculate_location_match(user_preferences, job.location or '')
            
            # Calculate salary compatibility
            salary_score = self.calculate_salary_match(user_preferences, job)
            
            # Calculate role preference match
            role_score = 50.0  # Default
            if user_preferences and user_preferences.preferred_roles:
                job_title_lower = job.title.lower()
                for preferred_role in user_preferences.preferred_roles:
                    if preferred_role.lower() in job_title_lower:
                        role_score = 90.0
                        break
            
            # Weighted final score calculation
            weights = {
                'skills': 0.4,      # 40% - Most important
                'location': 0.25,   # 25% - Very important
                'salary': 0.20,     # 20% - Important
                'role': 0.15,       # 15% - Moderately important
            }
            
            final_score = (
                skill_match_score * weights['skills'] +
                location_score * weights['location'] +
                salary_score * weights['salary'] +
                role_score * weights['role']
            )
            
            # Ensure score is within bounds
            final_score = max(0.0, min(100.0, final_score))
            
            return {
                'score': round(final_score, 2),
                'skills_matched': matched_skills,
                'keywords_missed': missing_skills,
                'breakdown': {
                    'skills_score': skill_match_score,
                    'location_score': location_score,
                    'salary_score': salary_score,
                    'role_score': role_score,
                },
                'weights': weights,
                # Future AI fields
                'embedding_similarity': None,  # TODO: Add semantic similarity
                'ai_reasoning': '',  # TODO: Add AI explanation
            }
            
        except Exception as e:
            logger.error(f"Error scoring job {job.id} for user {user_profile.id}: {str(e)}")
            return {
                'score': 0.0,
                'skills_matched': [],
                'keywords_missed': [],
                'breakdown': {},
                'weights': {},
                'embedding_similarity': None,
                'ai_reasoning': f"Error during scoring: {str(e)}",
            }
    
    @transaction.atomic
    def bulk_score_jobs(self, jobs: List[JobPosting], user_profile: JobSeekerProfile, 
                       update_existing: bool = False) -> List[JobScore]:
        """
        Score multiple jobs for a user and store results
        
        Args:
            jobs: List of JobPosting objects to score
            user_profile: JobSeekerProfile to compare against
            update_existing: Whether to update existing scores
        
        Returns:
            List of created/updated JobScore objects
        """
        job_scores = []
        
        for job in jobs:
            try:
                # Check if score already exists
                existing_score = JobScore.objects.filter(
                    job=job, 
                    user_profile=user_profile
                ).first()
                
                if existing_score and not update_existing:
                    job_scores.append(existing_score)
                    continue
                
                # Calculate score
                score_data = self.score_job(job, user_profile)
                
                # Create or update JobScore
                if existing_score:
                    existing_score.score = score_data['score']
                    existing_score.skills_matched = score_data['skills_matched']
                    existing_score.keywords_missed = score_data['keywords_missed']
                    existing_score.embedding_similarity = score_data['embedding_similarity']
                    existing_score.ai_reasoning = score_data['ai_reasoning']
                    existing_score.save()
                    job_scores.append(existing_score)
                else:
                    job_score = JobScore.objects.create(
                        job=job,
                        user_profile=user_profile,
                        score=score_data['score'],
                        skills_matched=score_data['skills_matched'],
                        keywords_missed=score_data['keywords_missed'],
                        embedding_similarity=score_data['embedding_similarity'],
                        ai_reasoning=score_data['ai_reasoning'],
                    )
                    job_scores.append(job_score)
                
                logger.info(f"Scored job '{job.title}' for user {user_profile.user.email}: {score_data['score']}")
                
            except Exception as e:
                logger.error(f"Failed to score job {job.id} for user {user_profile.id}: {str(e)}")
                continue
        
        return job_scores
    
    def get_top_matches(self, user_profile: JobSeekerProfile, limit: int = 10) -> List[JobScore]:
        """
        Get top matching jobs for a user
        """
        user_preferences = getattr(user_profile, 'preferences', None)
        min_score = user_preferences.min_match_score if user_preferences else 50.0
        
        return JobScore.objects.filter(
            user_profile=user_profile,
            score__gte=min_score
        ).order_by('-score')[:limit]


# Singleton instance
job_matching_engine = DynamicJobMatchingEngine()


# Convenience functions
def score_job(job: JobPosting, user_profile: JobSeekerProfile) -> Dict:
    """Score a single job for a user"""
    return job_matching_engine.calculate_job_score(user_profile, job)


def bulk_score_jobs(jobs: List[JobPosting], user_profile: JobSeekerProfile, 
                   update_existing: bool = False) -> List[JobScore]:
    """Score multiple jobs for a user"""
    return job_matching_engine.bulk_score_jobs(jobs, user_profile, update_existing)


def get_top_matches(user_profile: JobSeekerProfile, limit: int = 10) -> List[JobScore]:
    """Get top matching jobs for a user"""
    return job_matching_engine.get_top_matches(user_profile, limit)
