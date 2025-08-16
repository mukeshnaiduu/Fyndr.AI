import pytest


def pytest_configure():
    # Ensure pytest-django is registered without needing DJANGO_SETTINGS_MODULE here
    pass


@pytest.fixture(scope='session', autouse=True)
def test_settings_overrides():
    from django.conf import settings
    # Disable external services/automation during tests
    settings.DISABLE_BROWSER_AUTOMATION_DURING_TESTS = True
    settings.BROWSER_AUTOMATION_HEADLESS = True
    # Loosen permissions for APIs in tests if needed
    settings.REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = [
        'rest_framework.permissions.AllowAny',
    ]
    # Enable session auth so Django test client force_login works with DRF views
    settings.REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ]
