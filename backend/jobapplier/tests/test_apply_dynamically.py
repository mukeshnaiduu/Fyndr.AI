import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from jobscraper.models import JobPosting


@pytest.mark.django_db
def test_apply_dynamically_idempotent():
    User = get_user_model()
    user = User.objects.create_user(username='u1', password='pw')
    job = JobPosting.objects.create(
        external_id='ext1', title='T', company='C', url='https://example.com/j/1', source='site'
    )
    client = APIClient()
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')

    url = reverse('jobapplier:apply_dynamically')
    r1 = client.post(url, {'job_id': job.id}, format='json')
    assert r1.status_code in (200, 201)
    r2 = client.post(url, {'job_id': job.id}, format='json')
    assert r2.status_code == 200
    assert r2.data.get('already_applied', True) or r2.data.get('success')
