from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from fyndr_auth.models import CompanyProfile, RecruiterProfile, CompanyRecruiterRelationship


class TeamInvitationsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'company':
            return Response({'error': 'Only company users can create invitations'}, status=status.HTTP_403_FORBIDDEN)
        try:
            company = CompanyProfile.objects.get(user=request.user)
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company profile not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data or {}
        recruiter_id = data.get('recruiter_id')
        if not recruiter_id:
            return Response({'error': 'recruiter_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            recruiter = RecruiterProfile.objects.get(id=int(recruiter_id))
        except (ValueError, RecruiterProfile.DoesNotExist):
            return Response({'error': 'Recruiter not found'}, status=status.HTTP_404_NOT_FOUND)

        existing = CompanyRecruiterRelationship.objects.filter(company=company, recruiter=recruiter).first()
        if existing:
            if existing.status == 'accepted':
                return Response({'error': 'Recruiter is already a member of this company'}, status=status.HTTP_400_BAD_REQUEST)
            if existing.status == 'pending':
                initiator = None
                if isinstance(existing.permissions, dict):
                    initiator = existing.permissions.get('initiated_by')
                if initiator == 'recruiter':
                    return Response({'error': 'Recruiter already requested to join. Please review the pending request.'}, status=status.HTTP_409_CONFLICT)
            # resend/update
            existing.status = 'pending'
            existing.invited_at = timezone.now()
            existing.responded_at = None
            existing.role = data.get('role', 'recruiter')
            perms = data.get('permissions') if isinstance(data.get('permissions'), dict) else (existing.permissions or {})
            # Always mark company as initiator when company is sending/updating an invite.
            if isinstance(perms, dict):
                perms['initiated_by'] = 'company'
            existing.permissions = perms
            existing.save()
            return Response({'message': 'Invitation resent successfully', 'invitation_id': existing.id})

        # Ensure permissions is a dict and initiated_by is always 'company'.
        incoming_perms = data.get('permissions') if isinstance(data.get('permissions'), dict) else {}
        incoming_perms['initiated_by'] = 'company'
        rel = CompanyRecruiterRelationship.objects.create(
            company=company,
            recruiter=recruiter,
            role=data.get('role', 'recruiter'),
            status='pending',
            permissions=incoming_perms
        )
        return Response({'message': 'Invitation sent successfully', 'invitation_id': rel.id}, status=status.HTTP_201_CREATED)

    def get(self, request, *args, **kwargs):
        try:
            if request.user.role == 'company':
                company = CompanyProfile.objects.get(user=request.user)
                relationships = CompanyRecruiterRelationship.objects.filter(company=company)
                result = []
                for rel in relationships:
                    result.append({
                        'id': rel.id,
                        'recruiter_id': rel.recruiter.id,
                        'recruiter_name': rel.recruiter.full_name,
                        'recruiter_email': rel.recruiter.email,
                        'role': rel.role,
                        'status': 'removed' if rel.status == 'revoked' else rel.status,
                        'initiated_by': (rel.permissions or {}).get('initiated_by') if isinstance(rel.permissions, dict) else 'company' if rel.status == 'pending' else None,
                        'message': (rel.permissions or {}).get('message') if isinstance(rel.permissions, dict) else None,
                        'invited_at': rel.invited_at.isoformat(),
                        'responded_at': rel.responded_at.isoformat() if rel.responded_at else None
                    })
                return Response(result)
            elif request.user.role == 'recruiter':
                recruiter = RecruiterProfile.objects.get(user=request.user)
                relationships = CompanyRecruiterRelationship.objects.filter(recruiter=recruiter)
                result = []
                for rel in relationships:
                    result.append({
                        'id': rel.id,
                        'company_id': rel.company.id,
                        'company_name': rel.company.company_name,
                        'company_email': rel.company.contact_email,
                        'role': rel.role,
                        'status': 'removed' if rel.status == 'revoked' else rel.status,
                        'initiated_by': (rel.permissions or {}).get('initiated_by') if isinstance(rel.permissions, dict) else 'company' if rel.status == 'pending' else None,
                        'message': (rel.permissions or {}).get('message') if isinstance(rel.permissions, dict) else None,
                        'invited_at': rel.invited_at.isoformat(),
                        'responded_at': rel.responded_at.isoformat() if rel.responded_at else None
                    })
                return Response(result)
            else:
                return Response({'error': 'Invalid user role'}, status=status.HTTP_400_BAD_REQUEST)
        except (CompanyProfile.DoesNotExist, RecruiterProfile.DoesNotExist):
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


class RecruiterInvitationResponseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, invitation_id, *args, **kwargs):
        if request.user.role != 'recruiter':
            return Response({'error': 'Only recruiters can respond to invitations'}, status=status.HTTP_403_FORBIDDEN)
        action = request.data.get('action')
        if action not in ['accept', 'decline']:
            return Response({'error': 'Invalid action. Must be "accept" or "decline"'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            recruiter = RecruiterProfile.objects.get(user=request.user)
            invitation = CompanyRecruiterRelationship.objects.get(id=invitation_id, recruiter=recruiter)
            if invitation.status != 'pending':
                return Response({'error': f'Cannot respond to an invitation with status "{invitation.status}"'}, status=status.HTTP_400_BAD_REQUEST)
            invitation.status = 'accepted' if action == 'accept' else 'declined'
            invitation.responded_at = timezone.now()
            invitation.save()
            if action == 'accept':
                rec = recruiter
                current_associations = rec.company_associations or []
                found = False
                for assoc in current_associations:
                    if assoc.get('company_id') == invitation.company.id:
                        assoc['role'] = invitation.role
                        assoc['status'] = 'active'
                        found = True
                        break
                if not found:
                    current_associations.append({
                        'company_id': invitation.company.id,
                        'role': invitation.role,
                        'status': 'active',
                        'joined_at': invitation.responded_at.isoformat()
                    })
                rec.company_associations = current_associations
                if not rec.current_company_id:
                    rec.current_company_id = invitation.company.id
                rec.save()
            return Response({'message': f'Invitation {action}ed successfully', 'status': invitation.status})
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except CompanyRecruiterRelationship.DoesNotExist:
            return Response({'error': 'Invitation not found'}, status=status.HTTP_404_NOT_FOUND)


class CompanyRequestsProcessView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, relationship_id, *args, **kwargs):
        if request.user.role != 'company':
            return Response({'error': 'Only company users can process requests'}, status=status.HTTP_403_FORBIDDEN)
        action = request.data.get('action')
        if action not in ['accept', 'decline']:
            return Response({'error': 'Invalid action. Must be "accept" or "decline"'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            company = CompanyProfile.objects.get(user=request.user)
            rel = CompanyRecruiterRelationship.objects.get(id=relationship_id, company=company)
            if rel.status != 'pending':
                return Response({'error': f'Cannot process a request with status "{rel.status}"'}, status=status.HTTP_400_BAD_REQUEST)
            rel.status = 'accepted' if action == 'accept' else 'declined'
            rel.responded_at = timezone.now()
            if action == 'accept':
                new_role = request.data.get('role')
                if new_role:
                    allowed_roles = [choice[0] for choice in CompanyRecruiterRelationship.ROLE_CHOICES]
                    if new_role not in allowed_roles:
                        return Response({'error': f'Invalid role. Must be one of {allowed_roles}'}, status=status.HTTP_400_BAD_REQUEST)
                    rel.role = new_role
                if 'permissions' in request.data:
                    rel.permissions = request.data.get('permissions')
            rel.save()
            if action == 'accept':
                recruiter = rel.recruiter
                current_associations = recruiter.company_associations or []
                found = False
                for assoc in current_associations:
                    if assoc.get('company_id') == rel.company.id:
                        assoc['role'] = rel.role
                        assoc['status'] = 'active'
                        found = True
                        break
                if not found:
                    current_associations.append({
                        'company_id': rel.company.id,
                        'role': rel.role,
                        'status': 'active',
                        'joined_at': rel.responded_at.isoformat()
                    })
                recruiter.company_associations = current_associations
                if not recruiter.current_company_id:
                    recruiter.current_company_id = rel.company.id
                recruiter.save()
            return Response({'message': f'Request {action}ed successfully', 'status': rel.status})
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except CompanyRecruiterRelationship.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)


class RecruiterCompanySelectionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'recruiter':
            return Response({'error': 'Only recruiters can select a company'}, status=status.HTTP_403_FORBIDDEN)
        company_id = request.data.get('company_id')
        if not company_id:
            return Response({'error': 'Company ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            recruiter = RecruiterProfile.objects.get(user=request.user)
            company_associations = recruiter.company_associations or []
            company_found = any(assoc.get('company_id') == int(company_id) and assoc.get('status') == 'active' for assoc in company_associations)
            if not company_found:
                return Response({'error': 'You are not associated with this company'}, status=status.HTTP_403_FORBIDDEN)
            recruiter.current_company_id = int(company_id)
            recruiter.save()
            comp = CompanyProfile.objects.get(id=int(company_id))
            return Response({'message': 'Active company updated successfully', 'company': {'id': comp.id, 'name': comp.company_name}})
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


class RecruiterJoinRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'recruiter':
            return Response({'error': 'Only recruiters can request to join a company'}, status=status.HTTP_403_FORBIDDEN)
        company_id = request.data.get('company_id')
        if not company_id:
            return Response({'error': 'Company ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            recruiter = RecruiterProfile.objects.get(user=request.user)
            company = CompanyProfile.objects.get(id=int(company_id))
            rel = CompanyRecruiterRelationship.objects.filter(company=company, recruiter=recruiter).first()
            if rel:
                if rel.status == 'accepted':
                    return Response({'error': 'You are already part of this company'}, status=status.HTTP_400_BAD_REQUEST)
                if rel.status == 'pending':
                    initiator = None
                    if isinstance(rel.permissions, dict):
                        initiator = rel.permissions.get('initiated_by')
                    if initiator in [None, 'company']:
                        return Response({'error': 'Company already invited you. Please respond to the pending invite.'}, status=status.HTTP_409_CONFLICT)
                    return Response({'message': 'Request already pending', 'relationship_id': rel.id}, status=status.HTTP_200_OK)
                # Previously declined or revoked -> set to pending as recruiter-initiated
                rel.status = 'pending'
                rel.invited_at = timezone.now()
                rel.responded_at = None
                meta = rel.permissions or {}
                note = request.data.get('message')
                if not isinstance(meta, dict):
                    meta = {}
                # Explicitly set initiator as recruiter when recruiter is re-requesting.
                meta['initiated_by'] = 'recruiter'
                if note:
                    meta['message'] = note
                rel.permissions = meta
                rel.save()
                return Response({'message': 'Request submitted', 'relationship_id': rel.id}, status=status.HTTP_200_OK)
            permissions_meta = {'initiated_by': 'recruiter'}
            if request.data.get('message'):
                permissions_meta['message'] = request.data.get('message')
            rel = CompanyRecruiterRelationship.objects.create(
                company=company,
                recruiter=recruiter,
                role=request.data.get('role', 'recruiter'),
                status='pending',
                permissions=permissions_meta
            )
            return Response({'message': 'Request submitted', 'relationship_id': rel.id}, status=status.HTTP_201_CREATED)
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company profile not found'}, status=status.HTTP_404_NOT_FOUND)


class CompanyMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'company':
            return Response({'error': 'Only company users can view team members'}, status=status.HTTP_403_FORBIDDEN)
        try:
            company = CompanyProfile.objects.get(user=request.user)
            relationships = CompanyRecruiterRelationship.objects.filter(company=company, status='accepted').select_related('recruiter__user')
            past_relationships = CompanyRecruiterRelationship.objects.filter(company=company, status='revoked').select_related('recruiter__user')
            members = []
            for rel in relationships:
                rec = rel.recruiter
                members.append({
                    'relationship_id': rel.id,
                    'recruiter_id': rec.id,
                    'name': rec.full_name or rec.user.get_full_name() or rec.user.username,
                    'email': rec.email or rec.user.email,
                    'role': rel.role,
                    'permissions': rel.permissions or {},
                    'joined_at': rel.responded_at.isoformat() if rel.responded_at else rel.invited_at.isoformat(),
                })
            past_members = []
            for rel in past_relationships:
                rec = rel.recruiter
                past_members.append({
                    'relationship_id': rel.id,
                    'recruiter_id': rec.id,
                    'name': rec.full_name or rec.user.get_full_name() or rec.user.username,
                    'email': rec.email or rec.user.email,
                    'role': rel.role,
                    'left_at': rel.responded_at.isoformat() if rel.responded_at else rel.invited_at.isoformat(),
                })
            return Response({'members': members, 'past_members': past_members})
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company profile not found'}, status=status.HTTP_404_NOT_FOUND)


class CompanyMemberDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, relationship_id, *args, **kwargs):
        if request.user.role != 'company':
            return Response({'error': 'Only company users can manage team'}, status=status.HTTP_403_FORBIDDEN)
        try:
            company = CompanyProfile.objects.get(user=request.user)
            rel = CompanyRecruiterRelationship.objects.get(id=relationship_id, company=company)
            data = request.data or {}
            allowed_roles = [choice[0] for choice in CompanyRecruiterRelationship.ROLE_CHOICES]
            if 'role' in data:
                new_role = data.get('role')
                if new_role not in allowed_roles:
                    return Response({'error': f'Invalid role. Must be one of {allowed_roles}'}, status=status.HTTP_400_BAD_REQUEST)
                rel.role = new_role
            if 'permissions' in data and isinstance(data.get('permissions'), (dict, list)):
                rel.permissions = data.get('permissions')
            rel.save()
            return Response({'message': 'Team member updated successfully'})
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except CompanyRecruiterRelationship.DoesNotExist:
            return Response({'error': 'Team member not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, relationship_id, *args, **kwargs):
        if request.user.role != 'company':
            return Response({'error': 'Only company users can manage team'}, status=status.HTTP_403_FORBIDDEN)
        try:
            company = CompanyProfile.objects.get(user=request.user)
            rel = CompanyRecruiterRelationship.objects.get(id=relationship_id, company=company)
            if rel.status == 'revoked':
                return Response({'message': 'Already revoked'}, status=status.HTTP_200_OK)
            rel.status = 'revoked'
            rel.responded_at = timezone.now()
            rel.save()
            recruiter = rel.recruiter
            associations = recruiter.company_associations or []
            for assoc in associations:
                if assoc.get('company_id') == company.id:
                    assoc['status'] = 'inactive'
            recruiter.company_associations = associations
            if recruiter.current_company_id == company.id:
                recruiter.current_company_id = None
            recruiter.save()
            return Response({'message': 'Team member access revoked'})
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Company profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except CompanyRecruiterRelationship.DoesNotExist:
            return Response({'error': 'Team member not found'}, status=status.HTTP_404_NOT_FOUND)


class RecruiterCompaniesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if getattr(request.user, 'role', None) != 'recruiter':
            return Response({'error': 'Only recruiters can view their companies'}, status=status.HTTP_403_FORBIDDEN)
        try:
            rec = RecruiterProfile.objects.get(user=request.user)
            rels = CompanyRecruiterRelationship.objects.filter(recruiter=rec).select_related('company')
            items = []
            for rel in rels:
                comp = rel.company
                item = {
                    'id': comp.id,
                    'name': comp.company_name,
                    'industry': comp.industry,
                    'headquarters': comp.headquarters,
                    'website': comp.website,
                    'role': rel.role,
                    'joined_at': rel.responded_at.isoformat() if rel.responded_at else rel.invited_at.isoformat(),
                    'status': 'removed' if rel.status == 'revoked' else rel.status,
                    'is_current': rec.current_company_id == comp.id,
                }
                if comp.logo_data or getattr(comp, 'logo_url', None):
                    item['logo_url'] = comp.logo_url
                items.append(item)
            return Response(items)
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found'}, status=status.HTTP_404_NOT_FOUND)


class RecruiterLeaveCompanyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if getattr(request.user, 'role', None) != 'recruiter':
            return Response({'error': 'Only recruiters can leave a company'}, status=status.HTTP_403_FORBIDDEN)
        company_id = request.data.get('company_id')
        if not company_id:
            return Response({'error': 'Company ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            rec = RecruiterProfile.objects.get(user=request.user)
            rel = CompanyRecruiterRelationship.objects.get(recruiter=rec, company_id=int(company_id), status='accepted')
            rel.status = 'revoked'
            rel.responded_at = timezone.now()
            rel.save()
            # Update recruiter associations
            associations = rec.company_associations or []
            for assoc in associations:
                if assoc.get('company_id') == int(company_id):
                    assoc['status'] = 'inactive'
            rec.company_associations = associations
            if rec.current_company_id == int(company_id):
                rec.current_company_id = None
            rec.save()
            return Response({'message': 'Left company successfully'})
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except CompanyRecruiterRelationship.DoesNotExist:
            return Response({'error': 'Active membership not found'}, status=status.HTTP_404_NOT_FOUND)
