from django.urls import path
from .views import (
    TeamInvitationsView,
    RecruiterInvitationResponseView,
    RecruiterJoinRequestView,
    CompanyRequestsProcessView,
    CompanyMembersView,
    CompanyMemberDetailView,
    RecruiterCompaniesListView,
    RecruiterCompanySelectionView,
    RecruiterLeaveCompanyView,
)

urlpatterns = [
    path('invitations/', TeamInvitationsView.as_view(), name='team-invitations'),
    path('recruiter/invitations/<int:invitation_id>/respond/', RecruiterInvitationResponseView.as_view(), name='team-respond-invitation'),
    path('recruiter/join-request/', RecruiterJoinRequestView.as_view(), name='team-recruiter-join-request'),
    path('company/requests/<int:relationship_id>/process/', CompanyRequestsProcessView.as_view(), name='team-company-process-request'),
    path('company/members/', CompanyMembersView.as_view(), name='team-company-members'),
    path('company/members/<int:relationship_id>/', CompanyMemberDetailView.as_view(), name='team-company-member-detail'),
    path('recruiter/companies/', RecruiterCompaniesListView.as_view(), name='team-recruiter-companies'),
    path('recruiter/select-company/', RecruiterCompanySelectionView.as_view(), name='team-recruiter-select-company'),
    path('recruiter/leave-company/', RecruiterLeaveCompanyView.as_view(), name='team-recruiter-leave-company'),
]
