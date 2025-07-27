#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fyndr_backend.settings')
django.setup()

from fyndr_auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

# Create or get test user
try:
    user = User.objects.get(username='testuser')
    created = False
    print(f'Found existing user: {user.email}')
    # Update role to recruiter if it's not already
    if user.role != 'recruiter':
        user.role = 'recruiter'
        user.save()
        print('Updated user role to recruiter')
except User.DoesNotExist:
    user = User.objects.create_user(
        username='testuser2',
        email='test2@example.com',
        password='testpass123',
        role='recruiter',
        first_name='Test',
        last_name='User'
    )
    created = True
    print(f'Created new user: {user.email}')

if created:
    user.set_password('testpass123')
    user.save()

# Generate token
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

print(f'User ID: {user.id}')
print(f'User Role: {user.role}')
print(f'Access Token: {access_token}')

# Test the token format
print(f'Token length: {len(access_token)}')
