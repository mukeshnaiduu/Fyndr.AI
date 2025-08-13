from rest_framework.permissions import BasePermission


class IsRecruiter(BasePermission):
    """Allow only users with recruiter role."""

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        return bool(user and user.is_authenticated and getattr(user, 'role', '') == 'recruiter')
