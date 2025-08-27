
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.http import HttpResponse
from django.utils import timezone
from .models import User, JobSeekerProfile, RecruiterProfile, CompanyProfile, CompanyRecruiterRelationship, Location, Skill, JobRole
from django.db.models import Q
from .serializers import (
    RegisterSerializer, LoginSerializer, 
    JobSeekerProfileSerializer, RecruiterProfileSerializer, CompanyProfileSerializer,
    JobSeekerOnboardingSerializer, LocationSerializer, SkillSerializer, JobRoleSerializer
)
from .utils.resume_ai import extract_text_from_resume, call_gemini_for_resume, merge_into_jobseeker_profile, compute_readiness

# Profile view for authenticated user
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
        }
        profile = None
        profile_complete = False
        
        if user.role == 'job_seeker':
            try:
                profile_obj = JobSeekerProfile.objects.get(user=user)
                profile = JobSeekerProfileSerializer(profile_obj).data
                profile_complete = profile_obj.is_complete
                # Update user data with profile info
                if profile_obj.first_name:
                    user_data['first_name'] = profile_obj.first_name
                if profile_obj.last_name:
                    user_data['last_name'] = profile_obj.last_name
                if profile_obj.email:
                    user_data['email'] = profile_obj.email
                # Create a display name for profile dropdown
                user_data['name'] = profile_obj.full_name or f"{user_data['first_name']} {user_data['last_name']}"
            except JobSeekerProfile.DoesNotExist:
                profile = None
                user_data['name'] = f"{user_data['first_name']} {user_data['last_name']}"
                
        elif user.role == 'recruiter':
            try:
                profile_obj = RecruiterProfile.objects.get(user=user)
                profile = RecruiterProfileSerializer(profile_obj).data
                profile_complete = profile_obj.is_complete
                # Update user data with profile info
                if profile_obj.first_name:
                    user_data['first_name'] = profile_obj.first_name
                if profile_obj.last_name:
                    user_data['last_name'] = profile_obj.last_name
                if profile_obj.email:
                    user_data['email'] = profile_obj.email
                user_data['name'] = profile_obj.full_name or f"{user_data['first_name']} {user_data['last_name']}"

                # Include current company details for recruiters
                current_company = None
                active_company_id = profile_obj.current_company_id
                # Fallback to first accepted relationship if no explicit current company
                if not active_company_id:
                    try:
                        rel = CompanyRecruiterRelationship.objects.filter(recruiter=profile_obj, status='accepted').order_by('responded_at').first()
                        if rel:
                            active_company_id = rel.company.id
                    except Exception:
                        active_company_id = None
                if active_company_id:
                    try:
                        comp = CompanyProfile.objects.get(id=active_company_id)
                        current_company = {
                            'id': comp.id,
                            'name': comp.company_name,
                            'industry': comp.industry,
                            'headquarters': comp.headquarters,
                            'website': comp.website,
                        }
                        # include logo url if present
                        if comp.logo_data or comp.logo_url:
                            current_company['logo_url'] = comp.logo_url or self.request.build_absolute_uri(f'/api/auth/files/company/{comp.id}/logo/')
                    except CompanyProfile.DoesNotExist:
                        current_company = None
                user_data['current_company'] = current_company
            except RecruiterProfile.DoesNotExist:
                profile = None
                user_data['name'] = f"{user_data['first_name']} {user_data['last_name']}"
                
        elif user.role == 'company':
            try:
                profile_obj = CompanyProfile.objects.get(user=user)
                profile = CompanyProfileSerializer(profile_obj).data
                profile_complete = profile_obj.is_complete
                user_data['name'] = profile_obj.company_name or f"{user_data['first_name']} {user_data['last_name']}"
            except CompanyProfile.DoesNotExist:
                profile = None
                user_data['name'] = f"{user_data['first_name']} {user_data['last_name']}"
        else:
            profile_complete = True  # Admins always considered complete
            user_data['name'] = f"{user_data['first_name']} {user_data['last_name']}"
            
        user_data['profile'] = profile
        user_data['profile_complete'] = profile_complete
        # Backward compatibility
        user_data['onboarding'] = profile
        user_data['onboarding_complete'] = profile_complete
        
        return Response(user_data)

    def put(self, request, *args, **kwargs):
        user = request.user
        data = request.data.copy()
        
        # Update user fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()
        
        # Update or create profile based on user role
        if user.role == 'job_seeker' and 'profile' in data:
            profile_data = data['profile']
            try:
                profile = JobSeekerProfile.objects.get(user=user)
                serializer = JobSeekerProfileSerializer(profile, data=profile_data, partial=True)
            except JobSeekerProfile.DoesNotExist:
                profile_data['user'] = user.id
                serializer = JobSeekerProfileSerializer(data=profile_data)
            
            if serializer.is_valid():
                serializer.save(user=user)
            else:
                raise ValidationError(serializer.errors)
                
        elif user.role == 'recruiter' and 'profile' in data:
            profile_data = data['profile']
            try:
                profile = RecruiterProfile.objects.get(user=user)
                serializer = RecruiterProfileSerializer(profile, data=profile_data, partial=True)
            except RecruiterProfile.DoesNotExist:
                profile_data['user'] = user.id
                serializer = RecruiterProfileSerializer(data=profile_data)
            
            if serializer.is_valid():
                serializer.save(user=user)
            else:
                raise ValidationError(serializer.errors)
                
        elif user.role == 'company' and 'profile' in data:
            profile_data = data['profile']
            try:
                profile = CompanyProfile.objects.get(user=user)
                serializer = CompanyProfileSerializer(profile, data=profile_data, partial=True)
            except CompanyProfile.DoesNotExist:
                profile_data['user'] = user.id
                serializer = CompanyProfileSerializer(data=profile_data)
            
            if serializer.is_valid():
                serializer.save(user=user)
            else:
                raise ValidationError(serializer.errors)
        
        return self.get(request, *args, **kwargs)
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.http import JsonResponse
import io
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import os
import base64
from datetime import timedelta
from urllib.parse import urlencode
from django.conf import settings
from django.shortcuts import redirect
import json as pyjson
import time
import requests
from .models import OAuthToken, Industry, SalaryBand


class FileServeView(APIView):
    """Serve files stored in database as binary data with JWT in header or query param"""
    permission_classes = [AllowAny]

    def _get_user_from_request(self, request):
        """Extract and validate JWT from Authorization header or ?token= query param."""
        from rest_framework_simplejwt.tokens import AccessToken, TokenError
        auth = request.META.get('HTTP_AUTHORIZATION', '')
        token_str = None
        if auth.startswith('Bearer '):
            token_str = auth.split(' ', 1)[1].strip()
        if not token_str:
            token_str = request.GET.get('token')
        if not token_str:
            return None
        try:
            at = AccessToken(token_str)
            user_id = at.get('user_id')
            if not user_id:
                return None
            return User.objects.filter(id=user_id).first()
        except TokenError:
            return None

    def get(self, request, model_type, profile_id, file_type):
        # Authenticate via header or query param
        user = self._get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        try:
            if model_type == 'jobseeker':
                profile = JobSeekerProfile.objects.get(id=profile_id, user=user)
                
                if file_type == 'profile_image':
                    file_data = profile.profile_image_data
                    filename = profile.profile_image_filename
                    content_type = profile.profile_image_content_type
                elif file_type == 'resume':
                    file_data = profile.resume_data
                    filename = profile.resume_filename
                    content_type = profile.resume_content_type
                elif file_type == 'cover_letter':
                    file_data = profile.cover_letter_data
                    filename = profile.cover_letter_filename
                    content_type = profile.cover_letter_content_type
                elif file_type == 'portfolio':
                    file_data = profile.portfolio_pdf_data
                    filename = profile.portfolio_pdf_filename
                    content_type = profile.portfolio_pdf_content_type
                else:
                    return Response({'error': 'Invalid file type'}, status=404)
                    
            elif model_type == 'recruiter':
                profile = RecruiterProfile.objects.get(id=profile_id, user=user)
                
                if file_type == 'profile_image':
                    file_data = profile.profile_image_data
                    filename = profile.profile_image_filename
                    content_type = profile.profile_image_content_type
                elif file_type == 'resume':
                    file_data = profile.resume_data
                    filename = profile.resume_filename
                    content_type = profile.resume_content_type
                else:
                    return Response({'error': 'Invalid file type'}, status=404)
                    
            elif model_type == 'company':
                profile = CompanyProfile.objects.get(id=profile_id, user=user)
                
                if file_type == 'logo':
                    file_data = profile.logo_data
                    filename = profile.logo_filename
                    content_type = profile.logo_content_type
                elif file_type == 'brochure':
                    file_data = profile.company_brochure_data
                    filename = profile.company_brochure_filename
                    content_type = profile.company_brochure_content_type
                else:
                    return Response({'error': 'Invalid file type'}, status=404)
            else:
                return Response({'error': 'Invalid model type'}, status=404)
                
            if not file_data:
                return Response({'error': 'File not found'}, status=404)
                
            response = HttpResponse(file_data, content_type=content_type or 'application/octet-stream')
            # honor ?download=1 or ?dl=1 to force attachment download
            force_download = request.GET.get('download') in ('1', 'true', 'True') or request.GET.get('dl') in ('1', 'true', 'True')
            if filename:
                disposition = 'attachment' if force_download else 'inline'
                response['Content-Disposition'] = f'{disposition}; filename="{filename}"'
            return response
            
        except (JobSeekerProfile.DoesNotExist, RecruiterProfile.DoesNotExist, CompanyProfile.DoesNotExist):
            return Response({'error': 'Profile not found'}, status=404)
        except Exception as e:
            return Response({'error': f'Error serving file: {str(e)}'}, status=500)


class FileUploadView(APIView):
    """Handle file uploads for profiles"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        logger = __import__('logging').getLogger(__name__)
        
        # Check if user is AnonymousUser
        from django.contrib.auth.models import AnonymousUser
        if isinstance(request.user, AnonymousUser):
            return Response({'error': 'Authentication required', 'detail': 'JWT token invalid or expired'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = request.FILES['file']
        file_type = request.POST.get('type', 'resume')  # resume, cover_letter, portfolio, logo, brochure
        
        # Validate file size (10MB limit)
        if uploaded_file.size > 10 * 1024 * 1024:
            return Response({'error': 'File size exceeds 10MB limit'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type based on upload type
        allowed_extensions = {
            'resume': ['.pdf', '.doc', '.docx'],
            'cover_letter': ['.pdf', '.doc', '.docx'],
            'portfolio': ['.pdf'],
            'profile_image': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
            'logo': ['.jpg', '.jpeg', '.png', '.gif'],
            'brochure': ['.pdf']
        }

        file_extension = os.path.splitext(uploaded_file.name)[1].lower()

        if file_extension not in allowed_extensions.get(file_type, []):
            return Response({
                'error': f'Invalid file type. Allowed types for {file_type}: {", ".join(allowed_extensions.get(file_type, []))}'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read file data
            file_data = uploaded_file.read()

            # Basic file integrity validation for document uploads
            def _invalid_response(msg: str):
                return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)

            if file_type in ('resume', 'cover_letter', 'portfolio'):
                if file_extension == '.pdf':
                    # PDF files start with %PDF-
                    if not file_data.startswith(b'%PDF-'):
                        return _invalid_response('Invalid PDF file. Please upload a valid PDF resume.')
                elif file_extension == '.docx':
                    # DOCX are zip archives (PK header) and should be readable by python-docx
                    if not file_data.startswith(b'PK'):
                        return _invalid_response('Invalid DOCX file. Please upload a valid .docx resume.')
                    try:
                        from docx import Document
                        Document(io.BytesIO(file_data))
                    except Exception:
                        return _invalid_response('Corrupted DOCX file. Please re-export your resume as .docx or PDF and try again.')
                elif file_extension == '.doc':
                    # Legacy DOC (OLE) header signature, but many browsers/apps upload with generic msword type without OLE header.
                    # Accept if it has a valid OLE header OR if the reported content-type is application/msword.
                    if not (file_data.startswith(b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1') or (uploaded_file.content_type or '').lower() == 'application/msword'):
                        return _invalid_response('Invalid DOC file. Please upload a valid .doc resume or convert to PDF/DOCX.')
            
            # Get or create the user's profile
            if request.user.role == 'job_seeker':
                # Be robust against accidental duplicates
                profile = JobSeekerProfile.objects.filter(user=request.user).order_by('-id').first()
                if not profile:
                    profile = JobSeekerProfile.objects.create(user=request.user)
                
                # Save file data to appropriate field
                if file_type == 'resume':
                    profile.resume_data = file_data
                    profile.resume_filename = uploaded_file.name
                    profile.resume_content_type = uploaded_file.content_type
                    profile.resume_size = uploaded_file.size
                elif file_type == 'cover_letter':
                    profile.cover_letter_data = file_data
                    profile.cover_letter_filename = uploaded_file.name
                    profile.cover_letter_content_type = uploaded_file.content_type
                    profile.cover_letter_size = uploaded_file.size
                elif file_type == 'portfolio':
                    profile.portfolio_pdf_data = file_data
                    profile.portfolio_pdf_filename = uploaded_file.name
                    profile.portfolio_pdf_content_type = uploaded_file.content_type
                    profile.portfolio_pdf_size = uploaded_file.size
                elif file_type == 'profile_image':
                    profile.profile_image_data = file_data
                    profile.profile_image_filename = uploaded_file.name
                    profile.profile_image_content_type = uploaded_file.content_type
                    profile.profile_image_size = uploaded_file.size
                
                profile.save()
                
                # Generate file URL for serving from database and persist URL field
                if file_type == 'resume' and profile.resume_data:
                    file_url = request.build_absolute_uri(f'/api/auth/files/jobseeker/{profile.id}/resume/')
                    profile.resume_url = file_url
                elif file_type == 'cover_letter' and profile.cover_letter_data:
                    file_url = request.build_absolute_uri(f'/api/auth/files/jobseeker/{profile.id}/cover_letter/')
                    profile.cover_letter_url = file_url
                elif file_type == 'portfolio' and profile.portfolio_pdf_data:
                    file_url = request.build_absolute_uri(f'/api/auth/files/jobseeker/{profile.id}/portfolio/')
                    profile.portfolio_pdf_url = file_url
                elif file_type == 'profile_image' and profile.profile_image_data:
                    file_url = request.build_absolute_uri(f'/api/auth/files/jobseeker/{profile.id}/profile_image/')
                    profile.profile_image_url = file_url
                else:
                    file_url = None
                if file_url:
                    profile.save(update_fields=['updated_at',
                                                'resume_url' if file_type == 'resume' else
                                                'cover_letter_url' if file_type == 'cover_letter' else
                                                'portfolio_pdf_url' if file_type == 'portfolio' else
                                                'profile_image_url' if file_type == 'profile_image' else 'updated_at'])
                    
            elif request.user.role == 'recruiter':
                profile = RecruiterProfile.objects.filter(user=request.user).order_by('-id').first()
                if not profile:
                    profile = RecruiterProfile.objects.create(user=request.user)
                
                if file_type == 'profile_image':
                    profile.profile_image_data = file_data
                    profile.profile_image_filename = uploaded_file.name
                    profile.profile_image_content_type = uploaded_file.content_type
                    profile.profile_image_size = uploaded_file.size
                elif file_type == 'resume':
                    profile.resume_data = file_data
                    profile.resume_filename = uploaded_file.name
                    profile.resume_content_type = uploaded_file.content_type
                    profile.resume_size = uploaded_file.size
                
                profile.save()
                
                # Generate file URL for serving from database and persist URL field
                if file_type == 'profile_image' and profile.profile_image_data:
                    file_url = request.build_absolute_uri(f'/api/auth/files/recruiter/{profile.id}/profile_image/')
                    profile.profile_image_url = file_url
                elif file_type == 'resume' and profile.resume_data:
                    file_url = request.build_absolute_uri(f'/api/auth/files/recruiter/{profile.id}/resume/')
                    profile.resume_url = file_url
                else:
                    file_url = None
                if file_url:
                    profile.save(update_fields=['updated_at',
                                                'profile_image_url' if file_type == 'profile_image' else
                                                'resume_url' if file_type == 'resume' else 'updated_at'])
                    
            elif request.user.role == 'company':
                profile = CompanyProfile.objects.filter(user=request.user).order_by('-id').first()
                if not profile:
                    profile = CompanyProfile.objects.create(user=request.user)
                
                if file_type == 'logo':
                    profile.logo_data = file_data
                    profile.logo_filename = uploaded_file.name
                    profile.logo_content_type = uploaded_file.content_type
                    profile.logo_size = uploaded_file.size
                elif file_type == 'brochure':
                    profile.company_brochure_data = file_data
                    profile.company_brochure_filename = uploaded_file.name
                    profile.company_brochure_content_type = uploaded_file.content_type
                    profile.company_brochure_size = uploaded_file.size
                
                profile.save()
                
                # Generate file URL for serving from database and persist URL field
                if file_type == 'logo' and profile.logo_data:
                    file_url = request.build_absolute_uri(f'/api/auth/files/company/{profile.id}/logo/')
                    profile.logo_url = file_url
                elif file_type == 'brochure' and profile.company_brochure_data:
                    file_url = request.build_absolute_uri(f'/api/auth/files/company/{profile.id}/brochure/')
                    profile.company_brochure_url = file_url
                else:
                    file_url = None
                if file_url:
                    profile.save(update_fields=['updated_at',
                                                'logo_url' if file_type == 'logo' else
                                                'company_brochure_url' if file_type == 'brochure' else 'updated_at'])
            else:
                return Response({'error': 'Invalid user role'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'filename': uploaded_file.name,
                'size': uploaded_file.size,
                'url': file_url,
                'type': uploaded_file.content_type,
                'uploaded_at': profile.updated_at.isoformat() if hasattr(profile, 'updated_at') else None
            })
            
        except Exception as e:
            import traceback
            logger.error('FILE UPLOAD ERROR: %s\n%s', str(e), traceback.format_exc())
            return Response({'error': f'Upload failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResumeParseView(APIView):
    """Parse the latest uploaded resume and extract details via Gemini.

    - For job_seekers: reads resume binary from profile, extracts text, calls Gemini,
      and updates missing fields + suited_job_roles. Returns parsed data and changes applied.
    - For recruiters: similar behavior but only parses and returns; no profile field updates except skills/bio if desired (v1: return only).
    """
    permission_classes = [IsAuthenticated]

    @staticmethod
    def _clear_resume_fields(profile):
        try:
            fields = ['resume_data', 'resume_filename', 'resume_content_type', 'resume_size', 'resume_url']
            for f in fields:
                setattr(profile, f, None if f in ('resume_data', 'resume_size') else '')
            profile.save(update_fields=fields + ['updated_at'])
        except Exception:
            # Best-effort cleanup; ignore if model differs
            pass

    def post(self, request, *args, **kwargs):
        user = request.user
        role = getattr(user, 'role', None)
        try:
            if role == 'job_seeker':
                profile = JobSeekerProfile.objects.filter(user=user).order_by('-id').first()
                if not profile or not profile.resume_data:
                    return Response({'error': 'No resume found on profile'}, status=404)
                text = extract_text_from_resume(profile.resume_content_type or '', profile.resume_filename or '', profile.resume_data)
                # For backward compatibility we still use extract_text_from_resume here to check emptiness.
                if not text.strip():
                    self._clear_resume_fields(profile)
                    return Response({'error': 'Uploaded file is empty or unsupported. Please upload a valid resume (PDF/DOC/DOCX).', 'readiness': {'score': 0, 'checklist': {}}}, status=400)
                # Use new extractor that also returns detected links (annotations, hyperlinks)
                try:
                    from .utils.resume_ai import extract_text_and_links_from_resume
                    text, detected_links = extract_text_and_links_from_resume(profile.resume_content_type or '', profile.resume_filename or '', profile.resume_data)
                except Exception:
                    detected_links = []
                if not (text or '').strip():
                    self._clear_resume_fields(profile)
                    return Response({'error': 'Uploaded file is empty or unsupported. Please upload a valid resume (PDF/DOC/DOCX).', 'readiness': {'score': 0, 'checklist': {}}}, status=400)
                ai = call_gemini_for_resume(text)
                if not ai:
                    return Response({'parsed': None, 'message': 'AI extraction unavailable or failed'}, status=200)
                    # Normalize suited_roles / preferred_roles in AI output to handle model variance
                    try:
                        import json as _json, re as _re
                        if isinstance(ai, dict):
                            # Helper to coerce possible stringified JSON or comma-separated lists into Python lists
                            def _coerce_list(key):
                                val = ai.get(key)
                                if val is None:
                                    ai[key] = []
                                    return
                                # If it's a JSON string, try to parse
                                if isinstance(val, str):
                                    s = val.strip()
                                    try:
                                        parsed = _json.loads(s)
                                        ai[key] = parsed if parsed is not None else []
                                        return
                                    except Exception:
                                        # Fallback: split on commas/newlines/semicolons
                                        parts = [p.strip() for p in _re.split(r"[,\n;]+", s) if p.strip()]
                                        ai[key] = parts
                                        return
                                # If it's a dict (single object), wrap
                                if isinstance(val, dict):
                                    ai[key] = [val]
                                    return
                                # If it's a list, leave as-is
                                if isinstance(val, list):
                                    ai[key] = val
                                    return
                                # Otherwise, coerce to empty
                                ai[key] = []

                            _coerce_list('suited_roles')
                            _coerce_list('preferred_roles')

                            # Normalize suited_roles items: strings -> {role, match_percent: None}
                            norm_suited = []
                            for item in ai.get('suited_roles') or []:
                                if isinstance(item, str):
                                    role = item.strip()
                                    if role:
                                        norm_suited.append({'role': role, 'match_percent': None})
                                elif isinstance(item, dict):
                                    role = item.get('role') or item.get('name') or ''
                                    mp = item.get('match_percent') if 'match_percent' in item else item.get('percent') if isinstance(item.get('percent', None), (int, float)) else item.get('score')
                                    try:
                                        mp = float(mp) if mp is not None else None
                                    except Exception:
                                        mp = None
                                    if role:
                                        norm_suited.append({'role': role.strip(), 'match_percent': mp})
                            ai['suited_roles'] = norm_suited

                            # Ensure preferred_roles is list[str]
                            pref = ai.get('preferred_roles') or []
                            if isinstance(pref, list):
                                ai['preferred_roles'] = [str(p).strip() for p in pref if p]
                            elif isinstance(pref, str):
                                try:
                                    ai['preferred_roles'] = _json.loads(pref)
                                except Exception:
                                    ai['preferred_roles'] = [p.strip() for p in _re.split(r"[,\n;]+", pref) if p.strip()]
                            else:
                                ai['preferred_roles'] = []

                            # Log normalized values for debugging
                            try:
                                logger.debug(f"ResumeParseView: normalized suited_roles={ai.get('suited_roles')} preferred_roles={ai.get('preferred_roles')}")
                            except Exception:
                                pass
                    except Exception:
                        logger.exception('Error normalizing AI suited/preferred roles')
                # Merge any detected links into AI output (ensure unique)
                try:
                    if isinstance(ai, dict):
                        ai_links = ai.get('links') or []
                        # normalize strings
                        norm = list({*(ai_links or []), *(detected_links or [])})
                        ai['links'] = norm
                        # Heuristic: extract projects from text and merge into ai['projects'] when available
                        try:
                            from .utils.resume_ai import _heuristic_extract_projects_from_text
                            detected_projects = _heuristic_extract_projects_from_text(text)
                            ai_projects = ai.get('projects') or []
                            # prefer AI projects but append heuristic ones not already present by title
                            titles = {p.get('title', '').strip().lower() for p in ai_projects if isinstance(p, dict) and p.get('title')}
                            merged = list(ai_projects)
                            for p in detected_projects:
                                if p.get('title') and p.get('title').strip().lower() not in titles:
                                    merged.append(p)
                            ai['projects'] = merged
                        except Exception:
                            pass
                except Exception:
                    pass
                # Validate resume nature
                is_resume = ai.get('is_resume') if isinstance(ai, dict) else None
                if is_resume is False:
                    readiness = compute_readiness(ai, is_resume=False)
                    self._clear_resume_fields(profile)
                    return Response({'error': 'Please upload a valid resume file', 'readiness': readiness, 'parsed': None}, status=400)
                changes, suited = merge_into_jobseeker_profile(profile, ai, force=True)
                readiness = compute_readiness(ai, is_resume=True)
                # Apply non-destructive updates
                applied_fields = []
                if changes:
                    for k, v in changes.items():
                        setattr(profile, k, v)
                        applied_fields.append(k)
                # Note: suited job roles are stored only in `suited_job_roles_detailed` (list of {role, match_percent}).
                # `merge_into_jobseeker_profile` will have already prepared `suited_job_roles_detailed` in `changes` when applicable.
                # No legacy `suited_job_roles` field is written; consumers should derive names from the detailed field.
                if applied_fields:
                    profile.save(update_fields=list(set(applied_fields + ['updated_at'])))
                return Response({
                    'parsed': ai,
                    'applied_fields': applied_fields,
                    'readiness': readiness,
                })
            elif role == 'recruiter':
                profile = RecruiterProfile.objects.filter(user=user).order_by('-id').first()
                if not profile or not profile.resume_data:
                    return Response({'error': 'No resume found on profile'}, status=404)
                # Use new extractor for text+links
                try:
                    from .utils.resume_ai import extract_text_and_links_from_resume
                    text, detected_links = extract_text_and_links_from_resume(profile.resume_content_type or '', profile.resume_filename or '', profile.resume_data)
                except Exception:
                    text = ''
                    detected_links = []
                if not (text or '').strip():
                    self._clear_resume_fields(profile)
                    return Response({'error': 'Uploaded file is empty or unsupported. Please upload a valid resume (PDF/DOC/DOCX).', 'readiness': {'score': 0, 'checklist': {}}}, status=400)
                ai = call_gemini_for_resume(text)
                if not ai:
                    return Response({'parsed': None, 'message': 'AI extraction unavailable or failed'}, status=200)
                # Merge detected links into AI response
                try:
                    if isinstance(ai, dict):
                        ai_links = ai.get('links') or []
                        ai['links'] = list({*(ai_links or []), *(detected_links or [])})
                        # Heuristic: extract projects from text and merge into ai['projects']
                        try:
                            from .utils.resume_ai import _heuristic_extract_projects_from_text
                            detected_projects = _heuristic_extract_projects_from_text(text)
                            ai_projects = ai.get('projects') or []
                            titles = {p.get('title', '').strip().lower() for p in ai_projects if isinstance(p, dict) and p.get('title')}
                            merged = list(ai_projects)
                            for p in detected_projects:
                                if p.get('title') and p.get('title').strip().lower() not in titles:
                                    merged.append(p)
                            ai['projects'] = merged
                        except Exception:
                            pass
                except Exception:
                    pass
                is_resume = ai.get('is_resume') if isinstance(ai, dict) else None
                readiness = compute_readiness(ai, is_resume=bool(is_resume))
                if is_resume is False:
                    self._clear_resume_fields(profile)
                    return Response({'error': 'Please upload a valid resume file', 'readiness': readiness, 'parsed': None}, status=400)
                return Response({'parsed': ai, 'readiness': readiness})
            else:
                return Response({'error': 'Unsupported role for resume parsing'}, status=400)
        except Exception as e:
            import traceback
            logger = __import__('logging').getLogger(__name__)
            logger.error(f"ResumeParseView failed: {e}\n{traceback.format_exc()}")
            return Response({'error': f'Parsing failed: {str(e)}'}, status=500)


# ==========================
# Google OAuth 2.0 Endpoints
# ==========================

GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
GOOGLE_SCOPES = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.readonly']


def _google_client_config():
    client_id = os.getenv('GOOGLE_OAUTH_CLIENT_ID', '')
    client_secret = os.getenv('GOOGLE_OAUTH_CLIENT_SECRET', '')
    redirect_uri = os.getenv('GOOGLE_OAUTH_REDIRECT_URI', '') or settings.ALLOWED_HOSTS[0].rstrip('/') if getattr(settings, 'ALLOWED_HOSTS', []) else ''
    # Ensure fully-qualified redirect and prefer frontend callback path
    if redirect_uri and not redirect_uri.startswith('http'):
        redirect_uri = f"https://{redirect_uri}/oauth/google/callback"
    elif not redirect_uri:
        # Local dev default to Vite dev server callback route
        redirect_uri = "http://localhost:5173/oauth/google/callback"
    return client_id, client_secret, redirect_uri


class GoogleAuthInitView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client_id, _, redirect_uri = _google_client_config()
        state = base64.urlsafe_b64encode(os.urandom(24)).decode('utf-8')
        request.session['google_oauth_state'] = state
        # Optional: remember where to return to
        next_url = request.GET.get('next', '/job-applications')
        request.session['google_oauth_next'] = next_url
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': ' '.join(GOOGLE_SCOPES),
            'access_type': 'offline',
            'include_granted_scopes': 'true',
            'state': state,
            'prompt': 'consent',  # force refresh_token on subsequent connects
        }
        url = f"{GOOGLE_AUTH_BASE}?{urlencode(params)}"
        return Response({'authorize_url': url})


class GoogleAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # This endpoint can be hit by the browser without auth; retrieve the user via a short-lived JWT optional
        code = request.GET.get('code')
        state = request.GET.get('state')
        if not code:
            return Response({'error': 'Missing code'}, status=400)
        # Validate state if present in session
        try:
            if 'google_oauth_state' in request.session and state != request.session.get('google_oauth_state'):
                return Response({'error': 'Invalid state parameter'}, status=400)
        except Exception:
            pass

        client_id, client_secret, redirect_uri = _google_client_config()
        data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
        }
        try:
            token_res = requests.post(GOOGLE_TOKEN_URL, data=data, timeout=15)
            token_res.raise_for_status()
            tokens = token_res.json()
        except Exception as e:
            return Response({'error': f'Google token exchange failed: {str(e)}'}, status=400)

        id_token = tokens.get('id_token')
        access_token = tokens.get('access_token')
        refresh_token = tokens.get('refresh_token')
        expires_in = tokens.get('expires_in') or 0

        # Fetch userinfo for email/sub
        try:
            ui = requests.get(GOOGLE_USERINFO_URL, headers={'Authorization': f'Bearer {access_token}'}, timeout=10)
            ui.raise_for_status()
            userinfo = ui.json()
        except Exception:
            userinfo = {}

        email = userinfo.get('email')
        sub = userinfo.get('sub')
        scope = tokens.get('scope', ' '.join(GOOGLE_SCOPES))
        token_type = tokens.get('token_type', 'Bearer')
        expires_at = timezone.now() + timedelta(seconds=int(expires_in)) if expires_in else None

        # Determine the authenticated user: if session has user, use it; else reject for now
        if not request.user.is_authenticated:
            return Response({'error': 'User not authenticated in session'}, status=401)

        # Upsert OAuthToken
        oauth, _ = OAuthToken.objects.get_or_create(user=request.user, provider='google')
        oauth.sub = sub or oauth.sub
        oauth.scope = scope
        oauth.token_type = token_type
        oauth.expires_at = expires_at
        if access_token:
            oauth.access_token = access_token
        if refresh_token:
            oauth.refresh_token = refresh_token
        oauth.save()

        # Optional: mark email_confirmed on latest application if we want immediate UX feedback is separate flow
        return Response({
            'success': True,
            'email': email,
            'scopes': scope.split(),
            'has_refresh_token': bool(refresh_token),
        })


class GoogleDisconnectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        OAuthToken.objects.filter(user=request.user, provider='google').delete()
        return Response({'success': True})


class GoogleAuthStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            token = OAuthToken.objects.filter(user=request.user, provider='google').first()
            if not token:
                return Response({
                    'connected': False,
                })
            return Response({
                'connected': True,
                'scopes': token.scope.split() if token.scope else [],
                'expires_at': token.expires_at.isoformat() if token.expires_at else None,
                'has_refresh_token': bool(token.refresh_token_encrypted),
            })
        except Exception as e:
            return Response({'connected': False, 'error': str(e)}, status=200)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    # Explicitly allow unauthenticated access and bypass JWT auth parsing
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Issue JWT tokens upon successful registration
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    # Explicitly allow unauthenticated access and bypass JWT auth parsing
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        remember_me = serializer.validated_data.get('rememberMe', True)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Email not registered
            raise ValidationError({'email': ['No account found with this email.']})
        user = authenticate(username=user.username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            # If remember_me is False, shorten token lifetimes for this response only.
            if not remember_me:
                try:
                    from datetime import timedelta
                    # Override lifetime on the token instances (does not affect global settings)
                    refresh.set_exp(lifetime=timedelta(days=1))  # 1 day refresh
                    access = refresh.access_token
                    access.set_exp(lifetime=timedelta(minutes=30))  # 30 minutes access
                except Exception:
                    # Fallback to defaults if anything goes wrong
                    access = refresh.access_token
            else:
                access = refresh.access_token

            return Response({
                'refresh': str(refresh),
                'access': str(access),
                'role': user.role,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            })
        # Incorrect password
        raise ValidationError({'password': ['Incorrect password.']})


class JobSeekerProfileView(generics.RetrieveUpdateAPIView):
    """Main view for Job Seeker Profile operations"""
    serializer_class = JobSeekerProfileSerializer
    permission_classes = [IsAuthenticated]
    queryset = JobSeekerProfile.objects.all()

    def get_object(self):
        profile, created = JobSeekerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            # Try to get existing profile data
            profile = JobSeekerProfile.objects.get(user=user)
            serializer = self.get_serializer(profile)
            data = serializer.data
            
            # Add file URLs to the response
            if profile.resume_data:
                data['resume'] = {
                    'name': profile.resume_filename or 'resume',
                    'url': request.build_absolute_uri(f'/api/auth/files/jobseeker/{profile.id}/resume/'),
                    'size': profile.resume_size or 0,
                    'uploaded_at': profile.updated_at.isoformat()
                }
            
            if profile.profile_image_data:
                data['profile_image'] = {
                    'name': profile.profile_image_filename or 'profile_image',
                    'url': request.build_absolute_uri(f'/api/auth/files/jobseeker/{profile.id}/profile_image/'),
                    'size': profile.profile_image_size or 0,
                    'uploaded_at': profile.updated_at.isoformat()
                }
            elif profile.profile_image_url:
                data['profile_image'] = {
                    'url': profile.profile_image_url,
                    'uploaded_at': profile.updated_at.isoformat()
                }
            
            return Response(data)
        except JobSeekerProfile.DoesNotExist:
            # Pre-populate with user data from User table
            initial_data = {
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
                'email': user.email or '',
            }
            return Response(initial_data)

    def post(self, request, *args, **kwargs):
        print(f"=== JOBSEEKER ONBOARDING DEBUG ===")
        print(f"Request data: {request.data}")
        print(f"Request FILES: {request.FILES}")
        print(f"User: {request.user}")
        
        user = request.user
        data = request.data.copy()
        
        # Pre-populate with user data if not provided
        if not data.get('first_name') and user.first_name:
            data['first_name'] = user.first_name
        if not data.get('last_name') and user.last_name:
            data['last_name'] = user.last_name
        if not data.get('email') and user.email:
            data['email'] = user.email
            
    # Handle empty string date fields - convert to None for Django DateField (we'll prune None later)
        date_fields = ['availability_date']
        for field in date_fields:
            if field in data and data[field] == '':
                data[field] = None
                print(f"Converted empty string to None for date field: {field}")
        
    # Handle empty string decimal fields - convert to None for Django DecimalField (we'll prune None later)
        decimal_fields = ['salary_min', 'salary_max']
        for field in decimal_fields:
            if field in data and data[field] == '':
                data[field] = None
                print(f"Converted empty string to None for decimal field: {field}")

        # Default salary currency to INR if not provided (frontend displays INR)
        if not data.get('salary_currency'):
            data['salary_currency'] = 'INR'
            print("Set default salary_currency to INR")
        
        # Handle profile_image field - if it's a URL from file upload, store it in profile_image_url
        if 'profile_image' in data and data['profile_image']:
            if data['profile_image'].startswith('http'):
                # This is an uploaded file URL, store in profile_image_url field
                data['profile_image_url'] = data['profile_image']
                print(f"Set profile_image_url to: {data['profile_image_url']}")
            elif data['profile_image'].startswith('blob:'):
                # This is a blob URL, ignore it since the actual file should be uploaded separately
                print(f"Ignoring blob URL: {data['profile_image']}")
            # Remove the profile_image field since it's not a model field
            del data['profile_image']
        
        # Normalize skills structure: accept ["JS", "React"] or [{name, proficiency, category}]
        # Ensure stored items are objects with name + proficiency (beginner|intermediate|advanced|expert)
        if 'skills' in data and data['skills'] is not None:
            try:
                import json
                raw_skills = data['skills']
                # Request data may arrive as JSON string; parse if needed
                if isinstance(raw_skills, str):
                    raw_skills = json.loads(raw_skills)
                normalized_skills = []
                allowed = {'beginner', 'intermediate', 'advanced', 'expert'}
                if isinstance(raw_skills, list):
                    for s in raw_skills:
                        if isinstance(s, str):
                            normalized_skills.append({'name': s, 'proficiency': 'intermediate'})
                        elif isinstance(s, dict):
                            name = s.get('name') or s.get('skill') or ''
                            if not name:
                                continue
                            prof = (s.get('proficiency') or s.get('level') or 'intermediate').lower()
                            if prof not in allowed:
                                prof = 'intermediate'
                            entry = {'name': name, 'proficiency': prof}
                            if s.get('category'):
                                entry['category'] = s['category']
                            normalized_skills.append(entry)
                data['skills'] = normalized_skills
            except Exception as e:
                # If normalization fails, keep original
                print(f"Skills normalization skipped due to error: {e}")

        # Map frontend alias fields to model fields and normalize list-like inputs
        try:
            import json
            # company_size -> company_size_preference
            if 'company_size' in data and data['company_size'] != '':
                data['company_size_preference'] = data['company_size']
                del data['company_size']
                print("Mapped company_size to company_size_preference")

            # benefits (array/string/JSON) -> benefits_preferences (array)
            if 'benefits' in data:
                raw_benefits = data['benefits']
                benefits_list = []
                if isinstance(raw_benefits, str):
                    try:
                        parsed = json.loads(raw_benefits)
                        if isinstance(parsed, list):
                            benefits_list = parsed
                        elif isinstance(parsed, str):
                            benefits_list = [parsed]
                        else:
                            benefits_list = []
                    except Exception:
                        benefits_list = [raw_benefits]
                elif isinstance(raw_benefits, list):
                    benefits_list = raw_benefits
                if benefits_list is not None:
                    data['benefits_preferences'] = benefits_list
                del data['benefits']
                print("Mapped benefits to benefits_preferences")

            # preferred_locations might arrive as JSON string
            if 'preferred_locations' in data and isinstance(data['preferred_locations'], str):
                try:
                    parsed_pref = json.loads(data['preferred_locations'])
                    if isinstance(parsed_pref, list):
                        data['preferred_locations'] = parsed_pref
                        print("Parsed preferred_locations JSON string to list")
                except Exception:
                    pass

            # job_types might arrive as JSON string
            if 'job_types' in data and isinstance(data['job_types'], str):
                try:
                    parsed_types = json.loads(data['job_types'])
                    if isinstance(parsed_types, list):
                        data['job_types'] = parsed_types
                        print("Parsed job_types JSON string to list")
                except Exception:
                    pass

            # industries might arrive as JSON string
            if 'industries' in data and isinstance(data['industries'], str):
                try:
                    parsed_ind = json.loads(data['industries'])
                    if isinstance(parsed_ind, list):
                        data['industries'] = parsed_ind
                        print("Parsed industries JSON string to list")
                except Exception:
                    pass

            # work_arrangements might arrive as JSON string; also support legacy single field
            if 'work_arrangements' in data and isinstance(data['work_arrangements'], str):
                try:
                    parsed_wa = json.loads(data['work_arrangements'])
                    if isinstance(parsed_wa, list):
                        data['work_arrangements'] = parsed_wa
                        print("Parsed work_arrangements JSON string to list")
                except Exception:
                    # if it's a plain string like 'remote', wrap in list
                    if data['work_arrangements']:
                        data['work_arrangements'] = [data['work_arrangements']]

            # If only legacy work_arrangement provided and no list, derive list from it
            if ('work_arrangements' not in data or not data['work_arrangements']) and data.get('work_arrangement'):
                data['work_arrangements'] = [data['work_arrangement']]
                print("Derived work_arrangements from legacy work_arrangement")

            # desired roles / preferred roles mapping and parsing
            if 'desired_roles' in data and data['desired_roles'] not in (None, ''):
                raw = data['desired_roles']
                if isinstance(raw, str):
                    try:
                        parsed = json.loads(raw)
                        if isinstance(parsed, list):
                            data['preferred_roles'] = parsed
                        elif isinstance(parsed, str):
                            data['preferred_roles'] = [parsed]
                    except Exception:
                        data['preferred_roles'] = [raw]
                elif isinstance(raw, list):
                    data['preferred_roles'] = raw
                del data['desired_roles']
                print("Mapped desired_roles to preferred_roles")

            if 'preferred_roles' in data and isinstance(data['preferred_roles'], str):
                try:
                    parsed_roles = json.loads(data['preferred_roles'])
                    if isinstance(parsed_roles, list):
                        data['preferred_roles'] = parsed_roles
                        print("Parsed preferred_roles JSON string to list")
                except Exception:
                    pass
        except Exception as e:
            print(f"Alias field normalization skipped due to error: {e}")
            
        # Prune empty/blank values to avoid overwriting existing resume-derived data
        def _prune_empty(d):
            keys_to_delete = []
            for k, v in d.items():
                # Keep valid falsy values like False and numeric 0
                if v is False or v == 0:
                    continue
                if v is None:
                    keys_to_delete.append(k)
                elif isinstance(v, str):
                    if v.strip() == '' or v.strip().lower() in ('null', 'undefined'):
                        keys_to_delete.append(k)
                elif isinstance(v, (list, tuple)) and len(v) == 0:
                    keys_to_delete.append(k)
                elif isinstance(v, dict) and len(v.keys()) == 0:
                    keys_to_delete.append(k)
            for k in keys_to_delete:
                d.pop(k, None)

        # Additional guard: drop explicitly empty arrays for known list fields
        for list_field in ['skills', 'preferred_roles', 'benefits_preferences', 'work_arrangements', 'industries', 'job_types', 'preferred_locations', 'education', 'experiences']:
            if list_field in data:
                try:
                    val = data[list_field]
                    if isinstance(val, str):
                        import json
                        parsed = json.loads(val)
                        if isinstance(parsed, list) and len(parsed) == 0:
                            del data[list_field]
                    elif isinstance(val, list) and len(val) == 0:
                        del data[list_field]
                except Exception:
                    pass

        _prune_empty(data)
        print(f"Processed (pruned) data: {data}")
            
        # Only one profile per user: update if exists, else create
        try:
            profile = JobSeekerProfile.objects.get(user=user)
            serializer = self.get_serializer(profile, data=data, partial=True)
            print(f"Updating existing profile: {profile.id}")
        except JobSeekerProfile.DoesNotExist:
            serializer = self.get_serializer(data=data)
            print("Creating new profile")
        
        print(f"Serializer is valid: {serializer.is_valid()}")
        if not serializer.is_valid():
            print(f"Serializer errors: {serializer.errors}")
            
        serializer.is_valid(raise_exception=True)
        profile_obj = serializer.save(user=user)
        
        # Mark profile as complete when successfully saved with minimum required fields
        if profile_obj.first_name and profile_obj.email and profile_obj.phone:
            profile_obj.is_complete = True
            profile_obj.save(update_fields=['is_complete'])
            print(f"Profile marked as complete: {profile_obj.is_complete}")
        
        # Update User model with profile data
        if profile_obj.first_name and profile_obj.first_name != user.first_name:
            user.first_name = profile_obj.first_name
        if profile_obj.last_name and profile_obj.last_name != user.last_name:
            user.last_name = profile_obj.last_name
        if profile_obj.email and profile_obj.email != user.email:
            user.email = profile_obj.email
        user.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RecruiterProfileView(generics.RetrieveUpdateAPIView):
    """Main view for Recruiter Profile operations"""
    serializer_class = RecruiterProfileSerializer
    permission_classes = [IsAuthenticated]
    queryset = RecruiterProfile.objects.all()

    def get_object(self):
        profile, created = RecruiterProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            profile = RecruiterProfile.objects.get(user=user)
            serializer = self.get_serializer(profile)
            data = serializer.data
            
            # Add file URLs to the response
            if profile.profile_image_data:
                data['profile_image'] = {
                    'name': profile.profile_image_filename or 'profile_image',
                    'url': request.build_absolute_uri(f'/api/auth/files/recruiter/{profile.id}/profile_image/'),
                    'size': profile.profile_image_size or 0,
                    'uploaded_at': profile.updated_at.isoformat()
                }
            elif profile.profile_image_url:
                data['profile_image'] = {
                    'url': profile.profile_image_url,
                    'uploaded_at': profile.updated_at.isoformat()
                }
            
            if profile.resume_data:
                data['resume'] = {
                    'name': profile.resume_filename or 'resume',
                    'url': request.build_absolute_uri(f'/api/auth/files/recruiter/{profile.id}/resume/'),
                    'size': profile.resume_size or 0,
                    'uploaded_at': profile.updated_at.isoformat()
                }
            
            # Add company associations if any
            if profile.company_associations:
                # Enhance with company data
                for assoc in profile.company_associations:
                    try:
                        company_id = assoc.get('company_id')
                        if company_id:
                            company = CompanyProfile.objects.get(id=company_id)
                            assoc['company_name'] = company.company_name
                            if company.logo_data:
                                assoc['company_logo'] = request.build_absolute_uri(
                                    f'/api/auth/files/company/{company.id}/logo/'
                                )
                    except CompanyProfile.DoesNotExist:
                        pass
                
                data['company_associations'] = profile.company_associations
            
            return Response(data)
        except RecruiterProfile.DoesNotExist:
            # Pre-populate with user data from User table
            initial_data = {
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
                'email': user.email or '',
            }
            return Response(initial_data)

    def post(self, request, *args, **kwargs):
        print(f"=== RECRUITER ONBOARDING DEBUG ===")
        print(f"Request data: {request.data}")
        print(f"User: {request.user}")
        
        user = request.user
        data = request.data.copy()
        
        # Pre-populate with user data if not provided
        if not data.get('first_name') and user.first_name:
            data['first_name'] = user.first_name
        if not data.get('last_name') and user.last_name:
            data['last_name'] = user.last_name
        if not data.get('email') and user.email:
            data['email'] = user.email
            
    # Handle empty string date fields - convert to None for Django DateField (we'll prune None later)
        date_fields = ['availability_start_date']
        for field in date_fields:
            if field in data and data[field] == '':
                data[field] = None
                print(f"Converted empty string to None for date field: {field}")
        
    # Handle empty string integer fields - convert to None for Django IntegerField (we'll prune None later)
        integer_fields = ['years_of_experience', 'current_company_id']
        for field in integer_fields:
            if field in data and (data[field] == '' or data[field] is None):
                data[field] = None
                print(f"Converted empty value to None for integer field: {field}")

    # Handle decimal fields (we'll prune None later)
        decimal_fields = ['salary_range_from', 'salary_range_to']
        for field in decimal_fields:
            if field in data and data[field] == '':
                data[field] = None
                print(f"Converted empty string to None for decimal field: {field}")
        
        # Handle profile_image field - if it's a URL from file upload, store it in profile_image_url
        if 'profile_image' in data and data['profile_image']:
            if data['profile_image'].startswith('http'):
                # This is an uploaded file URL, store in profile_image_url field
                data['profile_image_url'] = data['profile_image']
                print(f"Set profile_image_url to: {data['profile_image_url']}")
            elif data['profile_image'].startswith('blob:'):
                # This is a blob URL, ignore it since the actual file should be uploaded separately
                print(f"Ignoring blob URL: {data['profile_image']}")
            # Remove the profile_image field since it's not a model field
            del data['profile_image']
        
        # Normalize skills structure similar to JobSeeker
        if 'skills' in data and data['skills'] is not None:
            try:
                import json
                raw_skills = data['skills']
                if isinstance(raw_skills, str):
                    raw_skills = json.loads(raw_skills)
                normalized_skills = []
                allowed = {'beginner', 'intermediate', 'advanced', 'expert'}
                if isinstance(raw_skills, list):
                    for s in raw_skills:
                        if isinstance(s, str):
                            normalized_skills.append({'name': s, 'proficiency': 'intermediate'})
                        elif isinstance(s, dict):
                            name = s.get('name') or s.get('skill') or ''
                            if not name:
                                continue
                            prof = (s.get('proficiency') or s.get('level') or 'intermediate').lower()
                            if prof not in allowed:
                                prof = 'intermediate'
                            entry = {'name': name, 'proficiency': prof}
                            if s.get('category'):
                                entry['category'] = s['category']
                            normalized_skills.append(entry)
                data['skills'] = normalized_skills
            except Exception as e:
                print(f"Recruiter skills normalization skipped due to error: {e}")
        
            # Prune empty/blank values to avoid overwriting existing resume-derived data
            def _prune_empty(d):
                keys_to_delete = []
                for k, v in d.items():
                    if v is False or v == 0:
                        continue
                    if v is None:
                        keys_to_delete.append(k)
                    elif isinstance(v, str):
                        if v.strip() == '' or v.strip().lower() in ('null', 'undefined'):
                            keys_to_delete.append(k)
                    elif isinstance(v, (list, tuple)) and len(v) == 0:
                        keys_to_delete.append(k)
                    elif isinstance(v, dict) and len(v.keys()) == 0:
                        keys_to_delete.append(k)
                for k in keys_to_delete:
                    d.pop(k, None)

            for list_field in ['skills', 'preferred_roles', 'company_associations', 'industries', 'work_arrangements']:
                if list_field in data:
                    try:
                        val = data[list_field]
                        if isinstance(val, str):
                            import json
                            parsed = json.loads(val)
                            if isinstance(parsed, list) and len(parsed) == 0:
                                del data[list_field]
                        elif isinstance(val, list) and len(val) == 0:
                            del data[list_field]
                    except Exception:
                        pass

            _prune_empty(data)
            print(f"Processed (pruned) recruiter data: {data}")
            
        # Only one profile per user: update if exists, else create
        try:
            profile = RecruiterProfile.objects.get(user=user)
            serializer = self.get_serializer(profile, data=data, partial=True)
        except RecruiterProfile.DoesNotExist:
            serializer = self.get_serializer(data=data)
        
        print(f"Serializer is valid: {serializer.is_valid()}")
        if not serializer.is_valid():
            print(f"Serializer errors: {serializer.errors}")
            
        serializer.is_valid(raise_exception=True)
        profile_obj = serializer.save(user=user)
        
        # Mark profile as complete when successfully saved with minimum required fields
        if profile_obj.first_name and profile_obj.email and profile_obj.job_title:
            profile_obj.is_complete = True
            profile_obj.save(update_fields=['is_complete'])
            print(f"Profile marked as complete: {profile_obj.is_complete}")
        
        # Update User model with profile data
        if profile_obj.first_name and profile_obj.first_name != user.first_name:
            user.first_name = profile_obj.first_name
        if profile_obj.last_name and profile_obj.last_name != user.last_name:
            user.last_name = profile_obj.last_name
        if profile_obj.email and profile_obj.email != user.email:
            user.email = profile_obj.email
        user.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CompanyProfileView(generics.RetrieveUpdateAPIView):
    """Main view for Company Profile operations"""
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsAuthenticated]
    queryset = CompanyProfile.objects.all()

    def get_object(self):
        profile, created = CompanyProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            profile = CompanyProfile.objects.get(user=user)
            serializer = self.get_serializer(profile)
            data = serializer.data
            
            # Add file URLs to the response for logo and brochure
            if profile.logo_data:
                data['logo'] = {
                    'name': profile.logo_filename or 'logo',
                    'url': request.build_absolute_uri(f'/api/auth/files/company/{profile.id}/logo/'),
                    'size': profile.logo_size or 0,
                    'uploaded_at': profile.updated_at.isoformat()
                }
            elif profile.logo_url:
                data['logo'] = {
                    'url': profile.logo_url,
                    'uploaded_at': profile.updated_at.isoformat()
                }
            
            if profile.company_brochure_data:
                data['company_brochure'] = {
                    'name': profile.company_brochure_filename or 'brochure',
                    'url': request.build_absolute_uri(f'/api/auth/files/company/{profile.id}/brochure/'),
                    'size': profile.company_brochure_size or 0,
                    'uploaded_at': profile.updated_at.isoformat()
                }
            elif profile.company_brochure_url:
                data['company_brochure'] = {
                    'url': profile.company_brochure_url,
                    'uploaded_at': profile.updated_at.isoformat()
                }
            
            return Response(data)
        except CompanyProfile.DoesNotExist:
            # Return empty data for company profile
            return Response({})

    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data.copy()
        
        print(f"=== COMPANY ONBOARDING DEBUG ===")
        print(f"Request data: {request.data}")
        print(f"User: {request.user}")
        
        # Handle empty string integer fields - convert to None for Django IntegerField
        integer_fields = ['founded_year']
        for field in integer_fields:
            if field in data and (data[field] == '' or data[field] == None):
                data[field] = None
                print(f"Converted empty value to None for integer field: {field}")
                
        # Handle empty string date fields - convert to None for Django DateField
        date_fields = []  # Add any date fields here if needed
        for field in date_fields:
            if field in data and data[field] == '':
                data[field] = None
                print(f"Converted empty string to None for date field: {field}")
        
        # Handle empty string decimal fields - convert to None for Django DecimalField
        decimal_fields = []  # Add any decimal fields here if needed
        for field in decimal_fields:
            if field in data and data[field] == '':
                data[field] = None
                print(f"Converted empty string to None for decimal field: {field}")
        
        # Handle logo field - if it's a URL from file upload, store it in logo_url
        if 'logo' in data and data['logo']:
            if isinstance(data['logo'], str) and data['logo'].startswith('http'):
                data['logo_url'] = data['logo']
                print(f"Set logo_url to: {data['logo_url']}")
            elif isinstance(data['logo'], str) and data['logo'].startswith('blob:'):
                # Blob preview from frontend, ignore
                print(f"Ignoring blob URL for logo: {data['logo']}")
            # Remove non-model field
            del data['logo']
                
        # Only one profile per user: update if exists, else create
        try:
            profile = CompanyProfile.objects.get(user=user)
            serializer = self.get_serializer(profile, data=data, partial=True)
        except CompanyProfile.DoesNotExist:
            serializer = self.get_serializer(data=data)
        
        print(f"Serializer is valid: {serializer.is_valid()}")
        if not serializer.is_valid():
            print(f"Serializer errors: {serializer.errors}")
            
        serializer.is_valid(raise_exception=True)
        profile_obj = serializer.save(user=user)
        
        # Mark profile as complete when successfully saved with minimum required fields
        if profile_obj.company_name:
            profile_obj.is_complete = True
            profile_obj.save(update_fields=['is_complete'])
            print(f"Profile marked as complete: {profile_obj.is_complete}")
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Backward Compatibility Views
class JobSeekerOnboardingView(JobSeekerProfileView):
    """Backward compatibility view - redirects to JobSeekerProfileView"""
    pass


# Company-Recruiter Relationship Views
class CompanyRecruiterInvitationView(APIView):
    """View for creating and managing company-recruiter invitations"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        """Create a new invitation"""
        # Only company users can create invitations
        if request.user.role != 'company':
            return Response({'error': 'Only company users can create invitations'},
                           status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        
        try:
            # Get the company profile of the requesting user
            company = CompanyProfile.objects.get(user=request.user)
            
            # Require recruiter_id (email-based invites removed)
            recruiter = None
            recruiter_id = data.get('recruiter_id')
            if not recruiter_id:
                return Response({'error': 'recruiter_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                recruiter = RecruiterProfile.objects.get(id=int(recruiter_id))
            except (ValueError, RecruiterProfile.DoesNotExist):
                return Response({'error': 'Recruiter not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check for existing relationship
            existing = CompanyRecruiterRelationship.objects.filter(
                company=company, recruiter=recruiter
            ).first()
            
            if existing:
                if existing.status == 'accepted':
                    return Response({'error': 'Recruiter is already a member of this company'},
                                  status=status.HTTP_400_BAD_REQUEST)
                elif existing.status in ['pending', 'declined']:
                    # If there's a pending recruiter-initiated request, surface a conflict
                    if existing.status == 'pending':
                        initiator = None
                        if isinstance(existing.permissions, dict):
                            initiator = existing.permissions.get('initiated_by')
                        if initiator == 'recruiter':
                            return Response(
                                {'error': 'Recruiter already requested to join. Please review the pending request instead of sending an invite.'},
                                status=status.HTTP_409_CONFLICT
                            )
                    # Otherwise (declined or company-initiated pending), update/resend the invite
                    existing.status = 'pending'
                    existing.invited_at = timezone.now()
                    existing.responded_at = None
                    existing.role = data.get('role', 'recruiter')
                    # Optional permissions payload
                    if 'permissions' in data:
                        perms = data.get('permissions')
                        if isinstance(perms, dict):
                            perms.setdefault('initiated_by', 'company')
                        existing.permissions = perms
                    else:
                        # ensure initiator marked as company for clarity
                        meta = existing.permissions or {}
                        if isinstance(meta, dict):
                            meta.setdefault('initiated_by', 'company')
                            existing.permissions = meta
                    existing.save()
                    return Response({
                        'message': 'Invitation resent successfully',
                        'invitation_id': existing.id
                    })
            
            # Create new relationship
            relationship = CompanyRecruiterRelationship.objects.create(
                company=company,
                recruiter=recruiter,
                role=data.get('role', 'recruiter'),
                status='pending'
            )
            # Optional permissions payload stored on relationship
            if 'permissions' in data:
                perms = data.get('permissions')
                if isinstance(perms, dict):
                    perms.setdefault('initiated_by', 'company')
                relationship.permissions = perms
                relationship.save(update_fields=['permissions'])
            else:
                relationship.permissions = {'initiated_by': 'company'}
                relationship.save(update_fields=['permissions'])
            
            # TODO: Send email notification to the recruiter
            
            return Response({
                'message': 'Invitation sent successfully',
                'invitation_id': relationship.id
            }, status=status.HTTP_201_CREATED)
            
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company profile not found'},
                          status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Error creating invitation: {str(e)}'},
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request, *args, **kwargs):
        """Get all invitations for a company or recruiter"""
        try:
            if request.user.role == 'company':
                # Company viewing sent invitations
                company = CompanyProfile.objects.get(user=request.user)
                relationships = CompanyRecruiterRelationship.objects.filter(company=company)
                
                result = []
                for rel in relationships:
                    result.append({
                        'id': rel.id,
                        'recruiter_id': rel.recruiter.id,
                        'recruiter_name': rel.recruiter.full_name,
                        'recruiter_email': rel.recruiter.email,
                        'role': rel.role,
                        'status': 'removed' if rel.status == 'revoked' else rel.status,
                        'initiated_by': (rel.permissions or {}).get('initiated_by') if isinstance(rel.permissions, dict) else None,
                        'message': (rel.permissions or {}).get('message') if isinstance(rel.permissions, dict) else None,
                        'invited_at': rel.invited_at.isoformat(),
                        'responded_at': rel.responded_at.isoformat() if rel.responded_at else None
                    })
                
                return Response(result)
                
            elif request.user.role == 'recruiter':
                # Recruiter viewing received invitations
                recruiter = RecruiterProfile.objects.get(user=request.user)
                relationships = CompanyRecruiterRelationship.objects.filter(recruiter=recruiter)
                
                result = []
                for rel in relationships:
                    result.append({
                        'id': rel.id,
                        'company_id': rel.company.id,
                        'company_name': rel.company.company_name,
                        'role': rel.role,
                        'status': 'removed' if rel.status == 'revoked' else rel.status,
                        'initiated_by': (rel.permissions or {}).get('initiated_by') if isinstance(rel.permissions, dict) else None,
                        'message': (rel.permissions or {}).get('message') if isinstance(rel.permissions, dict) else None,
                        'invited_at': rel.invited_at.isoformat(),
                        'responded_at': rel.responded_at.isoformat() if rel.responded_at else None
                    })
                
                return Response(result)
            else:
                return Response({'error': 'Invalid user role'},
                              status=status.HTTP_400_BAD_REQUEST)
                
        except (CompanyProfile.DoesNotExist, RecruiterProfile.DoesNotExist):
            return Response({'error': 'Profile not found'},
                          status=status.HTTP_404_NOT_FOUND)


class CompanyRecruiterResponseView(APIView):
    """View for responding to company invitations"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, invitation_id, *args, **kwargs):
        """Accept or decline an invitation"""
        if request.user.role != 'recruiter':
            return Response({'error': 'Only recruiters can respond to invitations'},
                          status=status.HTTP_403_FORBIDDEN)
                
        action = request.data.get('action')
        if action not in ['accept', 'decline']:
            return Response({'error': 'Invalid action. Must be "accept" or "decline"'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the recruiter profile
            recruiter = RecruiterProfile.objects.get(user=request.user)
            
            # Get the invitation
            invitation = CompanyRecruiterRelationship.objects.get(
                id=invitation_id, recruiter=recruiter
            )
            
            if invitation.status != 'pending':
                return Response({
                    'error': f'Cannot respond to an invitation with status "{invitation.status}"'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update the invitation status
            invitation.status = 'accepted' if action == 'accept' else 'declined'
            invitation.responded_at = timezone.now()
            invitation.save()
            
            # If accepting, update the recruiter's company associations
            if action == 'accept':
                current_associations = recruiter.company_associations or []
                
                # Check if this company is already in the associations
                company_exists = False
                for assoc in current_associations:
                    if assoc.get('company_id') == invitation.company.id:
                        company_exists = True
                        assoc['role'] = invitation.role
                        assoc['status'] = 'active'
                        break
                
                if not company_exists:
                    current_associations.append({
                        'company_id': invitation.company.id,
                        'role': invitation.role,
                        'status': 'active',
                        'joined_at': invitation.responded_at.isoformat()
                    })
                
                # Update the recruiter profile
                recruiter.company_associations = current_associations
                
                # If this is the first company, set it as the current company
                if not recruiter.current_company_id:
                    recruiter.current_company_id = invitation.company.id
                
                recruiter.save()
            
            return Response({
                'message': f'Invitation {action}ed successfully',
                'status': invitation.status
            })
            
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found'},
                          status=status.HTTP_404_NOT_FOUND)
        except CompanyRecruiterRelationship.DoesNotExist:
            return Response({'error': 'Invitation not found'},
                          status=status.HTTP_404_NOT_FOUND)


class CompanyProcessRequestView(APIView):
    """Company approves/declines recruiter-initiated join requests (pending relationships)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, relationship_id, *args, **kwargs):
        if request.user.role != 'company':
            return Response({'error': 'Only company users can process requests'}, status=status.HTTP_403_FORBIDDEN)
        action = request.data.get('action')
        if action not in ['accept', 'decline']:
            return Response({'error': 'Invalid action. Must be "accept" or "decline"'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            company = CompanyProfile.objects.get(user=request.user)
            rel = CompanyRecruiterRelationship.objects.get(id=relationship_id, company=company)
            if rel.status != 'pending':
                return Response({'error': f'Cannot process a request with status "{rel.status}"'}, status=status.HTTP_400_BAD_REQUEST)
            # Accept or decline
            rel.status = 'accepted' if action == 'accept' else 'declined'
            rel.responded_at = timezone.now()
            # Allow role/permissions update on accept
            if action == 'accept':
                new_role = request.data.get('role')
                if new_role:
                    allowed_roles = [choice[0] for choice in CompanyRecruiterRelationship.ROLE_CHOICES]
                    if new_role not in allowed_roles:
                        return Response({'error': f'Invalid role. Must be one of {allowed_roles}'}, status=status.HTTP_400_BAD_REQUEST)
                    rel.role = new_role
                if 'permissions' in request.data:
                    rel.permissions = request.data.get('permissions')
            rel.save()

            # On accept, update recruiter associations
            if action == 'accept':
                recruiter = rel.recruiter
                current_associations = recruiter.company_associations or []
                found = False
                for assoc in current_associations:
                    if assoc.get('company_id') == rel.company.id:
                        assoc['role'] = rel.role
                        assoc['status'] = 'active'
                        found = True
                        break
                if not found:
                    current_associations.append({
                        'company_id': rel.company.id,
                        'role': rel.role,
                        'status': 'active',
                        'joined_at': rel.responded_at.isoformat()
                    })
                recruiter.company_associations = current_associations
                if not recruiter.current_company_id:
                    recruiter.current_company_id = rel.company.id
                recruiter.save()

            return Response({'message': f'Request {action}ed successfully', 'status': rel.status})
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except CompanyRecruiterRelationship.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)


class RecruiterCompanySelectionView(APIView):
    """View for recruiters to select their active company"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        """Set the recruiter's active company"""
        if request.user.role != 'recruiter':
            return Response({'error': 'Only recruiters can select a company'},
                          status=status.HTTP_403_FORBIDDEN)
        
        company_id = request.data.get('company_id')
        if not company_id:
            return Response({'error': 'Company ID is required'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the recruiter profile
            recruiter = RecruiterProfile.objects.get(user=request.user)
            
            # Check if the recruiter is associated with this company
            company_associations = recruiter.company_associations or []
            company_found = False
            
            for assoc in company_associations:
                if assoc.get('company_id') == int(company_id) and assoc.get('status') == 'active':
                    company_found = True
                    break
            
            if not company_found:
                return Response({'error': 'You are not associated with this company'},
                              status=status.HTTP_403_FORBIDDEN)
            
            # Check if the company exists
            try:
                company = CompanyProfile.objects.get(id=company_id)
            except CompanyProfile.DoesNotExist:
                return Response({'error': 'Company not found'},
                              status=status.HTTP_404_NOT_FOUND)
            
            # Update the recruiter's current company
            recruiter.current_company_id = int(company_id)
            recruiter.save()
            
            return Response({
                'message': 'Active company updated successfully',
                'company': {
                    'id': company.id,
                    'name': company.company_name
                }
            })
            
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found'},
                          status=status.HTTP_404_NOT_FOUND)


class RecruiterJoinRequestView(APIView):
    """Allow a recruiter to request to join a company (creates pending relationship)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'recruiter':
            return Response({'error': 'Only recruiters can request to join a company'}, status=status.HTTP_403_FORBIDDEN)
        company_id = request.data.get('company_id')
        if not company_id:
            return Response({'error': 'Company ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            recruiter = RecruiterProfile.objects.get(user=request.user)
            company = CompanyProfile.objects.get(id=int(company_id))
            # Check for existing relationship
            rel = CompanyRecruiterRelationship.objects.filter(company=company, recruiter=recruiter).first()
            if rel:
                if rel.status == 'accepted':
                    return Response({'error': 'You are already part of this company'}, status=status.HTTP_400_BAD_REQUEST)
                if rel.status == 'pending':
                    initiator = None
                    if isinstance(rel.permissions, dict):
                        initiator = rel.permissions.get('initiated_by')
                    if initiator in [None, 'company']:
                        return Response({'error': 'Company already invited you. Please respond to the pending invite.'}, status=status.HTTP_409_CONFLICT)
                    return Response({'message': 'Request already pending', 'relationship_id': rel.id}, status=status.HTTP_200_OK)
                # If previously declined or revoked, reset to pending
                rel.status = 'pending'
                rel.invited_at = timezone.now()
                rel.responded_at = None
                # mark initiator via permissions meta to avoid schema change
                meta = rel.permissions or {}
                if isinstance(meta, dict):
                    meta['initiated_by'] = 'recruiter'
                    note = request.data.get('message')
                    if note:
                        meta['message'] = note
                    rel.permissions = meta
                rel.save()
                return Response({'message': 'Request submitted', 'relationship_id': rel.id}, status=status.HTTP_200_OK)
            # Create a new relationship
            permissions_meta = {'initiated_by': 'recruiter'}
            if request.data.get('message'):
                permissions_meta['message'] = request.data.get('message')
            rel = CompanyRecruiterRelationship.objects.create(
                company=company,
                recruiter=recruiter,
                role=request.data.get('role', 'recruiter'),
                status='pending',
                permissions=permissions_meta
            )
            return Response({'message': 'Request submitted', 'relationship_id': rel.id}, status=status.HTTP_201_CREATED)
        except (RecruiterProfile.DoesNotExist, CompanyProfile.DoesNotExist):
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


# Company Team Management Views
class CompanyTeamMembersView(APIView):
    """List accepted team members for a company user"""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'company':
            return Response({'error': 'Only company users can view team members'}, status=status.HTTP_403_FORBIDDEN)
        try:
            company = CompanyProfile.objects.get(user=request.user)
            relationships = CompanyRecruiterRelationship.objects.filter(company=company, status='accepted').select_related('recruiter__user')
            members = []
            for rel in relationships:
                rec = rel.recruiter
                members.append({
                    'relationship_id': rel.id,
                    'recruiter_id': rec.id,
                    'name': rec.full_name or rec.user.get_full_name() or rec.user.username,
                    'email': rec.email or rec.user.email,
                    'role': rel.role,
                    'permissions': rel.permissions or {},
                    'joined_at': rel.responded_at.isoformat() if rel.responded_at else rel.invited_at.isoformat(),
                })
            return Response({'members': members})
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company profile not found'}, status=status.HTTP_404_NOT_FOUND)


class CompanyTeamMemberDetailView(APIView):
    """Update or revoke a team member relationship for a company user"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, relationship_id, *args, **kwargs):
        if request.user.role != 'company':
            return Response({'error': 'Only company users can manage team'}, status=status.HTTP_403_FORBIDDEN)
        try:
            company = CompanyProfile.objects.get(user=request.user)
            rel = CompanyRecruiterRelationship.objects.get(id=relationship_id, company=company)
            data = request.data or {}
            allowed_roles = [choice[0] for choice in CompanyRecruiterRelationship.ROLE_CHOICES]
            if 'role' in data:
                new_role = data.get('role')
                if new_role not in allowed_roles:
                    return Response({'error': f'Invalid role. Must be one of {allowed_roles}'}, status=status.HTTP_400_BAD_REQUEST)
                rel.role = new_role
            if 'permissions' in data and isinstance(data.get('permissions'), (dict, list)):
                # store arbitrary permission structure
                rel.permissions = data.get('permissions')
            rel.save()
            return Response({'message': 'Team member updated successfully'})
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except CompanyRecruiterRelationship.DoesNotExist:
            return Response({'error': 'Team member not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, relationship_id, *args, **kwargs):
        """Revoke team member access (soft delete by setting status=revoked)"""
        if request.user.role != 'company':
            return Response({'error': 'Only company users can manage team'}, status=status.HTTP_403_FORBIDDEN)
        try:
            company = CompanyProfile.objects.get(user=request.user)
            rel = CompanyRecruiterRelationship.objects.get(id=relationship_id, company=company)
            if rel.status == 'revoked':
                return Response({'message': 'Already revoked'}, status=status.HTTP_200_OK)
            rel.status = 'revoked'
            rel.responded_at = timezone.now()
            rel.save()

            # Update recruiter profile associations to mark inactive for this company
            recruiter = rel.recruiter
            associations = recruiter.company_associations or []
            for assoc in associations:
                if assoc.get('company_id') == company.id:
                    assoc['status'] = 'inactive'
            recruiter.company_associations = associations
            if recruiter.current_company_id == company.id:
                recruiter.current_company_id = None
            recruiter.save()

            return Response({'message': 'Team member access revoked'})
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except CompanyRecruiterRelationship.DoesNotExist:
            return Response({'error': 'Team member not found'}, status=status.HTTP_404_NOT_FOUND)


class RecruiterOnboardingView(generics.GenericAPIView):
    """View for recruiter onboarding - separate from company onboarding"""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role == 'recruiter':
            # Create an instance of the view and call its method directly
            view_instance = RecruiterProfileView()
            view_instance.request = request
            view_instance.format_kwarg = getattr(self, 'format_kwarg', None)
            return view_instance.get(request, *args, **kwargs)
        else:
            return Response({'error': 'Invalid user role. Only recruiter users can access this endpoint'}, 
                           status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.role == 'recruiter':
            # Create an instance of the view and call its method directly
            view_instance = RecruiterProfileView()
            view_instance.request = request
            view_instance.format_kwarg = getattr(self, 'format_kwarg', None)
            return view_instance.post(request, *args, **kwargs)
        else:
            return Response({'error': 'Invalid user role. Only recruiter users can access this endpoint'}, 
                           status=status.HTTP_400_BAD_REQUEST)


class CompanyOnboardingView(generics.GenericAPIView):
    """View for company onboarding (formerly recruiter-employer onboarding)"""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role == 'company':
            # Create an instance of the view and call its method directly
            view_instance = CompanyProfileView()
            view_instance.request = request
            view_instance.format_kwarg = getattr(self, 'format_kwarg', None)
            return view_instance.get(request, *args, **kwargs)
        else:
            return Response({'error': 'Invalid user role. Only company users can access this endpoint'}, 
                           status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.role == 'company':
            # Create an instance of the view and call its method directly
            view_instance = CompanyProfileView()
            view_instance.request = request
            view_instance.format_kwarg = getattr(self, 'format_kwarg', None)
            return view_instance.post(request, *args, **kwargs)
        else:
            return Response({'error': 'Invalid user role. Only company users can access this endpoint'}, 
                           status=status.HTTP_400_BAD_REQUEST)


class LocationsListView(APIView):
    """Public endpoint to list/search active locations from DB."""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        q = request.GET.get('q', '').strip()
        qs = Location.objects.filter(is_active=True)
        if q:
            qs = qs.filter(display_name__icontains=q)
        qs = qs.order_by('-popularity', 'display_name')[:500]
        serializer = LocationSerializer(qs, many=True)
        return Response({'results': serializer.data, 'count': len(serializer.data)})


class SkillsListView(APIView):
    """Public endpoint to list/search active skills from DB."""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        q = request.GET.get('q', '').strip()
        qs = Skill.objects.filter(is_active=True)
        if q:
            qs = qs.filter(name__icontains=q)
        qs = qs.order_by('-popularity', 'name')[:500]
        serializer = SkillSerializer(qs, many=True)
        return Response({'results': serializer.data, 'count': len(serializer.data)})


class JobRolesListView(APIView):
    """Public endpoint to list/search active job roles from DB."""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        q = request.GET.get('q', '').strip()
        audience = request.GET.get('audience', '').strip().lower()
        qs = JobRole.objects.filter(is_active=True)
        if q:
            qs = qs.filter(title__icontains=q)
        if audience == 'jobseeker':
            qs = qs.filter(for_jobseekers=True)
        elif audience == 'recruiter':
            qs = qs.filter(for_recruiters=True)
        elif request.user and getattr(request.user, 'is_authenticated', False):
            # Default audience by authenticated user's role when not explicitly specified
            user_role = getattr(request.user, 'role', None)
            if user_role == 'job_seeker':
                qs = qs.filter(for_jobseekers=True)
            elif user_role == 'recruiter':
                qs = qs.filter(for_recruiters=True)
        qs = qs.order_by('-popularity', 'title')[:500]
        serializer = JobRoleSerializer(qs, many=True)
        return Response({'results': serializer.data, 'count': len(serializer.data)})


class IndustriesListView(APIView):
    """Public endpoint to list/search active industries from DB."""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        q = request.GET.get('q', '').strip()
        qs = Industry.objects.filter(is_active=True)
        if q:
            qs = qs.filter(name__icontains=q)
        qs = qs.order_by('-popularity', 'name')[:500]
        serializer = IndustrySerializer(qs, many=True)
        return Response({'results': serializer.data, 'count': len(serializer.data)})


class SalaryBandsListView(APIView):
    """Public endpoint to list salary bands, default currency INR."""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        currency = (request.GET.get('currency') or 'INR').upper()
        qs = SalaryBand.objects.filter(is_active=True, currency=currency).order_by('-popularity', 'min_amount')
        serializer = SalaryBandSerializer(qs, many=True)
        return Response({'results': serializer.data, 'count': len(serializer.data)})


class RecruitersListView(APIView):
    """List/search recruiter profiles (company-authenticated recommended)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Optional: restrict to company users only
        if getattr(request.user, 'role', None) != 'company':
            return Response({'error': 'Only company users can list recruiters'}, status=status.HTTP_403_FORBIDDEN)
        q = (request.GET.get('q') or '').strip()
        limit = min(int(request.GET.get('limit') or 20), 100)
        qs = RecruiterProfile.objects.select_related('user')
        if q:
            qs = qs.filter(Q(first_name__icontains=q) | Q(last_name__icontains=q) | Q(email__icontains=q) | Q(user__email__icontains=q))
        qs = qs.order_by('first_name', 'last_name')[:limit]
        results = []
        for r in qs:
            results.append({
                'id': r.id,
                'name': (r.full_name or r.user.get_full_name() or r.user.username).strip(),
                'email': r.email or r.user.email,
            })
        return Response({'results': results, 'count': len(results)})


class RecruiterDetailView(APIView):
    """Restricted recruiter profile for company users to evaluate before inviting/hiring."""
    permission_classes = [IsAuthenticated]

    def get(self, request, recruiter_id, *args, **kwargs):
        if getattr(request.user, 'role', None) != 'company':
            return Response({'error': 'Only company users can view recruiter details'}, status=status.HTTP_403_FORBIDDEN)
        try:
            rec = RecruiterProfile.objects.select_related('user').get(id=int(recruiter_id))
            data = {
                'id': rec.id,
                'name': (rec.full_name or rec.user.get_full_name() or rec.user.username).strip(),
                'email': rec.email or rec.user.email,
                'location': rec.location,
                'job_title': rec.job_title,
                'years_of_experience': rec.years_of_experience,
                'specializations': rec.specializations,
                'industries': rec.industries,
                'primary_industry': rec.primary_industry,
                'services_offered': rec.services_offered,
                'recruiting_areas': rec.recruiting_areas,
                'skills': rec.skills,
            }
            # include profile image url if present
            if rec.profile_image_data or rec.profile_image_url:
                data['profile_image_url'] = rec.profile_image_url or request.build_absolute_uri(f'/api/auth/files/recruiter/{rec.id}/profile_image/')
            # include resume url if present (optional)
            if rec.resume_data or rec.resume_url:
                data['resume_url'] = rec.resume_url or request.build_absolute_uri(f'/api/auth/files/recruiter/{rec.id}/resume/')
            return Response(data)
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter not found'}, status=status.HTTP_404_NOT_FOUND)


class CompaniesListView(APIView):
    """List/search companies (for recruiters to request/apply)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if getattr(request.user, 'role', None) not in ['recruiter', 'company', 'administrator']:
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        q = (request.GET.get('q') or '').strip()
        limit = min(int(request.GET.get('limit') or 20), 100)
        qs = CompanyProfile.objects.all()
        if q:
            qs = qs.filter(Q(company_name__icontains=q) | Q(industry__icontains=q) | Q(headquarters__icontains=q))
        qs = qs.order_by('company_name')[:limit]
        results = []
        for c in qs:
            item = {
                'id': c.id,
                'name': c.company_name,
                'industry': c.industry,
                'headquarters': c.headquarters,
            }
            if c.logo_data or c.logo_url:
                item['logo_url'] = c.logo_url or request.build_absolute_uri(f'/api/auth/files/company/{c.id}/logo/')
            results.append(item)
        return Response({'results': results, 'count': len(results)})


class CompanyDetailView(APIView):
    """Return public company details by ID for authenticated users (recruiter/company/admin)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, company_id, *args, **kwargs):
        if getattr(request.user, 'role', None) not in ['recruiter', 'company', 'administrator']:
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        try:
            c = CompanyProfile.objects.get(id=int(company_id))
            data = {
                'id': c.id,
                'name': c.company_name,
                'industry': c.industry,
                'headquarters': c.headquarters,
                'company_size': c.company_size,
                'founded_year': c.founded_year,
                'website': c.website,
                'contact_email': c.contact_email,
                'contact_phone': c.contact_phone,
                'hr_contact_name': c.hr_contact_name,
                'hr_contact_email': c.hr_contact_email,
                'linkedin_url': c.linkedin_url,
                'description': c.description,
                'mission_statement': c.mission_statement,
                'company_values': c.company_values,
                'company_benefits': c.company_benefits,
                'work_environment': c.work_environment,
                'team_size': c.team_size,
                'department': c.department,
                'current_openings': c.current_openings,
                'hiring_focus': c.hiring_focus,
                'dei_commitment': c.dei_commitment,
                'diversity_initiatives': c.diversity_initiatives,
                'inclusive_practices': c.inclusive_practices,
                'locations': c.locations,
                'tech_stack': c.tech_stack,
            }
            if c.logo_data or c.logo_url:
                data['logo_url'] = c.logo_url or request.build_absolute_uri(f'/api/auth/files/company/{c.id}/logo/')
            if c.company_brochure_data or c.company_brochure_url:
                data['brochure_url'] = c.company_brochure_url or request.build_absolute_uri(f'/api/auth/files/company/{c.id}/brochure/')
            return Response(data)
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


class RecruiterCompaniesListView(APIView):
    """List recruiter's active companies with details and mark the current one."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if getattr(request.user, 'role', None) != 'recruiter':
            return Response({'error': 'Only recruiters can view their companies'}, status=status.HTTP_403_FORBIDDEN)
        try:
            rec = RecruiterProfile.objects.get(user=request.user)
            rels = CompanyRecruiterRelationship.objects.filter(recruiter=rec, status='accepted').select_related('company')
            items = []
            for rel in rels:
                comp = rel.company
                item = {
                    'company_id': comp.id,
                    'name': comp.company_name,
                    'industry': comp.industry,
                    'headquarters': comp.headquarters,
                    'website': comp.website,
                    'role': rel.role,
                    'joined_at': rel.responded_at.isoformat() if rel.responded_at else rel.invited_at.isoformat(),
                    'is_current': rec.current_company_id == comp.id,
                }
                if comp.logo_data or comp.logo_url:
                    item['logo_url'] = comp.logo_url or request.build_absolute_uri(f'/api/auth/files/company/{comp.id}/logo/')
                items.append(item)
            return Response({'results': items, 'count': len(items)})
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found'}, status=status.HTTP_404_NOT_FOUND)


