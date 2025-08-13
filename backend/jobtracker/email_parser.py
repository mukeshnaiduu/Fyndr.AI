"""
Email parsing module for automatic application status detection.

This module handles parsing of job application related emails to automatically
update application statuses based on email content and patterns.
"""

import re
import logging
from typing import Dict, Optional, Tuple
from datetime import datetime
from email.message import EmailMessage
from email.utils import parsedate_to_datetime

logger = logging.getLogger(__name__)


class EmailStatusParser:
    """
    Parses emails to extract application status updates.
    """
    
    # Email patterns for different status types
    STATUS_PATTERNS = {
        'applied': [
            r'thank you for applying',
            r'application received',
            r'we have received your application',
            r'your application has been submitted',
            r'application confirmation',
            r'we received your resume'
        ],
        'interview': [
            r'interview',
            r'would like to schedule',
            r'phone screening',
            r'video call',
            r'in-person meeting',
            r'next steps',
            r'technical assessment',
            r'coding challenge'
        ],
        'rejected': [
            r'we regret to inform',
            r'unfortunately',
            r'not moving forward',
            r'position has been filled',
            r'we will not be proceeding',
            r'thank you for your interest, however',
            r'we have decided to pursue other candidates',
            r'not selected for this position'
        ],
        'offer': [
            r'offer of employment',
            r'job offer',
            r'pleased to offer',
            r'extend an offer',
            r'offer letter',
            r'compensation package',
            r'we would like to hire you'
        ]
    }
    
    # Company domains to track
    TRACKED_DOMAINS = [
        'greenhouse.io',
        'lever.co',
        'workday.com',
        'smartrecruiters.com',
        'bamboohr.com',
        'icims.com',
        'jobvite.com'
    ]

    def parse_status_from_email(self, raw_email: str) -> Dict[str, Optional[str]]:
        """
        Parse raw email content to extract application status information.
        
        Args:
            raw_email (str): Raw email content or EmailMessage object
            
        Returns:
            Dict containing:
                - application_id: Extracted application/job ID if found
                - status: Detected status (applied, interview, rejected, offer)
                - notes: Extracted relevant information
                - confidence: Confidence score (0.0-1.0)
                - company: Company name if detected
        """
        try:
            # Handle both string and EmailMessage inputs
            if isinstance(raw_email, str):
                email_content = raw_email.lower()
                subject = ""
                sender = ""
            else:
                email_content = str(raw_email.get_payload()).lower()
                subject = raw_email.get('subject', '').lower()
                sender = raw_email.get('from', '').lower()
            
            result = {
                'application_id': None,
                'status': None,
                'notes': None,
                'confidence': 0.0,
                'company': None,
                'sender': sender
            }
            
            # Extract company name from sender domain
            company = self._extract_company_from_sender(sender)
            if company:
                result['company'] = company
            
            # Extract application/job ID
            application_id = self._extract_application_id(email_content + " " + subject)
            if application_id:
                result['application_id'] = application_id
            
            # Determine status based on content patterns
            status, confidence = self._detect_status(email_content + " " + subject)
            result['status'] = status
            result['confidence'] = confidence
            
            # Extract relevant notes/context
            notes = self._extract_notes(email_content, status)
            result['notes'] = notes
            
            logger.info(f"Parsed email: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error parsing email: {e}")
            return {
                'application_id': None,
                'status': None,
                'notes': f"Parse error: {e}",
                'confidence': 0.0,
                'company': None,
                'sender': None
            }

    def _extract_company_from_sender(self, sender: str) -> Optional[str]:
        """Extract company name from sender email address."""
        if not sender:
            return None
            
        # Extract domain
        domain_match = re.search(r'@([^>]+)', sender)
        if not domain_match:
            return None
            
        domain = domain_match.group(1).strip()
        
        # Check if it's a known ATS domain
        for ats_domain in self.TRACKED_DOMAINS:
            if ats_domain in domain:
                return f"ATS_{ats_domain}"
        
        # Extract company name from domain
        company_parts = domain.split('.')
        if len(company_parts) >= 2:
            return company_parts[0].capitalize()
        
        return domain

    def _extract_application_id(self, content: str) -> Optional[str]:
        """Extract application ID, job ID, or reference number from email content."""
        # Common patterns for application IDs
        patterns = [
            r'application\s*(?:id|number|ref(?:erence)?)\s*:?\s*([a-zA-Z0-9\-_]+)',
            r'job\s*(?:id|number|ref(?:erence)?)\s*:?\s*([a-zA-Z0-9\-_]+)',
            r'reference\s*(?:id|number)?\s*:?\s*([a-zA-Z0-9\-_]+)',
            r'req\s*(?:id|number)?\s*:?\s*([a-zA-Z0-9\-_]+)',
            r'position\s*(?:id|number)?\s*:?\s*([a-zA-Z0-9\-_]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None

    def _detect_status(self, content: str) -> Tuple[Optional[str], float]:
        """Detect application status from email content with confidence score."""
        status_scores = {}
        
        for status, patterns in self.STATUS_PATTERNS.items():
            score = 0
            for pattern in patterns:
                matches = len(re.findall(pattern, content, re.IGNORECASE))
                score += matches
            
            if score > 0:
                # Normalize score based on content length and pattern specificity
                normalized_score = min(score / len(patterns), 1.0)
                status_scores[status] = normalized_score
        
        if not status_scores:
            return None, 0.0
        
        # Return status with highest confidence
        best_status = max(status_scores, key=status_scores.get)
        confidence = status_scores[best_status]
        
        return best_status, confidence

    def _extract_notes(self, content: str, status: str) -> str:
        """Extract relevant notes based on detected status."""
        notes = []
        
        if status == 'interview':
            # Look for interview details
            interview_patterns = [
                r'((?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^.]*)',
                r'(\d{1,2}:\d{2}[^.]*)',
                r'(zoom|teams|skype|phone|in-person[^.]*)'
            ]
            
            for pattern in interview_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                notes.extend(matches[:2])  # Limit to avoid too much text
        
        elif status == 'rejected':
            # Look for feedback or reason
            feedback_patterns = [
                r'(we have decided[^.]*)',
                r'(unfortunately[^.]*)',
                r'(we will not be proceeding[^.]*)'
            ]
            
            for pattern in feedback_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                notes.extend(matches[:1])
        
        elif status == 'offer':
            # Look for offer details
            offer_patterns = [
                r'(salary[^.]*)',
                r'(compensation[^.]*)',
                r'(start date[^.]*)',
                r'(benefits[^.]*)'
            ]
            
            for pattern in offer_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                notes.extend(matches[:2])
        
        return '. '.join(notes) if notes else f"Auto-detected {status} status from email"


def integrate_gmail_api():
    """
    TODO: Integrate Gmail API for automatic email monitoring.
    
    This function should:
    1. Authenticate with Gmail API using OAuth2
    2. Set up webhook/polling for new emails
    3. Filter emails related to job applications
    4. Parse emails using EmailStatusParser
    5. Update ApplicationStatusHistory automatically
    
    Future implementation should include:
    - OAuth2 authentication flow
    - Gmail API query filters for job-related emails
    - Real-time email processing
    - Error handling and retry logic
    - Rate limiting compliance
    """
    logger.info("Gmail API integration not yet implemented")
    pass


def integrate_outlook_api():
    """
    TODO: Integrate Microsoft Graph API for Outlook email monitoring.
    
    Similar to Gmail API but using Microsoft Graph:
    1. Azure AD authentication
    2. Microsoft Graph API for email access
    3. Webhook subscriptions for real-time updates
    4. Email parsing and status extraction
    """
    logger.info("Outlook API integration not yet implemented")
    pass


def classify_email_with_ai(email_content: str, subject: str) -> Dict[str, str]:
    """
    TODO: Use AI/LLM to classify email content with higher accuracy.
    
    This function should:
    1. Send email content to an LLM (OpenAI, Claude, etc.)
    2. Use prompts designed for job application email classification
    3. Return structured classification results
    4. Handle edge cases and uncertain classifications
    
    Example prompt:
    "Classify this job application email. Return JSON with status 
    (applied/interview/rejected/offer), confidence (0-1), and reasoning."
    
    Args:
        email_content (str): Email body content
        subject (str): Email subject line
        
    Returns:
        Dict with AI classification results
    """
    logger.info("AI email classification not yet implemented")
    return {
        'status': None,
        'confidence': 0.0,
        'reasoning': 'AI classification not available'
    }


# Usage example for testing
if __name__ == "__main__":
    parser = EmailStatusParser()
    
    # Test email examples
    test_emails = [
        "Thank you for applying to Software Engineer position. We have received your application and will review it.",
        "We regret to inform you that we will not be moving forward with your application at this time.",
        "We would like to schedule an interview for the position. Are you available next Tuesday at 2 PM?",
        "We are pleased to extend an offer of employment for the Software Engineer position."
    ]
    
    for email in test_emails:
        result = parser.parse_status_from_email(email)
        print(f"Email: {email[:50]}...")
        print(f"Result: {result}")
        print("-" * 50)
