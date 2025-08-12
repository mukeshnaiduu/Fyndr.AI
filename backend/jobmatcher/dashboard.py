"""
Job Matcher Dashboard Analytics

Provides analytics and insights for users about their job matching performance,
application statistics, and optimization recommendations.

Future AI Enhancements:
- Predictive analytics for application success
- Market trend analysis and salary insights
- Career progression recommendations
- Industry-specific matching patterns
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from django.db.models import Avg, Count, Q, Max, Min
from django.utils import timezone
from fyndr_auth.models import JobSeekerProfile
from jobscraper.models import JobPosting
from .models import JobScore, PreparedJob, UserPreferences

logger = logging.getLogger(__name__)


class JobMatcherDashboard:
    """
    Analytics dashboard for job matching insights
    """
    
    def __init__(self):
        self.score_thresholds = {
            'excellent': 90,
            'good': 75,
            'fair': 60,
            'poor': 40
        }
    
    def get_user_overview(self, user_profile: JobSeekerProfile) -> Dict:
        """
        Get comprehensive overview of user's job matching status
        """
        try:
            # Get basic counts
            total_scores = JobScore.objects.filter(user_profile=user_profile).count()
            total_packets = PreparedJob.objects.filter(user_profile=user_profile).count()
            ready_packets = PreparedJob.objects.filter(user_profile=user_profile, packet_ready=True).count()
            
            # Get score statistics
            score_stats = JobScore.objects.filter(user_profile=user_profile).aggregate(
                avg_score=Avg('score'),
                max_score=Max('score'),
                min_score=Min('score')
            )
            
            # Get recent activity
            recent_scores = JobScore.objects.filter(
                user_profile=user_profile,
                created_at__gte=timezone.now() - timedelta(days=7)
            ).count()
            
            recent_packets = PreparedJob.objects.filter(
                user_profile=user_profile,
                packet_created_at__gte=timezone.now() - timedelta(days=7)
            ).count()
            
            # Calculate match quality distribution
            quality_distribution = self.get_match_quality_distribution(user_profile)
            
            # Get user preferences
            preferences = getattr(user_profile, 'preferences', None)
            min_score_threshold = preferences.min_match_score if preferences else 50.0
            
            # Count jobs meeting threshold
            qualifying_matches = JobScore.objects.filter(
                user_profile=user_profile,
                score__gte=min_score_threshold
            ).count()
            
            overview = {
                'profile_completeness': self.calculate_profile_completeness(user_profile),
                'matching_stats': {
                    'total_jobs_scored': total_scores,
                    'average_score': round(score_stats['avg_score'] or 0, 1),
                    'highest_score': score_stats['max_score'] or 0,
                    'lowest_score': score_stats['min_score'] or 0,
                    'qualifying_matches': qualifying_matches,
                    'match_rate': round((qualifying_matches / total_scores * 100) if total_scores > 0 else 0, 1)
                },
                'application_readiness': {
                    'total_packets': total_packets,
                    'ready_to_apply': ready_packets,
                    'readiness_rate': round((ready_packets / total_packets * 100) if total_packets > 0 else 0, 1)
                },
                'recent_activity': {
                    'scores_this_week': recent_scores,
                    'packets_this_week': recent_packets
                },
                'quality_distribution': quality_distribution,
                'recommendations': self.generate_dashboard_recommendations(user_profile, score_stats, quality_distribution)
            }
            
            return overview
            
        except Exception as e:
            logger.error(f"Error generating user overview: {str(e)}")
            return {'error': str(e)}
    
    def calculate_profile_completeness(self, user_profile: JobSeekerProfile) -> Dict:
        """
        Calculate how complete the user's profile is for optimal matching
        """
        completeness_factors = {
            'basic_info': {
                'weight': 20,
                'completed': bool(user_profile.first_name and user_profile.last_name and user_profile.email)
            },
            'skills': {
                'weight': 25,
                'completed': bool(user_profile.skills and len(user_profile.skills) >= 5)
            },
            'experience': {
                'weight': 15,
                'completed': bool(user_profile.years_of_experience and user_profile.experience_level)
            },
            'job_preferences': {
                'weight': 20,
                'completed': bool(user_profile.job_title and user_profile.preferred_locations)
            },
            'bio': {
                'weight': 10,
                'completed': bool(user_profile.bio and len(user_profile.bio) >= 100)
            },
            'resume': {
                'weight': 10,
                'completed': bool(user_profile.resume_data or user_profile.resume_url)
            }
        }
        
        total_weight = sum(factor['weight'] for factor in completeness_factors.values())
        completed_weight = sum(
            factor['weight'] for factor in completeness_factors.values() 
            if factor['completed']
        )
        
        completeness_score = round((completed_weight / total_weight * 100), 1)
        
        # Generate missing items
        missing_items = [
            key.replace('_', ' ').title() 
            for key, factor in completeness_factors.items() 
            if not factor['completed']
        ]
        
        return {
            'score': completeness_score,
            'total_factors': len(completeness_factors),
            'completed_factors': sum(1 for factor in completeness_factors.values() if factor['completed']),
            'missing_items': missing_items,
            'status': 'excellent' if completeness_score >= 90 else 
                     'good' if completeness_score >= 75 else 
                     'fair' if completeness_score >= 60 else 'needs_improvement'
        }
    
    def get_match_quality_distribution(self, user_profile: JobSeekerProfile) -> Dict:
        """
        Get distribution of job scores by quality categories
        """
        job_scores = JobScore.objects.filter(user_profile=user_profile)
        
        distribution = {
            'excellent': job_scores.filter(score__gte=self.score_thresholds['excellent']).count(),
            'good': job_scores.filter(
                score__gte=self.score_thresholds['good'], 
                score__lt=self.score_thresholds['excellent']
            ).count(),
            'fair': job_scores.filter(
                score__gte=self.score_thresholds['fair'], 
                score__lt=self.score_thresholds['good']
            ).count(),
            'poor': job_scores.filter(score__lt=self.score_thresholds['fair']).count()
        }
        
        total = sum(distribution.values())
        
        # Add percentages
        if total > 0:
            for category in distribution:
                distribution[f"{category}_percentage"] = round((distribution[category] / total * 100), 1)
        
        distribution['total'] = total
        return distribution
    
    def get_skills_analysis(self, user_profile: JobSeekerProfile) -> Dict:
        """
        Analyze which skills are most valuable for the user's matches
        """
        job_scores = JobScore.objects.filter(user_profile=user_profile)
        
        # Count skill frequency in matches
        skill_frequency = {}
        skill_avg_scores = {}
        
        for job_score in job_scores:
            if job_score.skills_matched:
                for skill in job_score.skills_matched:
                    skill_lower = skill.lower()
                    skill_frequency[skill_lower] = skill_frequency.get(skill_lower, 0) + 1
                    
                    # Track scores for this skill
                    if skill_lower not in skill_avg_scores:
                        skill_avg_scores[skill_lower] = []
                    skill_avg_scores[skill_lower].append(job_score.score)
        
        # Calculate average scores per skill
        skill_analysis = []
        for skill, frequency in skill_frequency.items():
            avg_score = sum(skill_avg_scores[skill]) / len(skill_avg_scores[skill])
            skill_analysis.append({
                'skill': skill.title(),
                'frequency': frequency,
                'average_score': round(avg_score, 1),
                'value_score': round(frequency * avg_score / 100, 2)  # Combined metric
            })
        
        # Sort by value score (frequency * average score)
        skill_analysis.sort(key=lambda x: x['value_score'], reverse=True)
        
        return {
            'top_skills': skill_analysis[:10],
            'total_unique_skills': len(skill_analysis),
            'most_valuable_skill': skill_analysis[0] if skill_analysis else None
        }
    
    def get_market_insights(self, user_profile: JobSeekerProfile) -> Dict:
        """
        Provide market insights based on user's job scores and preferences
        
        TODO: Add AI-powered market analysis:
        - Industry salary trends
        - Skill demand forecasting
        - Geographic opportunity analysis
        - Company growth predictions
        """
        try:
            user_preferences = getattr(user_profile, 'preferences', None)
            
            # Get jobs in user's preferred locations
            preferred_locations = user_preferences.preferred_locations if user_preferences else []
            
            # Analyze job market in preferred locations
            location_analysis = []
            if preferred_locations:
                for location in preferred_locations[:5]:  # Limit to top 5
                    location_jobs = JobPosting.objects.filter(
                        location__icontains=location,
                        is_active=True
                    )
                    
                    # Get user's scores for jobs in this location
                    location_scores = JobScore.objects.filter(
                        user_profile=user_profile,
                        job__location__icontains=location
                    )
                    
                    if location_scores.exists():
                        avg_score = location_scores.aggregate(Avg('score'))['score__avg']
                        location_analysis.append({
                            'location': location,
                            'total_jobs': location_jobs.count(),
                            'user_scores': location_scores.count(),
                            'average_match': round(avg_score or 0, 1),
                            'opportunity_rating': 'high' if avg_score and avg_score >= 75 else 
                                                'medium' if avg_score and avg_score >= 60 else 'low'
                        })
            
            # Sort by opportunity rating and average match
            location_analysis.sort(key=lambda x: (x['average_match'], x['total_jobs']), reverse=True)
            
            # Analyze trending skills in the market
            recent_jobs = JobPosting.objects.filter(
                is_active=True,
                created_at__gte=timezone.now() - timedelta(days=30)
            )
            
            # Get most common skills in recent job matches
            recent_scores = JobScore.objects.filter(
                user_profile=user_profile,
                job__in=recent_jobs
            )
            
            trending_skills = {}
            for score in recent_scores:
                if score.skills_matched:
                    for skill in score.skills_matched:
                        trending_skills[skill.lower()] = trending_skills.get(skill.lower(), 0) + 1
            
            trending_skills_list = [
                {'skill': skill.title(), 'frequency': freq}
                for skill, freq in sorted(trending_skills.items(), key=lambda x: x[1], reverse=True)[:10]
            ]
            
            return {
                'location_opportunities': location_analysis,
                'trending_skills': trending_skills_list,
                'market_activity': {
                    'new_jobs_this_month': recent_jobs.count(),
                    'your_matches_this_month': recent_scores.count(),
                    'match_rate_trend': 'improving' if recent_scores.count() > 0 else 'stable'
                },
                'recommendations': self.generate_market_recommendations(location_analysis, trending_skills_list)
            }
            
        except Exception as e:
            logger.error(f"Error generating market insights: {str(e)}")
            return {'error': str(e)}
    
    def generate_dashboard_recommendations(self, user_profile: JobSeekerProfile, 
                                         score_stats: Dict, quality_distribution: Dict) -> List[str]:
        """
        Generate personalized recommendations for improving job matching
        """
        recommendations = []
        
        avg_score = score_stats.get('avg_score', 0) or 0
        total_scores = quality_distribution.get('total', 0)
        
        # Profile completeness recommendations
        completeness = self.calculate_profile_completeness(user_profile)
        if completeness['score'] < 80:
            recommendations.append(f"Complete your profile ({completeness['score']:.0f}% done) to improve match accuracy")
        
        # Score-based recommendations
        if avg_score < 60:
            recommendations.append("Consider expanding your skill set to match more job requirements")
        elif avg_score < 75:
            recommendations.append("Focus on highlighting your strengths in high-scoring job applications")
        
        # Activity recommendations
        if total_scores < 10:
            recommendations.append("Score more jobs to get better insights and find optimal matches")
        
        # Quality distribution recommendations
        excellent_jobs = quality_distribution.get('excellent', 0)
        if excellent_jobs == 0 and total_scores > 5:
            recommendations.append("Consider adjusting your job search criteria to find better matches")
        elif excellent_jobs > 0:
            recommendations.append(f"You have {excellent_jobs} excellent matches - prioritize applying to these!")
        
        # Skills recommendations
        user_skills = user_profile.skills if isinstance(user_profile.skills, list) else []
        if len(user_skills) < 8:
            recommendations.append("Add more skills to your profile to increase matching opportunities")
        
        return recommendations[:5]  # Limit to top 5 recommendations
    
    def generate_market_recommendations(self, location_analysis: List, trending_skills: List) -> List[str]:
        """
        Generate market-based recommendations
        """
        recommendations = []
        
        if location_analysis:
            best_location = location_analysis[0]
            if best_location['opportunity_rating'] == 'high':
                recommendations.append(f"Focus your search on {best_location['location']} - high opportunity area for you")
        
        if trending_skills:
            top_skill = trending_skills[0]['skill']
            recommendations.append(f"Consider highlighting {top_skill} - it's trending in recent job matches")
        
        return recommendations


# Singleton instance
dashboard = JobMatcherDashboard()


# Convenience functions
def get_user_dashboard(user_profile: JobSeekerProfile) -> Dict:
    """Get comprehensive dashboard data for a user"""
    return {
        'overview': dashboard.get_user_overview(user_profile),
        'skills_analysis': dashboard.get_skills_analysis(user_profile),
        'market_insights': dashboard.get_market_insights(user_profile)
    }
