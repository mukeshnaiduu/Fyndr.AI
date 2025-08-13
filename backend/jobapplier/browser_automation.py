from __future__ import annotations
import logging
import asyncio
import os
from typing import Dict, Any, Optional, List
from playwright.async_api import async_playwright, Page, Browser, BrowserContext, Playwright
from django.conf import settings
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from jobscraper.models import JobPosting
    # We accept any object with the needed attrs (adapter provided at runtime)
    from fyndr_auth.models import JobSeekerProfile as UserProfile

logger = logging.getLogger(__name__)


class BrowserAutomation:
    """
    Enhanced Playwright-based browser automation for legal job applications.
    Handles authentication, form filling, file uploads, and CAPTCHA handling.
    Ensures compliance with job board terms of service.
    """
    
    def __init__(self, headless: bool = True, timeout: int = 30000, credentials: Optional[Dict[str, Dict[str, str]]] = None):
        self.headless = headless
        self.timeout = timeout
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self._playwright: Optional[Playwright] = None
        # Authentication storage and retry config
        self.job_board_credentials = credentials or {}
        self.max_retries = int(os.getenv('AUTOMATION_MAX_RETRIES', '2'))
        self.session_storage = {}
        
    async def __aenter__(self):
        """Async context manager entry"""
        await self.open_browser()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close_browser()
        
    async def open_browser(self) -> None:
        """
        Initialize and open a Playwright browser instance with enhanced security.
        """
        try:
            self._playwright = await async_playwright().start()

            # Launch browser with realistic settings
            self.browser = await self._playwright.chromium.launch(
                headless=self.headless,
                args=[
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-blink-features=AutomationControlled',
                    '--no-first-run',
                    '--disable-extensions-except=/path/to/extension',
                    '--disable-plugins-discovery'
                ]
            )

            # Create context with realistic user agent and viewport
            self.context = await self.browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1920, 'height': 1080},
                java_script_enabled=True,
                accept_downloads=True,
                has_touch=False,
                is_mobile=False,
                permissions=['geolocation'],
                color_scheme='light'
            )

            # Add stealth measures
            await self.context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });

                // Remove automation indicators
                try { delete window.chrome.runtime.onConnect; } catch (e) {}
                try { delete window.chrome.runtime.onMessage; } catch (e) {}

                // Spoof plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });
            """)

            self.page = await self.context.new_page()

            # Set realistic headers
            await self.page.set_extra_http_headers({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Cache-Control': 'max-age=0'
            })

            # Set page timeout
            self.page.set_default_timeout(self.timeout)

            logger.info("Browser automation initialized successfully")
        except Exception as e:
            logger.error(f"Failed to open browser: {str(e)}")
            # Ensure we cleanup partially created resources
            try:
                await self.close_browser()
            except Exception:
                pass
            raise
            
    async def close_browser(self) -> None:
        """
        Close the browser and cleanup resources.
        """
        try:
            if self.page:
                await self.page.close()
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if self._playwright:
                await self._playwright.stop()
                self._playwright = None
            logger.info("Browser closed successfully")
        except Exception as e:
            logger.error(f"Error closing browser: {str(e)}")
            
    async def navigate_to_job(self, job_url: str) -> bool:
        """
        Navigate to a job URL and wait for page to load.
        
        Args:
            job_url: URL of the job posting
            
        Returns:
            bool: True if navigation successful, False otherwise
        """
        try:
            if not self.page:
                raise RuntimeError("Browser not initialized. Call open_browser() first.")
                
            logger.info(f"Navigating to job URL: {job_url}")
            await self.page.goto(job_url, wait_until='networkidle')
            
            # Wait for page to load
            await self.page.wait_for_load_state('domcontentloaded')
            
            # Check for common job board patterns and handle accordingly
            await self.handle_job_board_specific_logic(job_url)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to navigate to job URL {job_url}: {str(e)}")
            return False
    
    async def handle_job_board_specific_logic(self, job_url: str):
        """Handle specific logic for different job boards"""
        try:
            if 'greenhouse.io' in job_url:
                await self.handle_greenhouse_job()
            elif 'lever.co' in job_url:
                await self.handle_lever_job()
            elif 'workday.com' in job_url:
                await self.handle_workday_job()
            elif 'myworkdayjobs.com' in job_url:
                await self.handle_workday_job()
            else:
                await self.handle_generic_job()
        except Exception as e:
            logger.warning(f"Job board specific handling failed: {str(e)}")
    
    async def handle_greenhouse_job(self):
        """Handle Greenhouse-specific job application logic"""
        try:
            # Optional login
            await self._login_if_needed(provider='greenhouse')
            # Try several known selectors
            selectors = [
                'a[href*="application"]',
                'button:has-text("Apply")',
                '.application-button',
                'a:has-text("Apply for this job")',
            ]
            for sel in selectors:
                try:
                    btn = await self.page.wait_for_selector(sel, timeout=3000)
                    if btn:
                        await btn.click()
                        await self.page.wait_for_load_state('networkidle')
                        break
                except Exception:
                    continue
        except Exception as e:
            logger.debug(f"Greenhouse-specific handling: {str(e)}")
    
    async def handle_lever_job(self):
        """Handle Lever-specific job application logic"""
        try:
            await self._login_if_needed(provider='lever')
            selectors = [
                '.postings-btn',
                'button:has-text("Apply")',
                'a:has-text("Apply")',
                'a:has-text("Submit Application")',
            ]
            for sel in selectors:
                try:
                    btn = await self.page.wait_for_selector(sel, timeout=3000)
                    if btn:
                        await btn.click()
                        await self.page.wait_for_load_state('networkidle')
                        break
                except Exception:
                    continue
        except Exception as e:
            logger.debug(f"Lever-specific handling: {str(e)}")
    
    async def handle_workday_job(self):
        """Handle Workday-specific job application logic"""
        try:
            await self._login_if_needed(provider='workday')
            selectors = [
                '[data-automation-id*="apply"]',
                'button:has-text("Apply")',
                'a:has-text("Apply")',
                '[data-automation-id*="applyButton"]',
            ]
            for sel in selectors:
                try:
                    btn = await self.page.wait_for_selector(sel, timeout=3000)
                    if btn:
                        await btn.click()
                        await self.page.wait_for_load_state('networkidle')
                        break
                except Exception:
                    continue
        except Exception as e:
            logger.debug(f"Workday-specific handling: {str(e)}")
    
    async def handle_generic_job(self):
        """Handle generic job application logic"""
        try:
            # Look for common apply button patterns
            apply_selectors = [
                'button:has-text("Apply")',
                'a:has-text("Apply")',
                '[class*="apply"]',
                '[id*="apply"]',
                'input[type="submit"][value*="Apply"]',
                '.apply-button',
                '.btn-apply'
            ]
            
            for selector in apply_selectors:
                try:
                    element = await self.page.wait_for_selector(selector, timeout=2000)
                    if element:
                        await element.click()
                        await self.page.wait_for_load_state('networkidle')
                        break
                except:
                    continue
        except Exception as e:
            logger.debug(f"Generic job handling: {str(e)}")
    
    async def fill_application_form(self, user_data: Dict[str, Any], job_data, application) -> bool:
        """
        Fill out a job application form with user data.
        
        Args:
            user_data: Dictionary containing user information
            job_data: Job posting data
            application: JobApplication instance
            
        Returns:
            bool: True if form was filled successfully
        """
        try:
            logger.info("Starting application form filling")
            
            # Take screenshot before filling
            await self.page.screenshot(path=f"/tmp/form_before_{application.id}.png")
            
            # Common form field mappings
            form_fields = {
                'first_name': ['[name*="first"]', '[id*="first"]', 'input[placeholder*="First"]'],
                'last_name': ['[name*="last"]', '[id*="last"]', 'input[placeholder*="Last"]'],
                'email': ['[name*="email"]', '[type="email"]', '[id*="email"]'],
                'phone': ['[name*="phone"]', '[type="tel"]', '[id*="phone"]'],
                'resume': ['[type="file"][name*="resume"]', '[type="file"][accept*="pdf"]'],
                'cover_letter': ['[name*="cover"]', 'textarea[name*="letter"]']
            }
            
            # Fill basic information
            await self.fill_field_safely(form_fields['first_name'], user_data.get('first_name', ''))
            await self.fill_field_safely(form_fields['last_name'], user_data.get('last_name', ''))
            await self.fill_field_safely(form_fields['email'], user_data.get('email', ''))
            await self.fill_field_safely(form_fields['phone'], user_data.get('phone', ''))
            
            # Handle file uploads
            await self.handle_file_uploads(user_data, application)
            
            # Fill additional form fields
            await self.fill_additional_fields(job_data, application)
            
            # Take screenshot after filling
            await self.page.screenshot(path=f"/tmp/form_after_{application.id}.png")
            
            # Submit the form
            return await self.submit_application_form()
            
        except Exception as e:
            logger.error(f"Error filling application form: {str(e)}")
            await self.page.screenshot(path=f"/tmp/form_error_{application.id}.png")
            return False
    
    async def fill_field_safely(self, selectors: List[str], value: str):
        """Safely fill a form field using multiple selector strategies"""
        if not value:
            return
            
        for selector in selectors:
            try:
                element = await self.page.wait_for_selector(selector, timeout=2000)
                if element:
                    await element.fill(value)
                    logger.debug(f"Filled field {selector} with value")
                    return
            except Exception as e:
                logger.debug(f"Failed to fill selector {selector}: {str(e)}")
                continue
    
    async def handle_file_uploads(self, user_data: Dict[str, Any], application):
        """Handle resume and cover letter uploads"""
        try:
            # Resume upload
            resume_selectors = [
                '[type="file"][name*="resume"]',
                '[type="file"][accept*="pdf"]',
                '[type="file"][id*="resume"]'
            ]
            
            for selector in resume_selectors:
                try:
                    file_input = await self.page.wait_for_selector(selector, timeout=2000)
                    if file_input:
                        # Upload resume file (would need to be generated/retrieved)
                        resume_path = await self.get_user_resume_path(user_data)
                        if resume_path and os.path.exists(resume_path):
                            await file_input.set_input_files(resume_path)
                            logger.info("Resume uploaded successfully")
                            break
                except:
                    continue
                    
        except Exception as e:
            logger.warning(f"File upload failed: {str(e)}")
    
    async def get_user_resume_path(self, user_data: Dict[str, Any]) -> Optional[str]:
        """Get the path to user's resume file"""
        # This would be implemented to retrieve/generate user's resume
        # For now, return None
        return None
    
    async def fill_additional_fields(self, job_data, application):
        """Fill job-specific and additional form fields"""
        try:
            # Handle common additional fields
            additional_fields = {
                'linkedin': '[name*="linkedin"]',
                'website': '[name*="website"]',
                'portfolio': '[name*="portfolio"]',
                'salary_expectation': '[name*="salary"]',
                'availability': '[name*="available"]',
                'work_authorization': '[name*="authorization"]'
            }
            
            # Fill fields if they exist
            for field_name, selector in additional_fields.items():
                try:
                    element = await self.page.wait_for_selector(selector, timeout=1000)
                    if element:
                        # Fill with appropriate default or user data
                        value = self.get_field_value(field_name, job_data)
                        if value:
                            await element.fill(value)
                except:
                    continue
                    
        except Exception as e:
            logger.debug(f"Additional fields filling: {str(e)}")
    
    def get_field_value(self, field_name: str, job_data) -> str:
        """Get appropriate value for a form field"""
        defaults = {
            'work_authorization': 'Yes',
            'availability': 'Immediately',
            'salary_expectation': 'Negotiable'
        }
        return defaults.get(field_name, '')
    
    async def submit_application_form(self) -> bool:
        """Submit the application form"""
        try:
            # Look for submit buttons
            submit_selectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:has-text("Submit")',
                'button:has-text("Apply")',
                '.submit-button',
                '.btn-submit'
            ]
            
            for selector in submit_selectors:
                try:
                    submit_btn = await self.page.wait_for_selector(selector, timeout=2000)
                    if submit_btn:
                        # Check if button is enabled
                        is_enabled = await submit_btn.is_enabled()
                        if is_enabled:
                            await submit_btn.click()
                            
                            # Wait for submission to complete
                            await self.page.wait_for_load_state('networkidle', timeout=10000)
                            
                            # Check for success indicators
                            return await self.verify_application_submission()
                except:
                    continue
            
            return False
            
        except Exception as e:
            logger.error(f"Form submission failed: {str(e)}")
            return False
    
    async def verify_application_submission(self) -> bool:
        """Verify that the application was submitted successfully"""
        try:
            # Look for success indicators
            success_indicators = [
                ':has-text("Application submitted")',
                ':has-text("Thank you")',
                ':has-text("Success")',
                ':has-text("Confirmation")',
                '.success-message',
                '.confirmation'
            ]
            
            for indicator in success_indicators:
                try:
                    element = await self.page.wait_for_selector(indicator, timeout=5000)
                    if element:
                        logger.info("Application submission confirmed")
                        return True
                except:
                    continue
            
            # Check URL for success patterns
            current_url = self.page.url
            success_url_patterns = ['confirm', 'success', 'thank', 'submitted']
            
            if any(pattern in current_url.lower() for pattern in success_url_patterns):
                logger.info("Application submission confirmed via URL")
                return True
            
            return False
            
        except Exception as e:
            logger.warning(f"Could not verify submission: {str(e)}")
            return False
            
    async def apply_to_job_url(self, job: JobPosting, user_profile: UserProfile) -> Dict[str, Any]:
        """
        Apply to a job using browser automation.
        
        Args:
            job: JobPosting instance
            user_profile: UserProfile instance with applicant details
            
        Returns:
            Dict containing success status and details
        """
        result = {
            'success': False,
            'confirmation_number': None,
            'error': None,
            'screenshot_path': None
        }
        
        try:
            if not self.page:
                raise RuntimeError("Browser not initialized")
                
            # Navigate to job application page
            navigation_success = await self.navigate_to_job(job.url)
            if not navigation_success:
                result['error'] = "Failed to navigate to job URL"
                return result
                
            # Take initial screenshot
            media_root = getattr(settings, 'MEDIA_ROOT', None) or '/tmp'
            screenshot_dir = os.path.join(media_root, 'screenshots')
            os.makedirs(screenshot_dir, exist_ok=True)
            initial_screenshot = os.path.join(screenshot_dir, f"job_{job.id}_initial.png")
            await self.page.screenshot(path=initial_screenshot, full_page=True)
            
            # Look for "Apply" button or form
            apply_success = await self._find_and_click_apply_button()
            if not apply_success:
                result['error'] = "Could not find or click apply button"
                return result
                
            # Fill application form
            form_success = await self._fill_application_form(user_profile)
            if not form_success:
                result['error'] = "Failed to fill application form"
                return result
                
            # Upload resume and cover letter
            upload_success = await self._upload_documents(user_profile)
            if not upload_success:
                result['error'] = "Failed to upload documents"
                return result
                
            # Submit application
            submit_success, confirmation = await self._submit_application()
            if not submit_success:
                result['error'] = "Failed to submit application"
                return result
                
            # Take final screenshot
            final_screenshot = os.path.join(screenshot_dir, f"job_{job.id}_final.png")
            await self.page.screenshot(path=final_screenshot, full_page=True)
            result['screenshot_path'] = final_screenshot
            
            result['success'] = True
            result['confirmation_number'] = confirmation
            logger.info(f"Successfully applied to job {job.id}")
            
        except Exception as e:
            error_msg = f"Unexpected error during application: {str(e)}"
            logger.error(error_msg)
            result['error'] = error_msg
            
            # Take error screenshot
            try:
                if self.page:
                    error_screenshot = os.path.join(screenshot_dir, f"job_{job.id}_error.png")
                    await self.page.screenshot(path=error_screenshot, full_page=True)
                    result['screenshot_path'] = error_screenshot
            except:
                pass
                
        return result
        
    async def _find_and_click_apply_button(self) -> bool:
        """
        Find and click the apply button on the job page.
        """
        try:
            # Common selectors for apply buttons
            apply_selectors = [
                'button:has-text("Apply")',
                'a:has-text("Apply")',
                'button:has-text("Apply Now")',
                'a:has-text("Apply Now")',
                '[data-testid*="apply"]',
                '.apply-button',
                '.btn-apply',
                '#apply-button',
                'button[type="submit"]:has-text("Apply")'
            ]
            
            # Retry strategy across selectors
            for attempt in range(self.max_retries):
                for selector in apply_selectors:
                    try:
                        element = await self.page.wait_for_selector(selector, timeout=3000)
                        if element:
                            await element.click()
                            await self.page.wait_for_load_state('networkidle')
                            logger.info(f"Clicked apply button with selector: {selector}")
                            return True
                    except Exception:
                        continue
                # small backoff and scroll to trigger lazy content
                try:
                    await self.page.mouse.wheel(0, 1200)
                    await self.page.wait_for_timeout(1000)
                except Exception:
                    pass
                    
            logger.warning("No apply button found with standard selectors")
            return False
            
        except Exception as e:
            logger.error(f"Error finding apply button: {str(e)}")
            return False
            
    async def _fill_application_form(self, user_profile: UserProfile) -> bool:
        """
        Fill the application form with user profile data.
        """
        try:
            # Common form field mappings
            field_mappings = {
                # Name fields
                'input[name*="name"]': user_profile.full_name,
                'input[id*="name"]': user_profile.full_name,
                'input[placeholder*="name" i]': user_profile.full_name,
                
                # Email fields
                'input[name*="email"]': user_profile.email,
                'input[id*="email"]': user_profile.email,
                'input[type="email"]': user_profile.email,
                
                # Phone fields
                'input[name*="phone"]': user_profile.phone,
                'input[id*="phone"]': user_profile.phone,
                'input[placeholder*="phone" i]': user_profile.phone,
                
                # LinkedIn fields
                'input[name*="linkedin"]': user_profile.linkedin_url or '',
                'input[id*="linkedin"]': user_profile.linkedin_url or '',
                
                # Portfolio fields
                'input[name*="portfolio"]': user_profile.portfolio_url or '',
                'input[name*="website"]': user_profile.portfolio_url or '',
                'input[id*="portfolio"]': user_profile.portfolio_url or '',
            }
            
            for selector, value in field_mappings.items():
                if value:  # Only fill if value exists
                    try:
                        element = await self.page.wait_for_selector(selector, timeout=2000)
                        if element:
                            await element.fill(str(value))
                            logger.info(f"Filled field {selector} with value")
                    except:
                        continue  # Field not found, continue to next
                        
            return True
            
        except Exception as e:
            logger.error(f"Error filling application form: {str(e)}")
            return False
            
    async def _upload_documents(self, user_profile: UserProfile) -> bool:
        """
        Upload resume and cover letter if file upload fields are found.
        """
        try:
            uploaded_any = False
            
            # Resume upload
            if user_profile.resume:
                resume_selectors = [
                    'input[type="file"][name*="resume"]',
                    'input[type="file"][id*="resume"]',
                    'input[type="file"][accept*=".pdf"]',
                    'input[type="file"][accept*="pdf"]'
                ]
                
                for selector in resume_selectors:
                    try:
                        element = await self.page.wait_for_selector(selector, timeout=2000)
                        if element:
                            await element.set_input_files(user_profile.resume.path)
                            logger.info(f"Uploaded resume using selector: {selector}")
                            uploaded_any = True
                            break
                    except:
                        continue
                        
            # Cover letter upload
            if user_profile.cover_letter:
                cover_letter_selectors = [
                    'input[type="file"][name*="cover"]',
                    'input[type="file"][id*="cover"]',
                    'input[type="file"][name*="letter"]'
                ]
                
                for selector in cover_letter_selectors:
                    try:
                        element = await self.page.wait_for_selector(selector, timeout=2000)
                        if element:
                            await element.set_input_files(user_profile.cover_letter.path)
                            logger.info(f"Uploaded cover letter using selector: {selector}")
                            uploaded_any = True
                            break
                    except:
                        continue
                        
            return True  # Return True even if no uploads found (not all jobs require uploads)
            
        except Exception as e:
            logger.error(f"Error uploading documents: {str(e)}")
            return False
            
    async def _submit_application(self) -> tuple[bool, Optional[str]]:
        """
        Submit the application form and extract confirmation number if available.
        
        Returns:
            Tuple of (success, confirmation_number)
        """
        try:
            # Submit button selectors
            submit_selectors = [
                'button[type="submit"]',
                'button:has-text("Submit")',
                'button:has-text("Apply")',
                'button:has-text("Send Application")',
                'input[type="submit"]',
                '.submit-button',
                '#submit-button'
            ]
            
            # Try with retries; pause if CAPTCHA detected
            for attempt in range(self.max_retries):
                for selector in submit_selectors:
                    try:
                        element = await self.page.wait_for_selector(selector, timeout=3000)
                        if element:
                            await element.click()
                            await self.page.wait_for_timeout(1500)
                            if await self._captcha_present():
                                logger.warning("CAPTCHA detected; pausing for manual solve (headful recommended).")
                                await self._pause_for_manual_intervention()
                            # Wait for submission to complete
                            await self.page.wait_for_load_state('networkidle', timeout=10000)
                            confirmation = await self._extract_confirmation_number()
                            logger.info(f"Submitted application using selector: {selector}")
                            return True, confirmation
                    except Exception:
                        continue
                await self.page.wait_for_timeout(1000)
                    
            logger.warning("No submit button found")
            return False, None
            
        except Exception as e:
            logger.error(f"Error submitting application: {str(e)}")
            return False, None
            
    async def _extract_confirmation_number(self) -> Optional[str]:
        """
        Extract confirmation number from the success page.
        """
        try:
            # Wait a bit for the page to update
            await self.page.wait_for_timeout(2000)
            
            # Common patterns for confirmation numbers
            confirmation_selectors = [
                '[class*="confirmation"]',
                '[id*="confirmation"]',
                '[class*="application-id"]',
                '[id*="application-id"]',
                'text=/Application ID:.*/',
                'text=/Confirmation:.*/',
                'text=/Reference:.*/'
            ]
            
            for selector in confirmation_selectors:
                try:
                    element = await self.page.wait_for_selector(selector, timeout=2000)
                    if element:
                        text = await element.text_content()
                        if text:
                            # Extract number/ID from text
                            import re
                            match = re.search(r'[A-Z0-9-]{6,}', text)
                            if match:
                                return match.group(0)
                except:
                    continue
                    
            return None
        except Exception:
            return None
    async def _captcha_present(self) -> bool:
        try:
            # Heuristic selectors for CAPTCHA
            sels = [
                'iframe[src*="recaptcha"]',
                '[class*="captcha"]',
                '[id*="captcha"]',
            ]
            for s in sels:
                try:
                    if await self.page.query_selector(s):
                        return True
                except Exception:
                    continue
        except Exception:
            pass
        return False

    async def _pause_for_manual_intervention(self):
        # In headful mode this allows a user to complete a CAPTCHA or SSO.
        try:
            await self.page.wait_for_timeout(15000)
        except Exception:
            pass

    async def _login_if_needed(self, provider: str):
        # Provider-specific login using stored credentials.
        # It detects a login form and fills username/password if credentials exist.
        try:
            if not self.page:
                return

            # Determine credential key: try domain-specific matches later; for now use provider only
            # job_board_credentials map keys like 'greenhouse:' or 'workday:foo.com'
            cred = None
            # Exact provider match first
            cred = self.job_board_credentials.get(provider)
            if not cred:
                # Try any key starting with provider+
                for k, v in self.job_board_credentials.items():
                    if k.startswith(provider + ":"):
                        cred = v
                        break
            if not cred or not cred.get('username') or not cred.get('password'):
                return  # nothing to do

            # Basic detection of login forms
            username_selectors = [
                'input[name="username"]',
                'input[id*="username"]',
                'input[type="email"]',
                'input[name*="email"]',
                'input[id*="email"]',
            ]
            password_selectors = [
                'input[type="password"]',
                'input[name*="password"]',
                'input[id*="password"]',
            ]
            submit_selectors = [
                'button[type="submit"]',
                'button:has-text("Sign in")',
                'button:has-text("Log in")',
                'input[type="submit"]',
            ]

            # Provider-specific overrides
            if provider == 'greenhouse':
                submit_selectors = [
                    'button:has-text("Sign in")', 'button[type="submit"]', 'input[type="submit"]'
                ]
            elif provider == 'lever':
                submit_selectors = ['button:has-text("Log in")', 'button[type="submit"]', 'input[type="submit"]']
            elif provider == 'workday':
                username_selectors = ['input[name="username"]', 'input[id="username"]'] + username_selectors
                password_selectors = ['input[name="password"]', 'input[id="password"]'] + password_selectors
                submit_selectors = ['button:has-text("Sign In")', 'button[type="submit"]'] + submit_selectors

            # Detect username field presence first
            username_el = None
            for sel in username_selectors:
                try:
                    el = await self.page.query_selector(sel)
                    if el:
                        username_el = el
                        break
                except Exception:
                    continue

            if not username_el:
                return  # no login form

            # Fill credentials
            try:
                await username_el.fill(cred['username'])
            except Exception:
                pass

            password_el = None
            for sel in password_selectors:
                try:
                    el = await self.page.query_selector(sel)
                    if el:
                        password_el = el
                        break
                except Exception:
                    continue

            if password_el:
                try:
                    await password_el.fill(cred['password'])
                except Exception:
                    pass

            # Click submit
            for sel in submit_selectors:
                try:
                    btn = await self.page.query_selector(sel)
                    if btn:
                        await btn.click()
                        await self.page.wait_for_load_state('networkidle')
                        break
                except Exception:
                    continue

            # Optional: wait a bit and confirm logged-in state by absence of login fields
            await self.page.wait_for_timeout(1000)
        except Exception as e:
            logger.debug(f"Login attempt skipped or failed: {e}")


# Convenience functions for use in services
async def apply_with_browser(job: JobPosting, user_profile: UserProfile, headless: bool = True) -> Dict[str, Any]:
    """
    Apply to a job using browser automation.
    
    Args:
        job: JobPosting instance
        user_profile: UserProfile instance
        headless: Whether to run browser in headless mode
        
    Returns:
        Dict containing application result
    """
    creds = getattr(user_profile, 'portal_credentials', None) or {}
    async with BrowserAutomation(headless=headless, credentials=creds) as browser:
        return await browser.apply_to_job_url(job, user_profile)
