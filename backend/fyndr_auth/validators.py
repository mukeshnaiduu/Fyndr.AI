from __future__ import annotations

import re
from typing import Iterable
from django.core.exceptions import ValidationError


class WeakPasswordPatternValidator:
    """
    Rejects passwords that are trivially related to the user's identity or
    simple patterns like name/username + 123.

    Complements Django's built-ins (UserAttributeSimilarityValidator,
    CommonPasswordValidator, NumericPasswordValidator) by targeting:
      - username/email local-part/first/last/full name with simple suffixes
      - tokens like '<name>123', '<name>1234', '123<name>'
      - passwords comprised of a single repeated character
      - obvious ascending/descending digit runs of length >= 4
    """

    SIMPLE_DIGIT_SUFFIXES: tuple[str, ...] = ("123", "1234", "12345", "@123", "_123")

    def get_help_text(self) -> str:
        return (
            "Your password can’t be based on your name/username or simple patterns like appending 123."
        )

    def _normalize(self, s: str | None) -> str:
        if not s:
            return ""
        # keep letters/numbers only for comparisons
        return re.sub(r"[^a-z0-9]", "", s.lower())

    def _ascending_or_descending_digits(self, s: str) -> bool:
        # Detect a run of >=4 ascending or descending digits
        digits = [ord(c) - 48 for c in s if c.isdigit()]
        if len(digits) < 4:
            return False
        # slide window
        for i in range(len(digits) - 3):
            win = digits[i:i+4]
            asc = all(win[j+1] - win[j] == 1 for j in range(3))
            desc = all(win[j] - win[j+1] == 1 for j in range(3))
            if asc or desc:
                return True
        return False

    def _weak_relative_to_tokens(self, pwd: str, tokens: Iterable[str]) -> bool:
        for raw in tokens:
            tok = self._normalize(raw)
            if not tok or len(tok) < 3:
                continue
            if pwd == tok:
                return True
            # name + simple suffix (e.g., john123)
            for suf in self.SIMPLE_DIGIT_SUFFIXES:
                if pwd == tok + suf or pwd.endswith(tok + suf):
                    return True
            # simple prefix
            if pwd.startswith("123" + tok):
                return True
            # contains token and ends with digit suffix
            if tok in pwd and re.search(r"\d{2,}$", pwd):
                return True
        return False

    def validate(self, password: str, user=None):
        pwd = self._normalize(password)
        if not pwd:
            raise ValidationError("This password is too weak.", code="weak_password")

        # Single repeated character (e.g., aaaaaaa, 11111111)
        if len(set(pwd)) == 1 and len(pwd) >= 6:
            raise ValidationError(
                "This password is too weak (repeated single character).",
                code="weak_password",
            )

        # Ascending/descending digit runs
        if self._ascending_or_descending_digits(pwd):
            raise ValidationError(
                "This password is too weak (simple numeric sequence).",
                code="weak_password",
            )

        # User-related tokens
        tokens: list[str] = []
        if user is not None:
            try:
                tokens.append(getattr(user, "username", ""))
                tokens.append(getattr(user, "first_name", ""))
                tokens.append(getattr(user, "last_name", ""))
                email = getattr(user, "email", "") or ""
                tokens.append(email)
                if "@" in email:
                    local = email.split("@", 1)[0]
                    tokens.append(local)
                # full name combinations
                fn = getattr(user, "first_name", "") or ""
                ln = getattr(user, "last_name", "") or ""
                if fn and ln:
                    tokens.append(f"{fn}{ln}")
                    tokens.append(f"{ln}{fn}")
            except Exception:
                pass

        if self._weak_relative_to_tokens(pwd, tokens):
            raise ValidationError(
                "This password is too weak (based on your name/username with simple suffix).",
                code="weak_password",
            )
