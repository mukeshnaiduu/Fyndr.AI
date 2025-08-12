import os
import django
import pytest

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fyndr_backend.settings')

django.setup()

from jobapplier.browser_automation import BrowserAutomation


@pytest.mark.asyncio
async def test_playwright_can_launch_headless():
    ba = BrowserAutomation(headless=True)
    try:
        await ba.open_browser()
        assert ba.browser is not None
        assert ba.context is not None
        assert ba.page is not None
    finally:
        await ba.close_browser()
