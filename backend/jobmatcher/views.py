"""
JobMatcher API Views
Provides endpoints for AI-powered job matching and scoring
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile
from .engine import score_job, bulk_score_jobs, get_top_matches
from .models import JobScore, UserPreferences, PreparedJob
from .serializers import JobScoreSerializer, UserPreferencesSerializer, PreparedJobSerializer
from .packet_builder import build_job_packet, build_bulk_packets, get_user_packets_summary
from .dashboard import get_user_dashboard
from .ai_service import ai_service, enhance_job_score_with_ai, enhance_prepared_job_with_ai
from .automation import automation_manager, enable_automation_for_user, get_automation_dashboard


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def score_single_job(request, job_id):
    """
    Score a single job for the authenticated user
    """
    try:
        job = get_object_or_404(JobPosting, id=job_id, is_active=True)
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        # Calculate score
        score_data = score_job(job, user_profile)
        
        # Store in database
        job_score, created = JobScore.objects.update_or_create(
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
        
        return Response({
            'success': True,
            'job_score': JobScoreSerializer(job_score).data,
            'breakdown': score_data['breakdown'],
            'created': created
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def score_multiple_jobs(request):
    """
    Score multiple jobs for the authenticated user
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        # Get parameters
        job_ids = request.data.get('job_ids', [])
        limit = request.data.get('limit', 50)
        update_existing = request.data.get('update_existing', False)
        
        # Get jobs
        if job_ids:
            jobs = JobPosting.objects.filter(id__in=job_ids, is_active=True)
        else:
            jobs = JobPosting.objects.filter(is_active=True)[:limit]
        
        # Score jobs
        job_scores = bulk_score_jobs(
            jobs=list(jobs),
            user_profile=user_profile,
            update_existing=update_existing
        )
        
        return Response({
            'success': True,
            'scores_created': len(job_scores),
            'job_scores': JobScoreSerializer(job_scores, many=True).data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_matches(request):
    """
    Get top job matches for the authenticated user
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        # Get parameters
        limit = int(request.GET.get('limit', 10))
        min_score = float(request.GET.get('min_score', 0))
        
        # Get matches
        job_scores = JobScore.objects.filter(
            user_profile=user_profile,
            score__gte=min_score
        ).select_related('job').order_by('-score')[:limit]
        
        return Response({
            'success': True,
            'matches': JobScoreSerializer(job_scores, many=True).data,
            'total_count': job_scores.count()
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def user_preferences(request):
    """
    Manage user matching preferences
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        if request.method == 'GET':
            # Get current preferences
            preferences = getattr(user_profile, 'preferences', None)
            if preferences:
                return Response({
                    'success': True,
                    'preferences': UserPreferencesSerializer(preferences).data
                })
            else:
                return Response({
                    'success': True,
                    'preferences': None,
                    'message': 'No preferences set'
                })
        
        elif request.method in ['POST', 'PUT']:
            # Update preferences
            preferences, created = UserPreferences.objects.get_or_create(
                user_profile=user_profile
            )
            
            serializer = UserPreferencesSerializer(preferences, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'preferences': serializer.data,
                    'created': created
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_job_scores(request):
    """
    Clear all job scores for the authenticated user
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        deleted_count = JobScore.objects.filter(user_profile=user_profile).count()
        JobScore.objects.filter(user_profile=user_profile).delete()
        
        return Response({
            'success': True,
            'deleted_count': deleted_count,
            'message': f'Cleared {deleted_count} job scores'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Job Packet Builder Endpoints

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def build_single_packet(request, job_id):
    """
    Build a complete job application packet for a specific job
    """
    try:
        job = get_object_or_404(JobPosting, id=job_id, is_active=True)
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        force_rebuild = request.data.get('force_rebuild', False)
        
        # Build the packet
        prepared_job = build_job_packet(job, user_profile, force_rebuild)
        
        return Response({
            'success': True,
            'prepared_job': PreparedJobSerializer(prepared_job).data,
            'message': f'Job packet built for {job.title} at {job.company}'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def build_bulk_job_packets(request):
    """
    Build job packets for multiple high-scoring jobs
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        # Get parameters
        job_limit = request.data.get('job_limit', 10)
        min_score = request.data.get('min_score', 50.0)
        
        # Build packets
        prepared_jobs = build_bulk_packets(user_profile, job_limit, min_score)
        
        return Response({
            'success': True,
            'packets_created': len(prepared_jobs),
            'prepared_jobs': PreparedJobSerializer(prepared_jobs, many=True).data,
            'message': f'Built {len(prepared_jobs)} job packets'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_job_packets(request):
    """
    Get all job packets for the authenticated user
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        # Get parameters
        limit = int(request.GET.get('limit', 20))
        ready_only = request.GET.get('ready_only', 'false').lower() == 'true'
        
        # Get packets
        packets = PreparedJob.objects.filter(
            user_profile=user_profile
        ).select_related('job').order_by('-packet_created_at')
        
        if ready_only:
            packets = packets.filter(packet_ready=True)
        
        packets = packets[:limit]
        
        return Response({
            'success': True,
            'packets': PreparedJobSerializer(packets, many=True).data,
            'total_count': packets.count()
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_packets_summary(request):
    """
    Get summary of user's job packets and matching statistics
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        summary = get_user_packets_summary(user_profile)
        
        return Response({
            'success': True,
            'summary': summary
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_packet_details(request, packet_id):
    """
    Get detailed information about a specific job packet
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        packet = get_object_or_404(
            PreparedJob,
            id=packet_id,
            user_profile=user_profile
        )
        
        return Response({
            'success': True,
            'packet': PreparedJobSerializer(packet).data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_job_packet(request, packet_id):
    """
    Delete a specific job packet
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        packet = get_object_or_404(
            PreparedJob,
            id=packet_id,
            user_profile=user_profile
        )
        
        job_title = packet.job.title
        company = packet.job.company
        
        packet.delete()
        
        return Response({
            'success': True,
            'message': f'Deleted packet for {job_title} at {company}'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_analytics(request):
    """
    Get comprehensive dashboard analytics for the authenticated user
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        dashboard_data = get_user_dashboard(user_profile)
        
        return Response({
            'success': True,
            'dashboard': dashboard_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================================================
# AI ENHANCEMENT ENDPOINTS
# =============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enhance_job_score_ai(request, job_id):
    """
    Enhance job score with AI-generated insights
    """
    try:
        job = get_object_or_404(JobPosting, id=job_id, is_active=True)
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        # Get existing job score
        job_score = JobScore.objects.filter(
            job=job, user_profile=user_profile
        ).first()
        
        if not job_score:
            return Response({
                'success': False,
                'error': 'Job score not found. Please score the job first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Enhance with AI
        enhanced_score = enhance_job_score_with_ai(job, user_profile, job_score)
        serializer = JobScoreSerializer(enhanced_score)
        
        return Response({
            'success': True,
            'job_score': serializer.data,
            'ai_enhanced': True
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enhance_prepared_job_ai(request, packet_id):
    """
    Enhance prepared job packet with AI-generated content
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        prepared_job = get_object_or_404(
            PreparedJob, 
            id=packet_id, 
            user_profile=user_profile
        )
        
        # Enhance with AI
        enhanced_packet = enhance_prepared_job_with_ai(prepared_job)
        serializer = PreparedJobSerializer(enhanced_packet)
        
        return Response({
            'success': True,
            'prepared_job': serializer.data,
            'ai_enhanced': True
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ai_service_status(request):
    """
    Get AI service availability and configuration
    """
    try:
        return Response({
            'success': True,
            'ai_service': {
                'enabled': ai_service.ai_enabled,
                'openai_available': bool(ai_service.openai_client),
                'anthropic_available': bool(ai_service.anthropic_client),
                'features': {
                    'job_reasoning': True,
                    'resume_enhancement': ai_service.ai_enabled,
                    'cover_letter_generation': ai_service.ai_enabled,
                    'semantic_similarity': bool(ai_service.openai_client),
                    'application_strategy': ai_service.ai_enabled
                }
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================================================
# AUTOMATION ENDPOINTS
# =============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_automation(request):
    """
    Enable automated applications for user with preferences
    """
    try:
        preferences_data = {
            'automation_enabled': request.data.get('automation_enabled', True),
            'daily_application_limit': request.data.get('daily_application_limit', 10),
            'min_job_score_threshold': request.data.get('min_job_score_threshold', 60),
            'preferred_job_types': request.data.get('preferred_job_types', []),
            'preferred_locations': request.data.get('preferred_locations', []),
            'minimum_salary': request.data.get('minimum_salary'),
            'excluded_companies': request.data.get('excluded_companies', []),
            'apply_on_weekends': request.data.get('apply_on_weekends', False),
            'notify_before_applying': request.data.get('notify_before_applying', True)
        }
        
        result = enable_automation_for_user(request.user, preferences_data)
        
        return Response({
            'success': result['success'],
            'automation_enabled': result.get('preferences_updated', False),
            'schedule_result': result.get('schedule_result', {})
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_automation_dashboard(request):
    """
    Get comprehensive automation dashboard and pipeline status
    """
    try:
        dashboard_data = get_automation_dashboard(request.user)
        
        return Response({
            'success': True,
            'automation_dashboard': dashboard_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schedule_applications(request):
    """
    Schedule applications for user based on current preferences
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        preferences = get_object_or_404(UserPreferences, user_profile=user_profile)
        
        schedule_result = automation_manager.schedule_applications_for_user(
            request.user, preferences
        )
        
        return Response({
            'success': schedule_result['success'],
            'schedule_details': schedule_result
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_application_pipeline_status(request):
    """
    Get detailed application pipeline status
    """
    try:
        pipeline_status = automation_manager.get_application_pipeline_status(request.user)
        
        return Response({
            'success': True,
            'pipeline': pipeline_status
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================================================
# BULK OPERATIONS WITH AI ENHANCEMENT
# =============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_enhance_with_ai(request):
    """
    Bulk enhance job scores and packets with AI
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        enhance_scores = request.data.get('enhance_scores', True)
        enhance_packets = request.data.get('enhance_packets', True)
        limit = min(request.data.get('limit', 10), 50)  # Max 50 at once
        
        results = {
            'enhanced_scores': 0,
            'enhanced_packets': 0,
            'errors': []
        }
        
        if enhance_scores:
            # Enhance job scores without AI reasoning
            unenhanced_scores = JobScore.objects.filter(
                user_profile=user_profile,
                ai_reasoning__isnull=True
            )[:limit]
            
            for job_score in unenhanced_scores:
                try:
                    enhance_job_score_with_ai(job_score.job, user_profile, job_score)
                    results['enhanced_scores'] += 1
                except Exception as e:
                    results['errors'].append(f"Score {job_score.id}: {str(e)}")
        
        if enhance_packets:
            # Enhance prepared jobs without AI customization
            unenhanced_packets = PreparedJob.objects.filter(
                user_profile=user_profile,
                ai_customization_notes__isnull=True,
                packet_ready=True
            )[:limit]
            
            for packet in unenhanced_packets:
                try:
                    enhance_prepared_job_with_ai(packet)
                    results['enhanced_packets'] += 1
                except Exception as e:
                    results['errors'].append(f"Packet {packet.id}: {str(e)}")
        
        return Response({
            'success': True,
            'enhancement_results': results
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
