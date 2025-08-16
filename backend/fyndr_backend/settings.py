import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
from dotenv import load_dotenv
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Load sensitive settings from environment for safety. Defaults are safe for local dev.
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-local-dev-key')
# Default DEBUG to True for development, allow override via env var 'DJANGO_DEBUG'
DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() in ('1', 'true', 'yes')
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'django_filters',  # For filtering support
    'channels',  # WebSocket support
    'cloudinary',  # Image management
    'cloudinary_storage',  # Cloudinary storage backend
    'fyndr_auth',
    'team_management',
    'jobscraper',  # Job scraping engine
    'jobapplier',  # Job application automation
    'jobmatcher',  # AI-powered job matching and preparation
    'jobtracker',  # Application status tracking and analytics
    'corsheaders',
]

AUTH_USER_MODEL = 'fyndr_auth.User'

load_dotenv(os.path.join(BASE_DIR, '.env'))

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'fyndr_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'fyndr_backend.wsgi.application'
ASGI_APPLICATION = 'fyndr_backend.asgi.application'

# Channel layers for WebSocket support
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

# Optional Redis configuration (uncomment and configure Redis if needed)
# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels_redis.core.RedisChannelLayer',
#         'CONFIG': {
#             "hosts": [('127.0.0.1', 6379)],
#         },
#     },
# }

# Database: Prefer Postgres if env vars are provided, otherwise fall back to SQLite for local dev
SUPABASE_DB_NAME = os.getenv('SUPABASE_DB_NAME', '').strip()
SUPABASE_DB_USER = os.getenv('SUPABASE_DB_USER', '').strip()
SUPABASE_DB_PASSWORD = os.getenv('SUPABASE_DB_PASSWORD', '').strip()
SUPABASE_DB_HOST = os.getenv('SUPABASE_DB_HOST', '').strip()
SUPABASE_DB_PORT = os.getenv('SUPABASE_DB_PORT', '5432').strip()

if SUPABASE_DB_NAME and SUPABASE_DB_USER and SUPABASE_DB_HOST:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': SUPABASE_DB_NAME,
            'USER': SUPABASE_DB_USER,
            'PASSWORD': SUPABASE_DB_PASSWORD,
            'HOST': SUPABASE_DB_HOST,
            'PORT': SUPABASE_DB_PORT,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'dev_db.sqlite3'),
        }
    }

# When running tests with pytest, isolate DB and avoid external automation
if os.environ.get('PYTEST_CURRENT_TEST'):
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'test_db.sqlite3'),
    }
    # Prevent real browser automation during tests
    DISABLE_BROWSER_AUTOMATION_DURING_TESTS = True

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files configuration for file uploads
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Cloudinary Configuration
import cloudinary
import cloudinary.uploader
import cloudinary.api

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', ''),
    api_key=os.getenv('CLOUDINARY_API_KEY', ''),
    api_secret=os.getenv('CLOUDINARY_API_SECRET', ''),
    secure=True
)

# Ensure the logs directory exists for file-based logging
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)

# Use Cloudinary for media storage in production
if not DEBUG:
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME', ''),
        'API_KEY': os.getenv('CLOUDINARY_API_KEY', ''),
        'API_SECRET': os.getenv('CLOUDINARY_API_SECRET', ''),
    }
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Allow public access to job listings
    ],
}

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),  # Extended for development
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# ATS API Configuration
GREENHOUSE_API_KEY = os.getenv('GREENHOUSE_API_KEY', None)
LEVER_API_KEY = os.getenv('LEVER_API_KEY', None)
WORKDAY_TENANT_URL = os.getenv('WORKDAY_TENANT_URL', None)
WORKDAY_CLIENT_ID = os.getenv('WORKDAY_CLIENT_ID', None)
WORKDAY_CLIENT_SECRET = os.getenv('WORKDAY_CLIENT_SECRET', None)

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOGS_DIR, 'application.log'),
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'jobapplier': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'jobscraper': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

CORS_ALLOW_ALL_ORIGINS = True

# Security settings applied when not in DEBUG (production)
if not DEBUG:
    SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '31536000'))  # 1 year
    SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True').lower() in ('1', 'true', 'yes')
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'True').lower() in ('1', 'true', 'yes')
    CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'True').lower() in ('1', 'true', 'yes')
    # Ensure SECRET_KEY is not the insecure default in production
    if SECRET_KEY == 'django-insecure-local-dev-key':
        raise RuntimeError('SECRET_KEY must be set in production environment')

# ========================================
# JOB APPLICATION AUTOMATION SETTINGS
# ========================================

# ATS API Keys (load from environment variables)
GREENHOUSE_API_KEY = os.getenv('GREENHOUSE_API_KEY', None)
LEVER_API_KEY = os.getenv('LEVER_API_KEY', None)
WORKDAY_CLIENT_ID = os.getenv('WORKDAY_CLIENT_ID', None)
WORKDAY_CLIENT_SECRET = os.getenv('WORKDAY_CLIENT_SECRET', None)
WORKDAY_TENANT_URL = os.getenv('WORKDAY_TENANT_URL', None)

# Browser Automation Settings
BROWSER_AUTOMATION_HEADLESS = os.getenv('BROWSER_AUTOMATION_HEADLESS', 'True').lower() == 'true'
BROWSER_AUTOMATION_TIMEOUT = int(os.getenv('BROWSER_AUTOMATION_TIMEOUT', '30000'))  # 30 seconds

# Application Limits and Rate Limiting
MAX_APPLICATIONS_PER_DAY = int(os.getenv('MAX_APPLICATIONS_PER_DAY', '50'))
MAX_APPLICATIONS_PER_HOUR = int(os.getenv('MAX_APPLICATIONS_PER_HOUR', '10'))
APPLICATION_RETRY_ATTEMPTS = int(os.getenv('APPLICATION_RETRY_ATTEMPTS', '3'))

# Logging for Job Application
LOGGING['loggers']['jobapplier'] = {
    'handlers': ['file', 'console'],
    'level': 'INFO',
    'propagate': True,
}

# Google OAuth (set via environment)
# GOOGLE_OAUTH_CLIENT_ID
# GOOGLE_OAUTH_CLIENT_SECRET
# GOOGLE_OAUTH_REDIRECT_URI  # e.g., https://yourdomain.com/api/auth/oauth/google/callback/