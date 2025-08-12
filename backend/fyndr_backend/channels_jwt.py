"""
Channels JWT middleware to authenticate WebSocket connections using
SimpleJWT access tokens passed via the `?token=` query parameter.

This enables frontend clients to connect with: ws://.../ws/.../?token=<JWT>
"""

from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTAuthMiddleware:
    """ASGI middleware for JWT auth on WebSocket connections."""

    def __init__(self, inner):
        self.inner = inner
        self._jwt_auth = JWTAuthentication()

    async def __call__(self, scope, receive, send):
        # Default to anonymous
        scope["user"] = AnonymousUser()

        try:
            # Parse token from query string
            query_string = scope.get("query_string", b"").decode()
            query_params = parse_qs(query_string)
            token = None

            # Support both `token` and `access` param names
            if "token" in query_params and query_params["token"]:
                token = query_params["token"][0]
            elif "access" in query_params and query_params["access"]:
                token = query_params["access"][0]

            if token:
                # Validate and resolve user
                validated = self._jwt_auth.get_validated_token(token)
                user = self._jwt_auth.get_user(validated)
                scope["user"] = user
        except Exception:
            # On any auth error, keep AnonymousUser; consumer can close with 4001
            pass

        return await self.inner(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """Helper to compose JWT middleware with the default auth stack if needed."""
    return JWTAuthMiddleware(inner)
