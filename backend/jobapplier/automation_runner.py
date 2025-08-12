"""
Automation runner that adapts JobSeekerProfile to the existing Playwright-based
BrowserAutomation and updates JobApplication with results.

This avoids refactoring the large browser_automation module by providing a
thin adapter object with the attributes it expects (e.g., resume.path).
"""

from __future__ import annotations

import asyncio
import logging
import os
import tempfile
from dataclasses import dataclass
from typing import Optional, Dict, Any

from django.conf import settings

from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile, PortalCredentials
from .models import JobApplication, ApplicationEvent

logger = logging.getLogger(__name__)


@dataclass
class _TempFile:
    path: str

    def __del__(self):
        try:
            if os.path.exists(self.path):
                os.remove(self.path)
        except Exception:
            pass


@dataclass
class _UserProfileAdapter:
    """Adapter exposing attributes BrowserAutomation expects."""

    full_name: str
    email: str
    phone: str
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume: Optional[_TempFile] = None
    cover_letter: Optional[_TempFile] = None
    portal_credentials: Optional[dict] = None


def _write_temp_file(filename: str, data: bytes) -> _TempFile:
    suffix = os.path.splitext(filename or "uploaded")[1] or ".pdf"
    fd, tmp_path = tempfile.mkstemp(prefix="fyndr_doc_", suffix=suffix)
    with os.fdopen(fd, "wb") as f:
        f.write(data)
    return _TempFile(path=tmp_path)


def _build_profile_adapter(profile: Optional[JobSeekerProfile], user) -> _UserProfileAdapter:
    # Fallbacks from auth user if profile is missing
    first = getattr(profile, "first_name", None) or getattr(user, "first_name", "")
    last = getattr(profile, "last_name", None) or getattr(user, "last_name", "")
    full_name = f"{first} {last}".strip() or user.get_username()
    email = getattr(profile, "email", None) or getattr(user, "email", "")
    phone = getattr(profile, "phone", "")
    linkedin_url = getattr(profile, "linkedin_url", "")
    portfolio_url = getattr(profile, "portfolio_url", "")

    resume_file = None
    try:
        if getattr(profile, "resume_data", None):
            resume_file = _write_temp_file(
                getattr(profile, "resume_filename", "resume.pdf"),
                bytes(profile.resume_data)
            )
    except Exception as e:
        logger.warning(f"Failed to prepare resume temp file: {e}")

    cover_file = None
    try:
        if getattr(profile, "cover_letter_data", None):
            cover_file = _write_temp_file(
                getattr(profile, "cover_letter_filename", "cover_letter.pdf"),
                bytes(profile.cover_letter_data)
            )
    except Exception as e:
        logger.warning(f"Failed to prepare cover letter temp file: {e}")

    # Load portal credentials (decrypted)
    creds_map = {}
    try:
        creds = PortalCredentials.objects.filter(user=user)
        for c in creds:
            key = f"{c.provider}:{(c.company_domain or '').lower()}".strip(':')
            creds_map[key] = {"username": c.username, "password": c.password}
    except Exception as e:
        logger.debug(f"No portal credentials loaded: {e}")

    return _UserProfileAdapter(
        full_name=full_name,
        email=email,
        phone=phone,
        linkedin_url=linkedin_url,
        portfolio_url=portfolio_url,
        resume=resume_file,
        cover_letter=cover_file,
        portal_credentials=creds_map or None,
    )


def _run_async(coro):
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        # Run in a new loop to avoid interfering with Channels/ASGI loop
        return asyncio.run(coro)
    else:
        return asyncio.run(coro)


def run_browser_apply(job: JobPosting, profile: Optional[JobSeekerProfile], application: JobApplication) -> Dict[str, Any]:
    """
    Perform a real application via Playwright and update the JobApplication.

    Returns a dict with: { success, confirmation_number, external_link_followed, error }
    """
    try:
        from .browser_automation import apply_with_browser
    except Exception as e:
        logger.error(f"Browser automation not available: {e}")
        return {"success": False, "error": "Browser automation not available", "external_link_followed": False}

    adapter = _build_profile_adapter(profile, application.user)

    # Prefer explicit apply_url when navigating externally
    nav_job = job
    try:
        apply_url = getattr(job, 'apply_url', None)
        if apply_url and isinstance(apply_url, str) and apply_url.lower().startswith(('http://', 'https://')):
            # Mutate in-memory url for navigation without persisting to DB
            setattr(nav_job, 'url', apply_url)
    except Exception:
        pass

    # Headless default sourced from settings; fallback to True
    headless = getattr(settings, "BROWSER_AUTOMATION_HEADLESS", True)

    # Short-circuit in tests to speed up and avoid launching browsers
    if getattr(settings, 'DISABLE_BROWSER_AUTOMATION_DURING_TESTS', False):
        result = {"success": True, "confirmation_number": None, "screenshot_path": None}
    else:
        try:
            result = _run_async(apply_with_browser(nav_job, adapter, headless=headless))
        except Exception as e:
            logger.error(f"Automation run failed: {e}")
            result = {"success": False, "error": str(e)}

    # Update application with results
    try:
        if result.get("success"):
            application.status = JobApplication.ApplicationStatus.APPLIED
            application.external_application_id = result.get("confirmation_number")
            # Persist the actual application URL we attempted to use (prefer apply_url)
            try:
                application.application_url = getattr(nav_job, 'url', None) or getattr(job, 'url', None)
            except Exception:
                application.application_url = getattr(job, 'url', None)
        else:
            application.status = JobApplication.ApplicationStatus.FAILED
        # Append artifacts/logs
        artifacts = []
        if result.get("screenshot_path"):
            artifacts.append({"type": "screenshot", "path": result.get("screenshot_path")})
        if isinstance(application.automation_log, list):
            application.automation_log.extend(artifacts)
        else:
            application.automation_log = artifacts
        application.save(update_fields=["status", "external_application_id", "application_url", "automation_log", "updated_at"])

        # Add event
        ApplicationEvent.objects.create(
            application=application,
            event_type=ApplicationEvent.EventType.APPLIED if result.get("success") else ApplicationEvent.EventType.STATUS_CHANGE,
            title=(
                f"Applied to {job.title}" if result.get("success") else "Application attempt finished"
            ),
            description=(result.get("error") or "Application submitted via browser automation"),
            metadata={
                "method": "browser",
                "confirmation_number": result.get("confirmation_number"),
                "screenshot_path": result.get("screenshot_path"),
            },
        )
    except Exception as e:
        logger.warning(f"Failed to persist automation results: {e}")

    return {
        "success": bool(result.get("success")),
        "confirmation_number": result.get("confirmation_number"),
        "external_link_followed": True,
        "error": result.get("error"),
    }
