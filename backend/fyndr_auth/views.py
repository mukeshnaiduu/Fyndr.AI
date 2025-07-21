
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

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
        if user.role == 'job_seeker' and 'onboarding' in data:
            onboarding_data = data['onboarding']
            try:
                onboarding = JobSeekerOnboarding.objects.get(user=user)
                for k, v in onboarding_data.items():
                    setattr(onboarding, k, v)
                onboarding.save()
            except JobSeekerOnboarding.DoesNotExist:
                JobSeekerOnboarding.objects.create(user=user, **onboarding_data)
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
                onboarding_obj = JobSeekerOnboarding.objects.filter(user=user).last()
                if not onboarding_obj:
                    # Try by email if not found by user
                    onboarding_obj = JobSeekerOnboarding.objects.filter(email=user.email).last()
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
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, JobSeekerOnboarding, RecruiterEmployerOnboarding
from .serializers import RegisterSerializer, LoginSerializer, JobSeekerOnboardingSerializer, RecruiterEmployerOnboardingSerializer
from rest_framework.permissions import IsAuthenticated

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({'detail': 'Registration successful! Please sign in.'}, status=status.HTTP_201_CREATED)

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
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
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
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class JobSeekerOnboardingView(generics.CreateAPIView):
    serializer_class = JobSeekerOnboardingSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data.copy()
        data['user'] = user.id
        # Only one onboarding per user: update if exists, else create
        try:
            onboarding = JobSeekerOnboarding.objects.get(user=user)
            serializer = self.get_serializer(onboarding, data=data, partial=True)
        except JobSeekerOnboarding.DoesNotExist:
            serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class RecruiterEmployerOnboardingView(generics.CreateAPIView):
    serializer_class = RecruiterEmployerOnboardingSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data.copy()
        data['user'] = user.id
        # Only one onboarding per user: update if exists, else create
        try:
            onboarding = RecruiterEmployerOnboarding.objects.get(user=user)
            serializer = self.get_serializer(onboarding, data=data, partial=True)
        except RecruiterEmployerOnboarding.DoesNotExist:
            serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
