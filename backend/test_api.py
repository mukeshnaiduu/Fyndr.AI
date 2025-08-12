#!/usr/bin/env python3
"""
Test script to validate the new JobApplication API endpoints
"""

import os
import django
import json
from django.test import Client
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fyndr_backend.settings')
django.setup()

from jobapplier.models import JobApplication, ApplicationEvent, ApplicationTracking
from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile
import pytest

@pytest.mark.django_db
def test_api_endpoints():
    print("🧪 Testing JobApplication API endpoints...")
    
    client = Client()
    User = get_user_model()
    
    # Create test user if not exists
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    # Create job seeker profile if not exists
    profile, created = JobSeekerProfile.objects.get_or_create(
        user=user,
        defaults={
            'skills': ['Python', 'Django'],
            'years_of_experience': 3
        }
    )
    
    print(f"✅ Test user created: {user.email}")
    
    # Create test job if not exists
    job, created = JobPosting.objects.get_or_create(
        external_id='test-1',
        source='site',
        defaults={
            'title': 'Test Developer',
            'company': 'Test Company',
            'description': 'Test job description',
            'location': 'Remote',
            'url': 'https://example.com/job/1',
            'is_active': True
        }
    )
    
    print(f"✅ Test job created: {job.title} at {job.company}")
    
    # Test application creation
    application_count_before = JobApplication.objects.filter(user=user).count()
    
    # Force login user
    client.force_login(user)
    
    # Test dashboard endpoint
    response = client.get('/api/applications/dashboard/')
    print(f"📊 Dashboard endpoint: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   - Total applications: {data['stats']['total_applications']}")
        print(f"   - Pending applications: {data['stats']['pending_applications']}")
    
    # Test quick apply endpoint
    response = client.post('/api/applications/quick-apply/', {
        'job_id': job.id,
        'application_method': 'manual'
    }, content_type='application/json')
    
    print(f"🚀 Quick apply endpoint: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"   - Application ID: {data['id']}")
        print(f"   - Status: {data['status']}")
    elif response.status_code == 400:
        data = response.json()
        print(f"   - Error (expected if already applied): {data.get('error', 'Unknown error')}")
    
    # Test applications list
    response = client.get('/api/applications/applications/')
    print(f"📋 Applications list: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   - Total applications: {data['count'] if 'count' in data else len(data)}")
    
    application_count_after = JobApplication.objects.filter(user=user).count()
    print(f"📈 Applications in database: {application_count_before} → {application_count_after}")
    
    # Test application events
    applications = JobApplication.objects.filter(user=user)
    if applications.exists():
        app = applications.first()
        response = client.get(f'/api/applications/applications/{app.id}/events/')
        print(f"📝 Application events: {response.status_code}")
        if response.status_code == 200:
            events = response.json()
            print(f"   - Events count: {len(events)}")
    
    print("\n✅ API endpoint testing completed!")

if __name__ == '__main__':
    test_api_endpoints()
