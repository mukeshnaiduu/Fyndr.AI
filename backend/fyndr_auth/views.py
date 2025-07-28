
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

# Profile view for authenticated user
class ProfileView(APIView):
    def put(self, request, *args, **kwargs):
        user = request.user
        data = request.data.copy()
        # Update user fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()
        # Optionally update onboarding/profile details if present
        if user.role == 'jobseeker':
            try:
                onboarding = JobSeekerProfile.objects.get(user=user)
                # Update any onboarding fields if provided in the request
                if 'onboarding' in data:
                    onboarding_data = data['onboarding']
                    for k, v in onboarding_data.items():
                        if hasattr(onboarding, k):
                            setattr(onboarding, k, v)
                    onboarding.save()
            except JobSeekerProfile.DoesNotExist:
                # Create onboarding profile if it doesn't exist and onboarding data is provided
                if 'onboarding' in data:
                    onboarding_data = data['onboarding']
                    JobSeekerProfile.objects.create(user=user, **onboarding_data)
        elif user.role in ['recruiter', 'employer'] and 'onboarding' in data:
            onboarding_data = data['onboarding']
            try:
                onboarding = RecruiterEmployerOnboarding.objects.get(user=user)
                for k, v in onboarding_data.items():
                    setattr(onboarding, k, v)
                onboarding.save()
            except RecruiterEmployerOnboarding.DoesNotExist:
                RecruiterEmployerOnboarding.objects.create(user=user, **onboarding_data)
        return self.get(request, *args, **kwargs)
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
        }
        onboarding = None
        onboarding_complete = False
        if user.role == 'job_seeker':
            try:
                onboarding_obj = JobSeekerProfile.objects.filter(user=user).last()
                if not onboarding_obj:
                    # Try by email if not found by user
                    onboarding_obj = JobSeekerProfile.objects.filter(email=user.email).last()
                if onboarding_obj:
                    onboarding = JobSeekerOnboardingSerializer(onboarding_obj).data
                    onboarding_complete = True
            except Exception:
                onboarding = None
        elif user.role in ['recruiter', 'employer']:
            try:
                onboarding_obj = RecruiterEmployerOnboarding.objects.filter(user=user).last()
                if not onboarding_obj:
                    onboarding_obj = RecruiterEmployerOnboarding.objects.filter(email=user.email).last()
                if onboarding_obj:
                    onboarding = RecruiterEmployerOnboardingSerializer(onboarding_obj).data
                    onboarding_complete = True
            except Exception:
                onboarding = None
        else:
            onboarding_complete = True  # Admins always considered onboarded
        user_data['onboarding'] = onboarding
        user_data['onboarding_complete'] = onboarding_complete
        return Response(user_data)
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, JobSeekerProfile, RecruiterEmployerOnboarding
from .serializers import RegisterSerializer, LoginSerializer, JobSeekerOnboardingSerializer, RecruiterEmployerOnboardingSerializer
from rest_framework.permissions import IsAuthenticated

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Issue JWT tokens upon successful registration
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Email not registered
            raise ValidationError({'email': ['No account found with this email.']})
        user = authenticate(username=user.username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            })
        # Incorrect password
        raise ValidationError({'password': ['Incorrect password.']})

class JobSeekerOnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            onboarding = JobSeekerProfile.objects.get(user=user)
            serializer = JobSeekerOnboardingSerializer(onboarding)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except JobSeekerProfile.DoesNotExist:
            return Response({"detail": "Onboarding not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data.copy()
        data['user'] = user.id
        # Only one onboarding per user: update if exists, else create
        try:
            onboarding = JobSeekerProfile.objects.get(user=user)
            serializer = JobSeekerOnboardingSerializer(onboarding, data=data, partial=True)
        except JobSeekerProfile.DoesNotExist:
            serializer = JobSeekerOnboardingSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class RecruiterEmployerOnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            onboarding = RecruiterEmployerOnboarding.objects.get(user=user)
            serializer = RecruiterEmployerOnboardingSerializer(onboarding)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except RecruiterEmployerOnboarding.DoesNotExist:
            return Response({"detail": "Onboarding not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data.copy()
        data['user'] = user.id
        # Only one onboarding per user: update if exists, else create
        try:
            onboarding = RecruiterEmployerOnboarding.objects.get(user=user)
            serializer = RecruiterEmployerOnboardingSerializer(onboarding, data=data, partial=True)
        except RecruiterEmployerOnboarding.DoesNotExist:
            serializer = RecruiterEmployerOnboardingSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
