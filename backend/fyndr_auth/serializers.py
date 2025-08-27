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
        # Re-run password validation with a user-like object so validators
        # that use user attributes (name/username/email) can apply.
        try:
            temp_user = User(
                username=attrs.get('username', ''),
                email=attrs.get('email', ''),
                first_name=attrs.get('first_name', ''),
                last_name=attrs.get('last_name', ''),
            )
            validate_password(attrs['password'], user=temp_user)
        except Exception as e:
            # Normalize to DRF error shape
            raise serializers.ValidationError({"password": [str(e)]})
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
    # Optional flag from client to control token lifetimes
    # True (default) = longer-lived refresh token, suitable for persistent login
    # False = shorter-lived tokens (session-like behavior)
    rememberMe = serializers.BooleanField(required=False, default=True)


class EducationEntrySerializer(serializers.Serializer):
    degree = serializers.CharField(allow_blank=True, required=False)
    current = serializers.BooleanField(required=False, default=False)
    end_year = serializers.CharField(allow_blank=True, required=False)
    location = serializers.CharField(allow_blank=True, required=False)
    start_year = serializers.CharField(allow_blank=True, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    institution = serializers.CharField(allow_blank=True, required=False)
    field_of_study = serializers.CharField(allow_blank=True, required=False)


class ExperienceEntrySerializer(serializers.Serializer):
    title = serializers.CharField(allow_blank=True, required=False)
    company = serializers.CharField(allow_blank=True, required=False)
    current = serializers.BooleanField(required=False, default=False)
    end_date = serializers.CharField(allow_blank=True, required=False)
    location = serializers.CharField(allow_blank=True, required=False)
    start_date = serializers.CharField(allow_blank=True, required=False)
    description = serializers.CharField(allow_blank=True, required=False)

class JobSeekerProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    # Backwards-compatible convenience: expose a simple list of role names
    # derived from the canonical `suited_job_roles_detailed` JSONField so
    # older frontends keep working until they migrate.
    suited_job_roles = serializers.SerializerMethodField(read_only=True)
    # Accept structured education and experiences payloads and store them in JSONFields
    education = EducationEntrySerializer(many=True, required=False)
    experiences = ExperienceEntrySerializer(many=True, required=False)

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

    def validate_education(self, value):
        """Validate that 'education' is a list of objects with the expected shape.

        Expected fields for each item:
            - degree (str)
            - current (bool)
            - start_year (str|int)
            - end_year (str|int)  (may be empty/null if current is True)
            - location (str)
            - description (str)
            - institution (str)
            - field_of_study (str)
        """
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError("education must be a list")
        required_keys = {'degree', 'current', 'start_year', 'end_year', 'location', 'description', 'institution', 'field_of_study'}
        for idx, item in enumerate(value):
            if not isinstance(item, dict):
                raise serializers.ValidationError({idx: "Each education entry must be an object"})
            missing = required_keys - set(item.keys())
            if missing:
                raise serializers.ValidationError({idx: f"Missing fields: {', '.join(sorted(missing))}"})
            # basic type checks
            if not isinstance(item.get('degree', ''), str) or not item.get('degree', '').strip():
                raise serializers.ValidationError({idx: "degree must be a non-empty string"})
            if not isinstance(item.get('current'), bool):
                raise serializers.ValidationError({idx: "current must be a boolean"})
            # start/end year can be int or string (allow empty end_year if current)
            start = item.get('start_year')
            end = item.get('end_year')
            if start is None or (not isinstance(start, (int, str))):
                raise serializers.ValidationError({idx: "start_year must be a string or integer"})
            if not item['current'] and (end is None or (not isinstance(end, (int, str)))):
                raise serializers.ValidationError({idx: "end_year must be a string or integer when current is False"})
            # institution & field_of_study basic checks
            if not isinstance(item.get('institution', ''), str) or not item.get('institution', '').strip():
                raise serializers.ValidationError({idx: "institution must be a non-empty string"})
            if not isinstance(item.get('field_of_study', ''), str):
                raise serializers.ValidationError({idx: "field_of_study must be a string"})
        return value

    def get_suited_job_roles(self, obj):
        """Return a simple list of role names derived from suited_job_roles_detailed.

        Handles a few shapes defensively: list[dict], list[str], or missing field.
        """
        # Prefer the detailed canonical field if present on the model instance
        detailed = None
        try:
            detailed = getattr(obj, 'suited_job_roles_detailed', None)
        except Exception:
            detailed = None

        if not detailed:
            # Fallback to any legacy value (could be list[str] or list[dict])
            legacy = getattr(obj, 'suited_job_roles', None)
            if not legacy:
                return []
            names = []
            for item in legacy:
                if isinstance(item, str):
                    names.append(item)
                elif isinstance(item, dict):
                    name = item.get('role') or item.get('name')
                    if name:
                        names.append(name)
            return names

        # If we have the detailed list, extract role names safely
        names = []
        if isinstance(detailed, list):
            for item in detailed:
                if isinstance(item, dict):
                    role = item.get('role') or item.get('name')
                    if role:
                        names.append(role)
                elif isinstance(item, str):
                    names.append(item)
        return names


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
