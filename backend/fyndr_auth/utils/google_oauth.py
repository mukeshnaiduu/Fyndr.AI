import os
import requests
from datetime import timedelta
from django.utils import timezone
from ..models import OAuthToken

GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'


def get_token_record(user):
    return OAuthToken.objects.filter(user=user, provider='google').first()


def ensure_access_token(user):
    """Return a valid Google access token for the user, refreshing if needed."""
    rec = get_token_record(user)
    if not rec:
        return None

    # If access token exists and not expired, return it
    if rec.access_token and not rec.is_expired():
        return rec.access_token

    # Refresh using refresh_token
    refresh_token = rec.refresh_token
    if not refresh_token:
        return rec.access_token or None

    client_id = os.getenv('GOOGLE_OAUTH_CLIENT_ID', '')
    client_secret = os.getenv('GOOGLE_OAUTH_CLIENT_SECRET', '')
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
    }
    try:
        res = requests.post(GOOGLE_TOKEN_URL, data=data, timeout=15)
        res.raise_for_status()
        payload = res.json()
        access_token = payload.get('access_token')
        expires_in = payload.get('expires_in') or 0
        if access_token:
            rec.access_token = access_token
            rec.expires_at = timezone.now() + timedelta(seconds=int(expires_in)) if expires_in else None
            rec.save(update_fields=['access_token_encrypted', 'expires_at', 'updated_at'])
            return access_token
    except Exception:
        return None

    return rec.access_token or None
