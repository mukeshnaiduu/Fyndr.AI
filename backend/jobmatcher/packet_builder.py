"""
Job Packet Builder

This service creates complete job applic        readiness['packet_ready'] = job_score.score >= min_score
        
        # Determine confidence level
        if job_score.score >= auto_threshold:
            readiness['confidence_level'] = 'high'
            readiness['packet_ready'] = True
        elif job_score.score >= min_score + 15:
            readiness['confidence_level'] = 'medium'
            readiness['packet_ready'] = True
        elif job_score.score >= min_score:
            readiness['confidence_level'] = 'low'
            readiness['packet_ready'] = True
        else:
            readiness['confidence_level'] = 'insufficient'
            readiness['packet_ready'] = Falseby combining:
- Job matching scores
- Tailored resumes
- Personalized cover letters
- Application notes and strategies

Future AI Enhancements:
- AI-powered application strategy recommendations
- Optimal timing suggestions for applications
- Interview preparation materials
- Follow-up communication templates
"""

import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from django.db import transaction
from django.utils import timezone
from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile
from .models import JobScore, PreparedJob, UserPreferences
from .engine import score_job, bulk_score_jobs
from .resume_customizer import generate_tailored_resume, create_prepared_job
from .cover_letter_generator import generate_cover_letter, update_prepared_job_with_cover_letter

logger = logging.getLogger(__name__)


class JobPacketBuilder:
    """
    Comprehensive job application packet builder
    """
    
    def __init__(self):
        self.packet_statuses = {
            'DRAFT': 'Draft - Not ready for application',
            'READY': 'Ready - All documents prepared',
            'APPLIED': 'Applied - Application submitted',
            'FOLLOW_UP': 'Follow-up - Waiting for response',
            'INTERVIEW': 'Interview - Scheduled or completed',
            'REJECTED': 'Rejected - Application unsuccessful',
            'OFFER': 'Offer - Job offer received'
        }
    
    def analyze_application_readiness(self, job_score: JobScore, user_preferences: UserPreferences) -> Dict:
        """
        Analyze if a job is ready for application based on score and preferences
        """
        readiness = {
            'packet_ready': False,
            'score': job_score.score,
            'meets_threshold': False,
            'missing_requirements': [],
            'recommendations': [],
            'confidence_level': 'low'
        }
        
        # Check if score meets minimum threshold
        min_score = user_preferences.min_match_score if user_preferences else 50.0
        auto_threshold = getattr(user_preferences, 'auto_apply_threshold', 85.0) if user_preferences else 85.0
        
        readiness['meets_threshold'] = job_score.score >= min_score
        
        # Determine confidence level
        if job_score.score >= auto_threshold:
            readiness['confidence_level'] = 'high'
            readiness['is_ready'] = True
        elif job_score.score >= min_score + 15:
            readiness['confidence_level'] = 'medium'
            readiness['is_ready'] = True
        elif job_score.score >= min_score:
            readiness['confidence_level'] = 'low'
            readiness['is_ready'] = True
        else:
            readiness['confidence_level'] = 'insufficient'
            readiness['is_ready'] = False
        
        # Analyze missing requirements
        if job_score.keywords_missed:
            readiness['missing_requirements'] = job_score.keywords_missed[:5]
            if len(job_score.keywords_missed) > 3:
                readiness['recommendations'].append(
                    f"Consider gaining experience with: {', '.join(job_score.keywords_missed[:3])}"
                )
        
        # Generate recommendations based on score
        if job_score.score < 70:
            readiness['recommendations'].append("Consider strengthening your profile with additional relevant skills")
        if job_score.score < 60:
            readiness['recommendations'].append("This position may require significant skill development")
        if job_score.score >= 80:
            readiness['recommendations'].append("Excellent match! Consider prioritizing this application")
        
        return readiness
    
    def generate_application_strategy(self, job: JobPosting, job_score: JobScore, 
                                    user_profile: JobSeekerProfile) -> Dict:
        """
        Generate strategic advice for the job application
        
        TODO: Add AI-powered strategy generation:
        - Analyze company hiring patterns
        - Suggest optimal application timing
        - Recommend networking opportunities
        - Generate interview preparation tips
        """
        strategy = {
            'priority_level': 'medium',
            'application_timing': 'immediate',
            'networking_suggestions': [],
            'interview_prep_focus': [],
            'follow_up_schedule': [],
            'success_probability': 'moderate'
        }
        
        # Determine priority based on score
        if job_score.score >= 85:
            strategy['priority_level'] = 'high'
            strategy['success_probability'] = 'high'
            strategy['application_timing'] = 'immediate'
        elif job_score.score >= 70:
            strategy['priority_level'] = 'medium'
            strategy['success_probability'] = 'moderate'
            strategy['application_timing'] = 'within_24_hours'
        else:
            strategy['priority_level'] = 'low'
            strategy['success_probability'] = 'low'
            strategy['application_timing'] = 'when_ready'
        
        # Generate networking suggestions
        if job.company:
            strategy['networking_suggestions'].extend([
                f"Research {job.company} employees on LinkedIn",
                f"Look for {job.company} alumni from your school/previous companies",
                f"Follow {job.company} on social media for company insights"
            ])
        
        # Interview prep focus areas
        if job_score.skills_matched:
            strategy['interview_prep_focus'].extend([
                f"Prepare examples demonstrating {skill}" for skill in job_score.skills_matched[:3]
            ])
        
        if job_score.keywords_missed:
            strategy['interview_prep_focus'].append(
                f"Research and prepare to discuss: {', '.join(job_score.keywords_missed[:2])}"
            )
        
        # Follow-up schedule
        strategy['follow_up_schedule'] = [
            "1 week: Check application status",
            "2 weeks: Send polite follow-up email",
            "1 month: Consider reaching out via LinkedIn"
        ]
        
        return strategy
    
    def create_application_notes(self, job: JobPosting, job_score: JobScore, 
                               strategy: Dict, readiness: Dict) -> str:
        """
        Generate comprehensive application notes
        """
        notes = []
        
        # Score summary
        notes.append(f"🎯 Match Score: {job_score.score}% ({readiness['confidence_level']} confidence)")
        
        # Strengths
        if job_score.skills_matched:
            notes.append(f"✅ Matching Skills: {', '.join(job_score.skills_matched[:5])}")
        
        # Areas for improvement
        if job_score.keywords_missed:
            notes.append(f"⚠️  Missing Skills: {', '.join(job_score.keywords_missed[:3])}")
        
        # Strategy highlights
        notes.append(f"🚀 Priority: {strategy['priority_level'].title()}")
        notes.append(f"⏰ Apply: {strategy['application_timing'].replace('_', ' ').title()}")
        
        # Key recommendations
        if readiness['recommendations']:
            notes.append("💡 Recommendations:")
            for rec in readiness['recommendations'][:2]:
                notes.append(f"   • {rec}")
        
        # Networking tips
        if strategy['networking_suggestions']:
            notes.append("🤝 Networking:")
            for tip in strategy['networking_suggestions'][:2]:
                notes.append(f"   • {tip}")
        
        return "\n".join(notes)
    
    @transaction.atomic
    def build_job_packet(self, job: JobPosting, user_profile: JobSeekerProfile,
                        force_rebuild: bool = False) -> PreparedJob:
        """
        Build a complete job application packet
        
        This is the main function that creates a comprehensive application package
        """
        try:
            logger.info(f"Building job packet for {job.title} at {job.company} for user {user_profile.user.email}")
            
            # Get user preferences
            user_preferences = getattr(user_profile, 'preferences', None)
            
            # Step 1: Get or create job score
            job_score = JobScore.objects.filter(job=job, user_profile=user_profile).first()
            
            if not job_score or force_rebuild:
                logger.info("Calculating job score...")
                score_data = score_job(job, user_profile)
                
                job_score, _ = JobScore.objects.update_or_create(
                    job=job,
                    user_profile=user_profile,
                    defaults={
                        'score': score_data['score'],
                        'skills_matched': score_data['skills_matched'],
                        'keywords_missed': score_data['keywords_missed'],
                        'embedding_similarity': score_data['embedding_similarity'],
                        'ai_reasoning': score_data['ai_reasoning'],
                    }
                )
            
            # Step 2: Analyze readiness
            logger.info("Analyzing application readiness...")
            readiness = self.analyze_application_readiness(job_score, user_preferences)
            
            # Step 3: Generate strategy
            logger.info("Generating application strategy...")
            strategy = self.generate_application_strategy(job, job_score, user_profile)
            
            # Step 4: Create or update prepared job
            logger.info("Creating prepared job with tailored documents...")
            prepared_job = create_prepared_job(job, user_profile, job_score)
            
            # Step 5: Generate cover letter
            logger.info("Generating cover letter...")
            prepared_job = update_prepared_job_with_cover_letter(prepared_job)
            
            # Step 6: Create application notes
            logger.info("Creating application notes...")
            application_notes = self.create_application_notes(job, job_score, strategy, readiness)
            
            # Step 7: Update prepared job with complete packet data
            packet_data = {
                'readiness_analysis': readiness,
                'application_strategy': strategy,
                'packet_metadata': {
                    'created_at': datetime.now().isoformat(),
                    'builder_version': '1.0',
                    'total_components': 4,  # score, resume, cover_letter, notes
                    'estimated_prep_time': '15-30 minutes',
                }
            }
            
            # Update the prepared job
            prepared_job.ai_customization_notes = application_notes
            prepared_job.packet_ready = readiness['packet_ready']
            
            # Store packet data in a JSON field (you might need to add this to the model)
            if hasattr(prepared_job, 'packet_data'):
                prepared_job.packet_data = packet_data
            
            prepared_job.save()
            
            logger.info(f"Job packet completed! Ready status: {prepared_job.packet_ready}")
            return prepared_job
            
        except Exception as e:
            logger.error(f"Error building job packet for job {job.id}: {str(e)}")
            raise
    
    @transaction.atomic
    def build_bulk_packets(self, user_profile: JobSeekerProfile, 
                          job_limit: int = 20, min_score: float = 50.0) -> List[PreparedJob]:
        """
        Build job packets for multiple high-scoring jobs
        """
        try:
            logger.info(f"Building bulk job packets for user {user_profile.user.email}")
            
            # Get user preferences
            user_preferences = getattr(user_profile, 'preferences', None)
            actual_min_score = user_preferences.min_match_score if user_preferences else min_score
            
            # Get top scoring jobs or score new jobs
            job_scores = JobScore.objects.filter(
                user_profile=user_profile,
                score__gte=actual_min_score
            ).select_related('job').order_by('-score')[:job_limit]
            
            # If we don't have enough scores, score some new jobs
            if len(job_scores) < job_limit:
                logger.info("Scoring additional jobs for packet building...")
                available_jobs = JobPosting.objects.filter(is_active=True)[:job_limit * 2]
                bulk_score_jobs(list(available_jobs), user_profile, update_existing=False)
                
                # Re-query for job scores
                job_scores = JobScore.objects.filter(
                    user_profile=user_profile,
                    score__gte=actual_min_score
                ).select_related('job').order_by('-score')[:job_limit]
            
            # Build packets for each job
            prepared_jobs = []
            for job_score in job_scores:
                try:
                    prepared_job = self.build_job_packet(job_score.job, user_profile)
                    prepared_jobs.append(prepared_job)
                    logger.info(f"Built packet for {job_score.job.title} (Score: {job_score.score}%)")
                except Exception as e:
                    logger.error(f"Failed to build packet for job {job_score.job.id}: {str(e)}")
                    continue
            
            logger.info(f"Completed bulk packet building: {len(prepared_jobs)} packets created")
            return prepared_jobs
            
        except Exception as e:
            logger.error(f"Error in bulk packet building: {str(e)}")
            return []
    
    def get_user_packets_summary(self, user_profile: JobSeekerProfile) -> Dict:
        """
        Get summary of all job packets for a user
        """
        try:
            packets = PreparedJob.objects.filter(
                user_profile=user_profile
            ).select_related('job', 'job_score').order_by('-packet_created_at')
            
            summary = {
                'total_packets': packets.count(),
                'ready_to_apply': packets.filter(packet_ready=True).count(),
                'high_priority': 0,
                'medium_priority': 0,
                'low_priority': 0,
                'average_score': 0,
                'top_matches': [],
                'recent_packets': []
            }
            
            if packets.exists():
                # Calculate priority distribution and average score
                scores = [packet.job_score.score for packet in packets if packet.job_score]
                if scores:
                    summary['average_score'] = sum(scores) / len(scores)
                    
                    for score in scores:
                        if score >= 85:
                            summary['high_priority'] += 1
                        elif score >= 70:
                            summary['medium_priority'] += 1
                        else:
                            summary['low_priority'] += 1
                
                # Get top matches
                top_packets = packets.filter(job_score__isnull=False).order_by('-job_score__score')[:5]
                summary['top_matches'] = [
                    {
                        'job_title': packet.job.title,
                        'company': packet.job.company,
                        'score': packet.job_score.score,
                        'packet_ready': packet.packet_ready
                    }
                    for packet in top_packets
                ]
                
                # Get recent packets
                recent_packets = packets[:10]
                summary['recent_packets'] = [
                    {
                        'job_title': packet.job.title,
                        'company': packet.job.company,
                        'packet_created_at': packet.packet_created_at.isoformat(),
                        'packet_ready': packet.packet_ready,
                        'score': packet.job_score.score if packet.job_score else 0
                    }
                    for packet in recent_packets
                ]
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting packets summary: {str(e)}")
            return {'error': str(e)}


# Singleton instance
job_packet_builder = JobPacketBuilder()


# Convenience functions
def build_job_packet(job: JobPosting, user_profile: JobSeekerProfile, 
                    force_rebuild: bool = False) -> PreparedJob:
    """Build a complete job application packet"""
    return job_packet_builder.build_job_packet(job, user_profile, force_rebuild)


def build_bulk_packets(user_profile: JobSeekerProfile, job_limit: int = 20, 
                      min_score: float = 50.0) -> List[PreparedJob]:
    """Build multiple job packets for a user"""
    return job_packet_builder.build_bulk_packets(user_profile, job_limit, min_score)


def get_user_packets_summary(user_profile: JobSeekerProfile) -> Dict:
    """Get summary of user's job packets"""
    return job_packet_builder.get_user_packets_summary(user_profile)
