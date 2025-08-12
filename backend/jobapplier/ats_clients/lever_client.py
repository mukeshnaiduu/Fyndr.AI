import logging
import requests
from typing import Dict, Any, Optional
from ..models import JobPosting, UserProfile

logger = logging.getLogger(__name__)


class LeverClient:
    """
    API client for Lever ATS system.
    
    Lever API Documentation: https://hire.lever.co/developer/documentation
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://api.lever.co/v1"
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            })
    
    def apply_via_api(self, job: JobPosting, user_profile: UserProfile) -> Dict[str, Any]:
        """
        Apply to a job via Lever API.
        
        Args:
            job: JobPosting instance containing job details
            user_profile: UserProfile instance with applicant details
            
        Returns:
            Dict containing:
                - status: 'success' or 'failed'
                - confirmation_number: Application ID if successful
                - error: Error message if failed
        """
        logger.info(f"Applying to Lever job {job.external_id} for user {user_profile.full_name}")
        
        # TODO: Implement actual Lever API integration
        # This is a placeholder implementation
        
        try:
            # Extract job ID from external_id or URL
            job_id = self._extract_job_id(job)
            if not job_id:
                return {
                    'status': 'failed',
                    'confirmation_number': None,
                    'error': 'Could not extract Lever job ID'
                }
            
            # Prepare application payload
            application_data = self._prepare_application_data(job, user_profile)
            
            # Submit application via API
            response = self._submit_application(job_id, application_data, user_profile)
            
            if response['success']:
                logger.info(f"Successfully applied to Lever job {job_id}")
                return {
                    'status': 'success',
                    'confirmation_number': response.get('application_id'),
                    'error': None
                }
            else:
                logger.error(f"Failed to apply to Lever job {job_id}: {response.get('error')}")
                return {
                    'status': 'failed',
                    'confirmation_number': None,
                    'error': response.get('error', 'Unknown error')
                }
                
        except Exception as e:
            error_msg = f"Exception applying to Lever job: {str(e)}"
            logger.error(error_msg)
            return {
                'status': 'failed',
                'confirmation_number': None,
                'error': error_msg
            }
    
    def _extract_job_id(self, job: JobPosting) -> Optional[str]:
        """
        Extract Lever job ID from external_id or URL.
        
        Lever URLs typically look like:
        https://jobs.lever.co/company/abc123-def456-ghi789
        """
        # Try external_id first
        if job.external_id:
            return job.external_id
            
        # Try to extract from URL
        if job.url:
            import re
            # Pattern for Lever job URLs
            match = re.search(r'/([a-f0-9-]{36}|\w+-\w+-\w+)/?$', job.url)
            if match:
                return match.group(1)
                
        return None
    
    def _prepare_application_data(self, job: JobPosting, user_profile: UserProfile) -> Dict[str, Any]:
        """
        Prepare application data payload for Lever API.
        """
        # TODO: Implement based on Lever API specification
        name_parts = user_profile.full_name.split() if user_profile.full_name else ['', '']
        
        return {
            'name': user_profile.full_name,
            'email': user_profile.email,
            'phone': user_profile.phone,
            'resume': {
                'filename': 'resume.pdf',
                'content_type': 'application/pdf',
                # 'content': base64_encoded_resume_content
            },
            'cover_letter': {
                'filename': 'cover_letter.pdf', 
                'content_type': 'application/pdf',
                # 'content': base64_encoded_cover_letter_content
            } if user_profile.cover_letter else None,
            'urls': {
                'linkedin': user_profile.linkedin_url,
                'portfolio': user_profile.portfolio_url
            },
            'source': 'API Application',
            'eeo': self._prepare_eeo_data(user_profile),
            'answers': self._prepare_custom_answers(user_profile)
        }
    
    def _prepare_eeo_data(self, user_profile: UserProfile) -> Dict[str, Any]:
        """
        Prepare EEO (Equal Employment Opportunity) data for Lever.
        """
        # TODO: Add EEO fields to UserProfile if needed
        return {
            'race': None,
            'gender': None,
            'veteran_status': None,
            'disability_status': None
        }
    
    def _prepare_custom_answers(self, user_profile: UserProfile) -> list:
        """
        Prepare custom question answers from user profile.
        """
        answers = []
        
        # Add work authorization as a common question
        if user_profile.work_authorization:
            answers.append({
                'question': 'Work Authorization',
                'answer': user_profile.work_authorization
            })
        
        # Add custom ATS answers
        if user_profile.custom_ats_answers:
            for question, answer in user_profile.custom_ats_answers.items():
                answers.append({
                    'question': question,
                    'answer': answer
                })
                
        return answers
    
    def _submit_application(self, job_id: str, application_data: Dict[str, Any], user_profile: UserProfile) -> Dict[str, Any]:
        """
        Submit application to Lever API.
        
        This is a placeholder - actual implementation would depend on
        Lever API endpoints and authentication.
        """
        # TODO: Implement actual API call
        # Example endpoint: POST /v1/postings/{posting_id}/candidates
        
        try:
            # Placeholder response
            logger.info(f"[PLACEHOLDER] Would submit application to Lever job {job_id}")
            logger.info(f"[PLACEHOLDER] Application data: {application_data}")
            
            # Simulate successful response
            return {
                'success': True,
                'application_id': f"LV_{job_id}_{user_profile.user.id}",
                'message': 'Application submitted successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_job_details(self, job_id: str) -> Dict[str, Any]:
        """
        Fetch job details from Lever API.
        
        TODO: Implement to get additional job information
        """
        # Placeholder implementation
        return {
            'id': job_id,
            'text': 'Job Title',
            'categories': {
                'department': 'Engineering',
                'location': 'Remote',
                'team': 'Backend'
            },
            'additional': []
        }
    
    def get_application_status(self, application_id: str) -> Dict[str, Any]:
        """
        Check application status via Lever API.
        
        TODO: Implement to track application progress
        """
        # Placeholder implementation
        return {
            'id': application_id,
            'stage': 'new',
            'archived': False,
            'updated_at': None
        }
