from rest_framework import serializers
from .models import User, JobSeekerProfile, RecruiterProfile, CompanyProfile, Location, Skill, JobRole, Industry, SalaryBand
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'role')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data['role']
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = JobSeekerProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate_email(self, value):
        """Ensure email is unique if provided"""
        if not value:  # Skip validation if email is empty
            return value
            
        # Check for existing profiles with this email, excluding current instance
        existing_profiles = JobSeekerProfile.objects.filter(email=value)
        if self.instance:
            existing_profiles = existing_profiles.exclude(id=self.instance.id)
            
        if existing_profiles.exists():
            raise serializers.ValidationError("A profile with this email already exists.")
        return value


class RecruiterProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = RecruiterProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate_email(self, value):
        """Ensure email is unique if provided"""
        if value and RecruiterProfile.objects.filter(email=value).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError("A profile with this email already exists.")
        return value


class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate_company_name(self, value):
        """Ensure company name is unique if provided"""
        if value and CompanyProfile.objects.filter(company_name=value).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError("A company with this name already exists.")
        return value

    def validate_payment_methods(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError("payment_methods must be a list")
        for pm in value:
            if not isinstance(pm, dict):
                raise serializers.ValidationError("Each payment method must be an object")
            # basic shape checks
            pm.setdefault('brand', '')
            pm.setdefault('last4', '')
            pm.setdefault('expiry', '')
            pm.setdefault('name', '')
            pm.setdefault('default', False)
        return value


# Backward compatibility serializers (for gradual migration)
class JobSeekerOnboardingSerializer(JobSeekerProfileSerializer):
    """Backward compatibility - redirect to JobSeekerProfileSerializer"""
    pass


class CompanyOnboardingSerializer(CompanyProfileSerializer):
    """Backward compatibility - redirect to CompanyProfileSerializer"""
    pass


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('id', 'city', 'state', 'country', 'display_name', 'slug')


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name', 'slug', 'category', 'popularity')


class JobRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRole
        fields = ('id', 'title', 'normalized_title', 'slug', 'category', 'popularity', 'for_jobseekers', 'for_recruiters')


class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ('id', 'name', 'slug', 'category', 'popularity')


class SalaryBandSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryBand
        fields = ('id', 'label', 'currency', 'min_amount', 'max_amount', 'popularity')
