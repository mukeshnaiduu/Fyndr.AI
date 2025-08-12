from __future__ import annotations

import base64
import hashlib
from typing import Optional

from cryptography.fernet import Fernet
from django.conf import settings


def _derive_key() -> bytes:
    secret = getattr(settings, "CREDENTIALS_ENCRYPTION_KEY", None) or settings.SECRET_KEY
    # Derive a 32-byte urlsafe base64 key from the secret
    digest = hashlib.sha256(secret.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


def _fernet() -> Fernet:
    return Fernet(_derive_key())


def encrypt_text(plaintext: str) -> bytes:
    return _fernet().encrypt(plaintext.encode("utf-8"))


def decrypt_text(token: bytes) -> str:
    return _fernet().decrypt(token).decode("utf-8")
