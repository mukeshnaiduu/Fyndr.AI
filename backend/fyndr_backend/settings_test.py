from .settings import *  # noqa
import os
from pathlib import Path

# Force sqlite for tests
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Speed up password hashing in tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Prevent real automation
DISABLE_BROWSER_AUTOMATION_DURING_TESTS = True
BROWSER_AUTOMATION_HEADLESS = True

# Avoid historical migration conflicts in tests; use current models directly
MIGRATION_MODULES = {
    'jobapplier': None,
}
