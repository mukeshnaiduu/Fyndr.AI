#!/usr/bin/env python
"""
Quick test script to debug the job application API issue
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.insert(0, '/workspaces/Fyndr.AI/backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fyndr_backend.settings')
django.setup()

from jobscraper.models import JobPosting
from django.contrib.auth import get_user_model
from jobapplier.models import JobApplication

def main():
    print("🔍 Debugging Job Application API...")
    
    # Check database connections
    print(f"📊 Total jobs in database: {JobPosting.objects.count()}")
    
    # Get first job for testing
    first_job = JobPosting.objects.filter(is_active=True).first()
    if first_job:
        print(f"✅ First job: ID {first_job.id} - {first_job.title} at {first_job.company}")
    else:
        print("❌ No jobs found!")
        return
    
    # Check users
    User = get_user_model()
    print(f"👥 Total users: {User.objects.count()}")
    
    users = User.objects.all()[:3]
    print("Available users:")
    for user in users:
        print(f"  ID: {user.id} - {user.username}")
    
    # Check applications
    print(f"📝 Total applications: {JobApplication.objects.count()}")
    
    # Test creating an application manually
    if users.exists():
        test_user = users.first()
        print(f"\n🧪 Testing application creation for user {test_user.username}...")
        
        try:
            # Check if application already exists
            existing = JobApplication.objects.filter(user=test_user, job=first_job).first()
            if existing:
                print(f"⚠️  Application already exists: {existing.id}")
            else:
                # Create test application
                app = JobApplication.objects.create(
                    user=test_user,
                    job=first_job,
                    application_method='manual',
                    notes='Test application from debug script'
                )
                print(f"✅ Test application created: {app.id}")
                
        except Exception as e:
            print(f"❌ Error creating application: {e}")
    
    print("\n🔗 API Endpoints:")
    print(f"  Individual apply: /api/applications/apply/{first_job.id}/")
    print(f"  Bulk apply: /api/applications/bulk-apply/")
    print(f"  Quick apply: /api/applications/quick-apply-matching/")

if __name__ == "__main__":
    main()
