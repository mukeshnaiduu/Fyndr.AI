import io
import json
import os
import pytest
from django.test import Client
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile


@pytest.mark.django_db
def test_resume_parse_endpoint_pdf(monkeypatch):
    client = Client()
    User = get_user_model()
    user, _ = User.objects.get_or_create(username='resumeuser', email='resume@example.com', role='job_seeker')
    user.set_password('testpass123')
    user.save()

    # Auth via JWT to avoid CSRF requirements
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    auth = {'HTTP_AUTHORIZATION': f'Bearer {access}'}

    # Prepare a tiny PDF with text "John Doe" using a minimal PDF header (pypdf can read minimal)
    sample_pdf = (b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 24 Tf 10 100 Td (John Doe Email john@example.com) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000281 00000 n \n0000000390 00000 n \ntrailer<</Root 1 0 R/Size 6>>\nstartxref\n470\n%%EOF")
    upload = SimpleUploadedFile('resume.pdf', sample_pdf, content_type='application/pdf')
    res = client.post('/api/auth/upload/', {'file': upload, 'type': 'resume'}, **auth)
    assert res.status_code in (200, 201), res.content

    # Mock Gemini call to avoid external dependency; patch the symbol imported in views
    def fake_gemini(text: str):
        return {
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone': '+1 555 111 2222',
            'location': 'Remote',
            'years_experience': 5,
            'skills': ['Python', 'Django'],
            'job_titles': ['Software Engineer'],
            'suited_roles': ['Backend Developer', 'API Engineer'],
            'education': [{'degree': 'BSc CS', 'institution': 'ABC Univ', 'year': '2018'}],
            'links': [{'type': 'linkedin', 'url': 'https://linkedin.com/in/john'}],
            'summary': 'Experienced Python developer.'
        }
    import fyndr_auth.views as views_mod
    monkeypatch.setattr(views_mod, 'call_gemini_for_resume', fake_gemini)

    # Call parse endpoint
    res2 = client.post('/api/auth/resume/parse/', **auth)
    assert res2.status_code == 200, res2.content
    data = res2.json()
    print('PARSE RESPONSE:', data)
    assert 'parsed' in data
    assert isinstance(data['parsed'], dict)
    assert 'applied_fields' in data
    # Verify suited roles applied
    # Fetch profile to verify stored value
    from fyndr_auth.models import JobSeekerProfile
    prof = JobSeekerProfile.objects.get(user=user)
    print('PROFILE SUITED ROLES DETAILED:', prof.suited_job_roles_detailed)
    assert isinstance(prof.suited_job_roles_detailed, list)
    # ensure at least one entry with role 'Backend Developer'
    roles = [r.get('role') for r in prof.suited_job_roles_detailed if isinstance(r, dict)]
    assert 'Backend Developer' in roles
