import pytest
from django.core.exceptions import ValidationError
from fyndr_auth.serializers import RegisterSerializer


@pytest.mark.django_db
def test_register_rejects_name_plus_123_password():
    data = {
        'username': 'john',
        'email': 'john@example.com',
        'first_name': 'John',
        'last_name': 'Doe',
    'role': 'job_seeker',
        'password': 'john1234',
        'confirm_password': 'john1234',
    }
    serializer = RegisterSerializer(data=data)
    assert not serializer.is_valid()
    assert 'password' in serializer.errors


@pytest.mark.django_db
def test_register_allows_strong_password():
    data = {
        'username': 'alice',
        'email': 'alice@example.com',
        'first_name': 'Alice',
        'last_name': 'Liddell',
    'role': 'job_seeker',
        'password': 'G00d#Passw0rd!2025',
        'confirm_password': 'G00d#Passw0rd!2025',
    }
    serializer = RegisterSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    user = serializer.save()
    assert user.username == 'alice'