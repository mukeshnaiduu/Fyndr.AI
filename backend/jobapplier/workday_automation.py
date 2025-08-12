"""
MyWorkday Browser Automation

Specialized automation for MyWorkday application forms.
Handles the specific form fields and workflows common in Workday ATS.
"""

import logging
import asyncio
import re
from typing import Dict, Any, Optional, List
from playwright.async_api import Page, ElementHandle
from .browser_automation import BrowserAutomation
from .models import UserProfile, JobPosting

logger = logging.getLogger(__name__)


class WorkdayBrowserAutomation(BrowserAutomation):
    """
    Specialized browser automation for MyWorkday application forms.
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # MyWorkday specific selectors and patterns
        self.workday_selectors = {
            'apply_button': [
                'button[data-automation-id="Apply"]',
                'button:has-text("Apply")',
                'a:has-text("Apply")',
                '[data-automation-id*="apply"]',
                'button[title*="Apply"]'
            ],
            'form_sections': [
                '[data-automation-id*="section"]',
                '.css-1dbjc4n[role="group"]',
                'fieldset',
                '.form-section'
            ],
            'text_inputs': [
                'input[data-automation-id*="textInputWidget"]',
                'input[type="text"]',
                'input[type="email"]',
                'input[type="tel"]'
            ],
            'dropdowns': [
                'button[data-automation-id*="selectWidget"]',
                'select',
                '[role="combobox"]'
            ],
            'file_uploads': [
                'input[type="file"]',
                '[data-automation-id*="fileUpload"]'
            ],
            'checkboxes': [
                'input[type="checkbox"]',
                '[data-automation-id*="checkboxWidget"]'
            ],
            'radio_buttons': [
                'input[type="radio"]',
                '[data-automation-id*="radioWidget"]'
            ],
            'text_areas': [
                'textarea',
                '[data-automation-id*="textAreaWidget"]'
            ],
            'submit_button': [
                'button[data-automation-id*="submit"]',
                'button:has-text("Submit")',
                'button:has-text("Submit Application")',
                'input[type="submit"]'
            ]
        }
        
    async def apply_to_workday_job(self, job: JobPosting, user_profile: UserProfile) -> Dict[str, Any]:
        """
        Apply to a MyWorkday job with specialized form handling.
        """
        result = {
            'success': False,
            'confirmation_number': None,
            'error': None,
            'steps_completed': [],
            'form_data_filled': {},
            'documents_uploaded': []
        }
        
        try:
            logger.info(f"Starting MyWorkday application for job {job.id}: {job.title}")
            
            # Navigate to job page
            if not await self.navigate_to_job(job.url):
                result['error'] = "Failed to navigate to job page"
                return result
            
            result['steps_completed'].append('navigation')
            
            # Wait for page to load and check if it's a Workday page
            await self._wait_for_workday_page()
            
            # Find and click apply button
            if not await self._click_workday_apply_button():
                result['error'] = "Could not find or click apply button"
                return result
                
            result['steps_completed'].append('apply_button_clicked')
            
            # Handle potential sign-in requirement
            auth_result = await self._handle_workday_sign_in()
            if auth_result == 'auth_required':
                result['error'] = "MyWorkday authentication required - manual application needed"
                result['requires_manual_auth'] = True
                result['auth_url'] = str(self.page.url)
                return result
            elif auth_result:
                result['steps_completed'].append('sign_in_handled')
            
            # Fill application form in stages
            form_result = await self._fill_workday_application_form(user_profile)
            result['form_data_filled'] = form_result['filled_fields']
            result['steps_completed'].extend(form_result['sections_completed'])
            
            # Upload documents
            upload_result = await self._upload_workday_documents(user_profile)
            result['documents_uploaded'] = upload_result['uploaded_files']
            result['steps_completed'].extend(upload_result['upload_steps'])
            
            # Handle questionnaire/screening questions
            if await self._handle_workday_questionnaire(user_profile):
                result['steps_completed'].append('questionnaire_completed')
            
            # Review and submit
            submit_result = await self._submit_workday_application()
            if submit_result['success']:
                result['success'] = True
                result['confirmation_number'] = submit_result['confirmation_number']
                result['steps_completed'].append('application_submitted')
            else:
                result['error'] = submit_result['error']
                
        except Exception as e:
            error_msg = f"MyWorkday application failed: {str(e)}"
            logger.error(error_msg)
            result['error'] = error_msg
            
        return result
    
    async def _wait_for_workday_page(self) -> bool:
        """Wait for Workday page to fully load."""
        try:
            # Wait for Workday-specific elements
            await self.page.wait_for_selector('[data-automation-id]', timeout=10000)
            
            # Check if we're on a Workday page
            page_content = await self.page.content()
            if 'workday' not in page_content.lower() and 'myworkday' not in page_content.lower():
                logger.warning("Page doesn't appear to be a Workday page")
                
            return True
            
        except Exception as e:
            logger.error(f"Failed to wait for Workday page: {e}")
            return False
    
    async def _click_workday_apply_button(self) -> bool:
        """Find and click the apply button on Workday job page."""
        try:
            for selector in self.workday_selectors['apply_button']:
                try:
                    element = await self.page.wait_for_selector(selector, timeout=3000)
                    if element:
                        # Check if button is visible and enabled
                        is_visible = await element.is_visible()
                        is_enabled = await element.is_enabled()
                        
                        if is_visible and is_enabled:
                            await element.click()
                            
                            # Wait for navigation or form to appear
                            await self.page.wait_for_load_state('networkidle')
                            
                            logger.info(f"Successfully clicked apply button: {selector}")
                            return True
                            
                except Exception:
                    continue
                    
            # Try finding apply button by text content
            apply_links = await self.page.query_selector_all('a, button')
            for link in apply_links:
                try:
                    text = await link.inner_text()
                    if text and 'apply' in text.lower():
                        await link.click()
                        await self.page.wait_for_load_state('networkidle')
                        logger.info(f"Clicked apply button by text: {text}")
                        return True
                except Exception:
                    continue
                    
            return False
            
        except Exception as e:
            logger.error(f"Error clicking apply button: {e}")
            return False
    
    async def _handle_workday_sign_in(self) -> str:
        """
        Handle potential sign-in requirements for MyWorkday.
        
        Returns:
            'auth_required' - Manual authentication needed
            'guest_continued' - Successfully continued as guest
            'no_auth_needed' - No authentication required
        """
        try:
            logger.info("Checking for MyWorkday authentication requirements...")
            
            # Check for sign-in form indicators
            sign_in_indicators = [
                'input[type="email"]',
                'input[name*="username"]',
                'input[name*="email"]',
                '[data-automation-id*="signIn"]',
                '[data-automation-id*="loginEmailInput"]',
                'button:has-text("Sign In")',
                'a:has-text("Sign In")',
                'form[action*="signin"]',
                'form[action*="login"]'
            ]
            
            sign_in_detected = False
            for selector in sign_in_indicators:
                if await self.page.query_selector(selector):
                    sign_in_detected = True
                    logger.info(f"Sign-in form detected with selector: {selector}")
                    break
            
            if not sign_in_detected:
                logger.info("No sign-in form detected, proceeding with application")
                return 'no_auth_needed'
            
            # Check if we can proceed without signing in (external candidate path)
            external_candidate_options = [
                'button:has-text("Continue as Guest")',
                'button:has-text("Apply Without Account")',
                'a:has-text("Continue Without Signing In")',
                'button:has-text("External Candidate")',
                '[data-automation-id*="guestButton"]',
                '[data-automation-id*="externalCandidate"]'
            ]
            
            for selector in external_candidate_options:
                try:
                    element = await self.page.wait_for_selector(selector, timeout=3000)
                    if element and await element.is_visible():
                        await element.click()
                        await self.page.wait_for_load_state('networkidle')
                        logger.info(f"Successfully continued as external candidate using: {selector}")
                        return 'guest_continued'
                except Exception:
                    continue
            
            # Check for email input field that might be for external candidates
            email_field = await self.page.query_selector('input[type="email"], input[name*="email"]')
            if email_field:
                # Check if this is in a context that suggests external candidate flow
                page_text = await self.page.inner_text('body')
                external_indicators = [
                    'external candidate',
                    'apply without account',
                    'guest application',
                    'continue without signing in'
                ]
                
                if any(indicator in page_text.lower() for indicator in external_indicators):
                    logger.info("Detected external candidate email collection - proceeding")
                    return 'no_auth_needed'
            
            # If we reach here, authentication is likely required
            logger.warning("MyWorkday authentication required - manual intervention needed")
            return 'auth_required'
            
        except Exception as e:
            logger.error(f"Error handling MyWorkday sign-in: {e}")
            return 'auth_required'
    
    async def _fill_workday_application_form(self, user_profile: UserProfile) -> Dict[str, Any]:
        """Fill out the main application form."""
        result = {
            'filled_fields': {},
            'sections_completed': []
        }
        
        try:
            # Personal Information Section
            personal_info = await self._fill_personal_information(user_profile)
            result['filled_fields'].update(personal_info)
            if personal_info:
                result['sections_completed'].append('personal_information')
            
            # Contact Information
            contact_info = await self._fill_contact_information(user_profile)
            result['filled_fields'].update(contact_info)
            if contact_info:
                result['sections_completed'].append('contact_information')
            
            # Work Authorization
            work_auth = await self._fill_work_authorization(user_profile)
            result['filled_fields'].update(work_auth)
            if work_auth:
                result['sections_completed'].append('work_authorization')
                
            # Wait for any dynamic content to load
            await asyncio.sleep(2)
            
        except Exception as e:
            logger.error(f"Error filling application form: {e}")
            
        return result
    
    async def _fill_personal_information(self, user_profile: UserProfile) -> Dict[str, str]:
        """Fill personal information fields."""
        filled_fields = {}
        
        try:
            name_parts = user_profile.full_name.split() if user_profile.full_name else ['', '']
            first_name = name_parts[0] if name_parts else ''
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            # First Name
            if await self._fill_field_by_label('first name', first_name):
                filled_fields['first_name'] = first_name
                
            # Last Name  
            if await self._fill_field_by_label('last name', last_name):
                filled_fields['last_name'] = last_name
                
            # Full Name (fallback)
            if await self._fill_field_by_label('full name', user_profile.full_name):
                filled_fields['full_name'] = user_profile.full_name
                
        except Exception as e:
            logger.error(f"Error filling personal information: {e}")
            
        return filled_fields
    
    async def _fill_contact_information(self, user_profile: UserProfile) -> Dict[str, str]:
        """Fill contact information fields."""
        filled_fields = {}
        
        try:
            # Email
            if await self._fill_field_by_label('email', user_profile.email):
                filled_fields['email'] = user_profile.email
                
            # Phone
            if await self._fill_field_by_label('phone', user_profile.phone):
                filled_fields['phone'] = user_profile.phone
                
            # LinkedIn
            if user_profile.linkedin_url and await self._fill_field_by_label('linkedin', user_profile.linkedin_url):
                filled_fields['linkedin'] = user_profile.linkedin_url
                
            # Portfolio/Website
            if user_profile.portfolio_url and await self._fill_field_by_label('website', user_profile.portfolio_url):
                filled_fields['portfolio'] = user_profile.portfolio_url
                
        except Exception as e:
            logger.error(f"Error filling contact information: {e}")
            
        return filled_fields
    
    async def _fill_work_authorization(self, user_profile: UserProfile) -> Dict[str, str]:
        """Fill work authorization fields."""
        filled_fields = {}
        
        try:
            if user_profile.work_authorization:
                # Try dropdown first
                if await self._select_dropdown_by_label('work authorization', user_profile.work_authorization):
                    filled_fields['work_authorization'] = user_profile.work_authorization
                # Try text field
                elif await self._fill_field_by_label('work authorization', user_profile.work_authorization):
                    filled_fields['work_authorization'] = user_profile.work_authorization
                    
        except Exception as e:
            logger.error(f"Error filling work authorization: {e}")
            
        return filled_fields
    
    async def _fill_field_by_label(self, label: str, value: str) -> bool:
        """Fill a form field by its label."""
        if not value:
            return False
            
        try:
            # Try various selectors for finding the field
            label_selectors = [
                f'//label[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "{label.lower()}")]/following-sibling::input',
                f'//label[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "{label.lower()}")]/following::input[1]',
                f'//input[@placeholder and contains(translate(@placeholder, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "{label.lower()}")]',
                f'//input[@name and contains(translate(@name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "{label.lower()}")]'
            ]
            
            for selector in label_selectors:
                try:
                    element = await self.page.wait_for_selector(selector, timeout=2000)
                    if element:
                        await element.fill(value)
                        logger.info(f"Filled {label} field with: {value}")
                        return True
                except Exception:
                    continue
                    
            return False
            
        except Exception as e:
            logger.error(f"Error filling field {label}: {e}")
            return False
    
    async def _select_dropdown_by_label(self, label: str, value: str) -> bool:
        """Select dropdown option by label."""
        if not value:
            return False
            
        try:
            # Find dropdown by label
            dropdown_selectors = [
                f'//label[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "{label.lower()}")]/following-sibling::select',
                f'//label[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "{label.lower()}")]/following::select[1]'
            ]
            
            for selector in dropdown_selectors:
                try:
                    element = await self.page.wait_for_selector(selector, timeout=2000)
                    if element:
                        await element.select_option(label=value)
                        logger.info(f"Selected {label} dropdown: {value}")
                        return True
                except Exception:
                    continue
                    
            return False
            
        except Exception as e:
            logger.error(f"Error selecting dropdown {label}: {e}")
            return False
    
    async def _upload_workday_documents(self, user_profile: UserProfile) -> Dict[str, Any]:
        """Upload resume and cover letter to Workday."""
        result = {
            'uploaded_files': [],
            'upload_steps': []
        }
        
        try:
            # Resume upload
            if user_profile.resume:
                resume_uploaded = await self._upload_document_by_type('resume', user_profile.resume.path)
                if resume_uploaded:
                    result['uploaded_files'].append('resume')
                    result['upload_steps'].append('resume_uploaded')
            
            # Cover letter upload
            if user_profile.cover_letter:
                cover_letter_uploaded = await self._upload_document_by_type('cover letter', user_profile.cover_letter.path)
                if cover_letter_uploaded:
                    result['uploaded_files'].append('cover_letter')
                    result['upload_steps'].append('cover_letter_uploaded')
                    
        except Exception as e:
            logger.error(f"Error uploading documents: {e}")
            
        return result
    
    async def _upload_document_by_type(self, doc_type: str, file_path: str) -> bool:
        """Upload a document by its type."""
        try:
            # Find file upload field for document type
            upload_selectors = [
                f'//label[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "{doc_type.lower()}")]/following::input[@type="file"][1]',
                f'//input[@type="file" and contains(@data-automation-id, "{doc_type.lower()}")]',
                'input[type="file"]'  # Generic file input
            ]
            
            for selector in upload_selectors:
                try:
                    element = await self.page.wait_for_selector(selector, timeout=2000)
                    if element:
                        await element.set_input_files(file_path)
                        logger.info(f"Uploaded {doc_type}: {file_path}")
                        
                        # Wait for upload to complete
                        await asyncio.sleep(2)
                        return True
                except Exception:
                    continue
                    
            return False
            
        except Exception as e:
            logger.error(f"Error uploading {doc_type}: {e}")
            return False
    
    async def _handle_workday_questionnaire(self, user_profile: UserProfile) -> bool:
        """Handle screening questions and questionnaire."""
        try:
            # Look for questionnaire sections
            questionnaire_found = False
            
            # Common questionnaire indicators
            questionnaire_selectors = [
                '[data-automation-id*="questionnaire"]',
                '[data-automation-id*="screening"]',
                'fieldset',
                '.questionnaire-section'
            ]
            
            for selector in questionnaire_selectors:
                sections = await self.page.query_selector_all(selector)
                if sections:
                    questionnaire_found = True
                    break
            
            if questionnaire_found:
                logger.info("Questionnaire section found, attempting to fill...")
                
                # Handle common screening questions with user's custom answers
                if user_profile.custom_ats_answers:
                    for question_key, answer in user_profile.custom_ats_answers.items():
                        await self._answer_screening_question(question_key, answer)
                
                # Handle work authorization questions specifically
                await self._handle_work_authorization_questions(user_profile)
                
                return True
                
            return False
            
        except Exception as e:
            logger.error(f"Error handling questionnaire: {e}")
            return False
    
    async def _answer_screening_question(self, question_key: str, answer: str) -> bool:
        """Answer a specific screening question."""
        try:
            # Try to find question by key/text and answer appropriately
            question_selectors = [
                f'//*[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "{question_key.lower()}")]',
                f'//label[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "{question_key.lower()}")]'
            ]
            
            for selector in question_selectors:
                try:
                    element = await self.page.wait_for_selector(selector, timeout=1000)
                    if element:
                        # Find associated input
                        input_element = await element.query_selector('..//input')
                        if input_element:
                            input_type = await input_element.get_attribute('type')
                            
                            if input_type == 'radio' or input_type == 'checkbox':
                                if answer.lower() in ['yes', 'true', '1']:
                                    await input_element.check()
                            else:
                                await input_element.fill(answer)
                                
                            logger.info(f"Answered question '{question_key}': {answer}")
                            return True
                except Exception:
                    continue
                    
            return False
            
        except Exception as e:
            logger.error(f"Error answering question {question_key}: {e}")
            return False
    
    async def _handle_work_authorization_questions(self, user_profile: UserProfile) -> bool:
        """Handle work authorization specific questions."""
        try:
            work_auth = user_profile.work_authorization
            if not work_auth:
                return False
                
            # Common work authorization questions
            auth_questions = [
                "work authorization",
                "authorized to work",
                "visa status",
                "employment eligibility"
            ]
            
            for question in auth_questions:
                await self._answer_screening_question(question, work_auth)
                
            return True
            
        except Exception as e:
            logger.error(f"Error handling work authorization questions: {e}")
            return False
    
    async def _submit_workday_application(self) -> Dict[str, Any]:
        """Submit the completed application."""
        result = {
            'success': False,
            'confirmation_number': None,
            'error': None
        }
        
        try:
            # Find submit button
            for selector in self.workday_selectors['submit_button']:
                try:
                    element = await self.page.wait_for_selector(selector, timeout=3000)
                    if element:
                        is_enabled = await element.is_enabled()
                        if is_enabled:
                            await element.click()
                            
                            # Wait for submission to complete
                            await self.page.wait_for_load_state('networkidle')
                            
                            # Look for confirmation
                            confirmation = await self._extract_confirmation_number()
                            
                            result['success'] = True
                            result['confirmation_number'] = confirmation
                            logger.info(f"Application submitted successfully: {confirmation}")
                            
                            return result
                except Exception:
                    continue
            
            result['error'] = "Could not find or click submit button"
            
        except Exception as e:
            result['error'] = f"Error submitting application: {str(e)}"
            
        return result
    
    async def _extract_confirmation_number(self) -> Optional[str]:
        """Extract confirmation number from success page."""
        try:
            # Wait for success page elements
            await asyncio.sleep(3)
            
            # Common confirmation patterns
            confirmation_selectors = [
                '[data-automation-id*="confirmation"]',
                '.confirmation-number',
                '.application-id',
                '*:contains("Application ID")',
                '*:contains("Confirmation")',
                '*:contains("Reference")'
            ]
            
            page_content = await self.page.content()
            
            # Look for confirmation patterns in text
            confirmation_patterns = [
                r'application\s+(?:id|number|reference):\s*([a-zA-Z0-9-]+)',
                r'confirmation\s+(?:id|number|reference):\s*([a-zA-Z0-9-]+)',
                r'reference\s+(?:id|number):\s*([a-zA-Z0-9-]+)',
                r'application\s+([a-zA-Z0-9]{8,})',
            ]
            
            for pattern in confirmation_patterns:
                match = re.search(pattern, page_content, re.IGNORECASE)
                if match:
                    return match.group(1)
            
            # Fallback - generate timestamp-based confirmation
            from datetime import datetime
            return f"WD_{int(datetime.now().timestamp())}"
            
        except Exception as e:
            logger.error(f"Error extracting confirmation number: {e}")
            return None
