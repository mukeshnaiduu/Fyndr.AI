"""
Real-time Bulk Job Application System

Allows users to apply to multiple jobs quickly with real-time feedback.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction, models
from django.utils import timezone
import asyncio
import time
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any

from .models import JobApplication, ApplicationEvent
from .serializers import JobApplicationSerializer, ApplicationCreateSerializer
from jobscraper.models import JobPosting

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_apply_to_jobs(request):
    """
    Apply to multiple jobs in bulk with real-time progress updates
    
    Expected payload:
    {
        "job_ids": [1, 2, 3, 4, 5],
        "application_method": "automated",
        "resume_text": "...",
        "cover_letter_text": "...",
        "custom_answers": {},
        "enable_tracking": true
    }
    """
    
    job_ids = request.data.get('job_ids', [])
    if not job_ids:
        return Response({
            'status': 'error',
            'message': 'No job IDs provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(job_ids) > 50:  # Limit bulk applications
        return Response({
            'status': 'error',
            'message': 'Maximum 50 jobs can be applied to at once'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    
    # Get all valid jobs
    jobs = JobPosting.objects.filter(
        id__in=job_ids,
        is_active=True
    )
    
    if not jobs.exists():
        return Response({
            'status': 'error',
            'message': 'No valid jobs found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check for existing applications
    existing_applications = JobApplication.objects.filter(
        job__in=jobs,
        user=user
    ).values_list('job_id', flat=True)
    
    # Filter out jobs already applied to
    jobs_to_apply = jobs.exclude(id__in=existing_applications)
    
    results = {
        'total_requested': len(job_ids),
        'valid_jobs': jobs.count(),
        'already_applied': len(existing_applications),
        'will_apply': jobs_to_apply.count(),
        'applications': [],
        'errors': []
    }
    
    # Apply to each job
    for job in jobs_to_apply:
        try:
            # Create application data
            application_data = {
                'job_id': job.id,
                'application_method': request.data.get('application_method', 'bulk_automated'),
                'resume_text': request.data.get('resume_text', ''),
                'cover_letter_text': request.data.get('cover_letter_text', ''),
                'custom_answers': request.data.get('custom_answers', {}),
                'notes': f"Bulk application submitted at {time.strftime('%Y-%m-%d %H:%M:%S')}",
                'enable_tracking': request.data.get('enable_tracking', True)
            }
            
            serializer = ApplicationCreateSerializer(
                data=application_data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                application = serializer.save()
                
                results['applications'].append({
                    'job_id': job.id,
                    'job_title': job.title,
                    'company': job.company,
                    'application_id': application.id,
                    'status': 'success',
                    'message': 'Application submitted successfully'
                })
                
                # Send real-time notification
                try:
                    send_real_time_notification(user.id, {
                        'type': 'bulk_application_progress',
                        'job_title': job.title,
                        'company': job.company,
                        'application_id': str(application.id),
                        'current': len(results['applications']),
                        'total': jobs_to_apply.count(),
                        'message': f"Applied to {job.title} at {job.company}"
                    })
                except Exception as e:
                    logger.warning(f"Failed to send real-time notification: {e}")
                    
            else:
                results['errors'].append({
                    'job_id': job.id,
                    'job_title': job.title,
                    'company': job.company,
                    'errors': serializer.errors
                })
                
        except Exception as e:
            logger.error(f"Error applying to job {job.id}: {str(e)}")
            results['errors'].append({
                'job_id': job.id,
                'job_title': getattr(job, 'title', 'Unknown'),
                'company': getattr(job, 'company', 'Unknown'),
                'error': str(e)
            })
    
    # Send completion notification
    try:
        send_real_time_notification(user.id, {
            'type': 'bulk_application_complete',
            'total_applied': len(results['applications']),
            'total_errors': len(results['errors']),
            'message': f"Bulk application complete! Applied to {len(results['applications'])} jobs."
        })
    except Exception as e:
        logger.warning(f"Failed to send completion notification: {e}")
    
    return Response({
        'status': 'success',
        'message': f"Bulk application completed. Applied to {len(results['applications'])} jobs.",
        'results': results
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quick_apply_with_matching(request):
    """
    Quick apply to jobs based on user criteria with skill matching
    
    Expected payload:
    {
        "skills": ["Python", "Django", "React"],
        "experience_levels": ["mid", "senior"],
        "locations": ["Bangalore", "Mumbai"],
        "salary_min": 800000,
        "job_types": ["full-time"],
        "max_applications": 20,
        "auto_apply": true
    }
    """
    
    user = request.user
    criteria = request.data
    
    # Build query based on criteria
    query = JobPosting.objects.filter(is_active=True)
    
    # Filter by skills
    skills = criteria.get('skills', [])
    if skills:
        for skill in skills:
            query = query.filter(skills_required__icontains=skill)
    
    # Filter by experience level
    experience_levels = criteria.get('experience_levels', [])
    if experience_levels:
        query = query.filter(experience_level__in=experience_levels)
    
    # Filter by location
    locations = criteria.get('locations', [])
    if locations:
        location_filter = None
        for location in locations:
            if location_filter is None:
                location_filter = models.Q(location__icontains=location)
            else:
                location_filter |= models.Q(location__icontains=location)
        if location_filter:
            query = query.filter(location_filter)
    
    # Filter by salary
    salary_min = criteria.get('salary_min')
    if salary_min:
        query = query.filter(salary_min__gte=salary_min)
    
    # Filter by job type
    job_types = criteria.get('job_types', [])
    if job_types:
        query = query.filter(job_type__in=job_types)
    
    # Exclude jobs already applied to
    applied_jobs = JobApplication.objects.filter(user=user).values_list('job_id', flat=True)
    query = query.exclude(id__in=applied_jobs)
    
    # Limit results
    max_applications = min(criteria.get('max_applications', 10), 50)
    matching_jobs = query[:max_applications]
    
    if not matching_jobs:
        return Response({
            'status': 'info',
            'message': 'No matching jobs found with the specified criteria',
            'matches': 0
        }, status=status.HTTP_200_OK)
    
    # If auto_apply is True, apply to all matching jobs
    auto_apply = criteria.get('auto_apply', False)
    
    response_data = {
        'status': 'success',
        'matches': len(matching_jobs),
        'jobs': []
    }
    
    for job in matching_jobs:
        job_data = {
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'skills_required': job.skills_required,
            'experience_level': job.experience_level,
            'url': job.url
        }
        
        if auto_apply:
            # Apply to this job
            try:
                application_data = {
                    'job_id': job.id,
                    'application_method': 'quick_match_automated',
                    'resume_text': request.data.get('resume_text', ''),
                    'cover_letter_text': request.data.get('cover_letter_text', ''),
                    'notes': f"Auto-applied via quick matching at {time.strftime('%Y-%m-%d %H:%M:%S')}",
                    'enable_tracking': True
                }
                
                serializer = ApplicationCreateSerializer(
                    data=application_data,
                    context={'request': request}
                )
                
                if serializer.is_valid():
                    application = serializer.save()
                    job_data['applied'] = True
                    job_data['application_id'] = application.id
                    job_data['application_status'] = 'submitted'
                else:
                    job_data['applied'] = False
                    job_data['application_error'] = serializer.errors
                    
            except Exception as e:
                job_data['applied'] = False
                job_data['application_error'] = str(e)
        else:
            job_data['applied'] = False
        
        response_data['jobs'].append(job_data)
    
    if auto_apply:
        applied_count = sum(1 for job in response_data['jobs'] if job.get('applied'))
        response_data['message'] = f"Found {len(matching_jobs)} matching jobs, applied to {applied_count}"
        
        # Send real-time notification
        try:
            send_real_time_notification(user.id, {
                'type': 'quick_apply_complete',
                'matched': len(matching_jobs),
                'applied': applied_count,
                'message': f"Quick apply complete! Applied to {applied_count} matching jobs."
            })
        except Exception as e:
            logger.warning(f"Failed to send notification: {e}")
    else:
        response_data['message'] = f"Found {len(matching_jobs)} matching jobs. Set 'auto_apply': true to apply automatically."
    
    return response_data


def send_real_time_notification(user_id: int, notification_data: Dict[str, Any]):
    """Send real-time notification to user"""
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"user_{user_id}",
                {
                    'type': 'job_application_notification',
                    **notification_data
                }
            )
    except Exception as e:
        logger.warning(f"Failed to send real-time notification: {e}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_application_suggestions(request):
    """
    Get job suggestions based on user's profile and application history
    """
    user = request.user
    
    # Get user's applied jobs to analyze patterns
    applied_jobs = JobApplication.objects.filter(user=user).select_related('job')
    
    if not applied_jobs.exists():
        # New user - get popular jobs
        suggested_jobs = JobPosting.objects.filter(
            is_active=True
        ).order_by('-date_posted')[:20]
    else:
        # Analyze user's preferences
        applied_skills = set()
        applied_companies = set()
        applied_locations = set()
        
        for app in applied_jobs:
            if app.job.skills_required:
                applied_skills.update(app.job.skills_required)
            applied_companies.add(app.job.company)
            if app.job.location:
                applied_locations.add(app.job.location)
        
        # Find similar jobs
        query = JobPosting.objects.filter(is_active=True)
        
        # Exclude already applied jobs
        applied_job_ids = applied_jobs.values_list('job_id', flat=True)
        query = query.exclude(id__in=applied_job_ids)
        
        # Score jobs based on similarity
        # This is a simple implementation - could be enhanced with ML
        suggested_jobs = query.order_by('-date_posted')[:20]
    
    suggestions = []
    for job in suggested_jobs:
        match_score = calculate_match_score(user, job, applied_jobs)
        suggestions.append({
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'match_score': match_score,
            'url': job.url,
            'skills_required': job.skills_required,
            'date_posted': job.date_posted
        })
    
    # Sort by match score
    suggestions.sort(key=lambda x: x['match_score'], reverse=True)
    
    return Response({
        'status': 'success',
        'suggestions': suggestions[:10],  # Top 10 suggestions
        'total_available': JobPosting.objects.filter(is_active=True).count(),
        'user_applications': applied_jobs.count()
    })


def calculate_match_score(user, job, user_applications):
    """
    Calculate a simple match score between user and job
    Returns a score between 0-100
    """
    score = 50  # Base score
    
    if not user_applications.exists():
        return score
    
    # Analyze user's application patterns
    user_skills = set()
    user_companies = set()
    
    for app in user_applications:
        if app.job.skills_required:
            user_skills.update(app.job.skills_required)
        user_companies.add(app.job.company)
    
    # Skill matching
    if job.skills_required and user_skills:
        common_skills = set(job.skills_required) & user_skills
        skill_match_ratio = len(common_skills) / len(set(job.skills_required))
        score += skill_match_ratio * 30  # Up to 30 points for skills
    
    # Company preference (if user applied to similar companies)
    if job.company in user_companies:
        score += 10
    
    # Recency boost
    if job.date_posted and (timezone.now().date() - job.date_posted).days <= 7:
        score += 10
    
    return min(int(score), 100)
