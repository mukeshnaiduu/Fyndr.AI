import logging
import requests
from typing import Dict, Any, Optional
from ..models import JobPosting, UserProfile

logger = logging.getLogger(__name__)


class GreenhouseClient:
    """
    API client for Greenhouse ATS system.
    
    Greenhouse API Documentation: https://developers.greenhouse.io/
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://api.greenhouse.io/v1"
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            })
    
    def apply_via_api(self, job: JobPosting, user_profile: UserProfile) -> Dict[str, Any]:
        """
        Apply to a job via Greenhouse API.
        
        Args:
            job: JobPosting instance containing job details
            user_profile: UserProfile instance with applicant details
            
        Returns:
            Dict containing:
                - status: 'success' or 'failed'
                - confirmation_number: Application ID if successful
                - error: Error message if failed
        """
        logger.info(f"Applying to Greenhouse job {job.external_id} for user {user_profile.full_name}")
        
        # TODO: Implement actual Greenhouse API integration
        # This is a placeholder implementation
        
        try:
            # Extract job ID from external_id or URL
            job_id = self._extract_job_id(job)
            if not job_id:
                return {
                    'status': 'failed',
                    'confirmation_number': None,
                    'error': 'Could not extract Greenhouse job ID'
                }
            
            # Prepare application payload
            application_data = self._prepare_application_data(job, user_profile)
            
            # Submit application via API
            response = self._submit_application(job_id, application_data, user_profile)
            
            if response['success']:
                logger.info(f"Successfully applied to Greenhouse job {job_id}")
                return {
                    'status': 'success',
                    'confirmation_number': response.get('application_id'),
                    'error': None
                }
            else:
                logger.error(f"Failed to apply to Greenhouse job {job_id}: {response.get('error')}")
                return {
                    'status': 'failed',
                    'confirmation_number': None,
                    'error': response.get('error', 'Unknown error')
                }
                
        except Exception as e:
            error_msg = f"Exception applying to Greenhouse job: {str(e)}"
            logger.error(error_msg)
            return {
                'status': 'failed',
                'confirmation_number': None,
                'error': error_msg
            }
    
    def _extract_job_id(self, job: JobPosting) -> Optional[str]:
        """
        Extract Greenhouse job ID from external_id or URL.
        
        Greenhouse URLs typically look like:
        https://boards.greenhouse.io/company/jobs/12345
        """
        # Try external_id first
        if job.external_id and job.external_id.isdigit():
            return job.external_id
            
        # Try to extract from URL
        if job.url:
            import re
            # Pattern for Greenhouse job URLs
            match = re.search(r'/jobs/(\d+)', job.url)
            if match:
                return match.group(1)
                
        return None
    
    def _prepare_application_data(self, job: JobPosting, user_profile: UserProfile) -> Dict[str, Any]:
        """
        Prepare application data payload for Greenhouse API.
        """
        # TODO: Implement based on Greenhouse API specification
        return {
            'first_name': user_profile.full_name.split()[0] if user_profile.full_name else '',
            'last_name': ' '.join(user_profile.full_name.split()[1:]) if len(user_profile.full_name.split()) > 1 else '',
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
            'answers': self._prepare_custom_answers(user_profile),
            'source': 'API Application',
            'notes': f'Application submitted via automated system for {job.title} at {job.company}'
        }
    
    def _prepare_custom_answers(self, user_profile: UserProfile) -> list:
        """
        Prepare custom question answers from user profile.
        """
        answers = []
        
        # Common Greenhouse questions mapping
        question_mappings = {
            'work_authorization': user_profile.work_authorization,
            'linkedin_url': user_profile.linkedin_url,
            'portfolio_url': user_profile.portfolio_url,
        }
        
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
        Submit application to Greenhouse API.
        
        This is a placeholder - actual implementation would depend on
        Greenhouse API endpoints and authentication.
        """
        # TODO: Implement actual API call
        # Example endpoint: POST /v1/jobs/{job_id}/applications
        
        try:
            # Placeholder response
            logger.info(f"[PLACEHOLDER] Would submit application to Greenhouse job {job_id}")
            logger.info(f"[PLACEHOLDER] Application data: {application_data}")
            
            # Simulate successful response
            return {
                'success': True,
                'application_id': f"GH_{job_id}_{user_profile.user.id}",
                'message': 'Application submitted successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_job_details(self, job_id: str) -> Dict[str, Any]:
        """
        Fetch job details from Greenhouse API.
        
        TODO: Implement to get additional job information
        """
        # Placeholder implementation
        return {
            'id': job_id,
            'title': 'Job Title',
            'department': 'Engineering',
            'location': 'Remote',
            'custom_fields': []
        }
    
    def get_application_status(self, application_id: str) -> Dict[str, Any]:
        """
        Check application status via Greenhouse API.
        
        TODO: Implement to track application progress
        """
        # Placeholder implementation
        return {
            'id': application_id,
            'status': 'submitted',
            'stage': 'Application Review',
            'updated_at': None
        }
