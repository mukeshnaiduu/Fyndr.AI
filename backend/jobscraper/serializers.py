from rest_framework import serializers
from .models import JobPosting


class JobPostingSerializer(serializers.ModelSerializer):
    """Serializer for JobPosting model with all relevant fields."""
    
    job_id = serializers.SerializerMethodField()
    employment_type = serializers.SerializerMethodField()
    requirements = serializers.SerializerMethodField()
    salary_range = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = [
            'job_id',
            'external_id',
            'title',
            'company',
            'company_logo',
            'location',
            'employment_type',
            'description',
            'requirements',
            'salary_range',
            'url',
            'apply_url',
            'application_mode',
            'source_type',
            'source',
            'date_posted',
            'date_scraped',
            'is_active',
        ]
    
    def get_job_id(self, obj):
        """Return the Django model ID as job_id."""
        return obj.id
    
    def get_employment_type(self, obj):
        """Extract employment type from description or return default."""
        # Handle None or empty description
        if not obj.description:
            return 'To be updated'
            
        # Try to extract employment type from description
        description_lower = obj.description.lower()
        if 'full-time' in description_lower or 'full time' in description_lower:
            return 'Full-time'
        elif 'part-time' in description_lower or 'part time' in description_lower:
            return 'Part-time'
        elif 'contract' in description_lower:
            return 'Contract'
        elif 'intern' in description_lower:
            return 'Internship'
        else:
            return 'To be updated'  # Default when no clear type is found
    
    def get_requirements(self, obj):
        """Extract requirements from description."""
        # Handle None or empty description
        if not obj.description:
            return ['To be updated']
            
        # Simple extraction - look for common requirement patterns
        description = obj.description
        requirements = []
        
        # Look for skills, qualifications, requirements sections
        lines = description.split('\n')
        capture_next = False
        
        for line in lines:
            line_lower = line.lower().strip()
            if any(keyword in line_lower for keyword in ['requirements', 'qualifications', 'skills', 'must have', 'we need']):
                capture_next = True
                continue
            
            if capture_next and line.strip():
                if line.strip().startswith('•') or line.strip().startswith('-') or line.strip().startswith('*'):
                    requirements.append(line.strip())
                elif len(requirements) > 0:
                    break
        
        return requirements if requirements else ['To be updated']
    
    def get_salary_range(self, obj):
        """Extract salary information from description."""
        # Handle None or empty description
        if not obj.description:
            return 'To be updated'
            
        # Look for salary patterns in description
        description = obj.description.lower()
        
        # Common salary patterns
        import re
        salary_patterns = [
            r'\$[\d,]+\s*-\s*\$[\d,]+',
            r'[\d,]+k\s*-\s*[\d,]+k',
            r'salary.*?\$[\d,]+',
            r'compensation.*?\$[\d,]+',
        ]
        
        for pattern in salary_patterns:
            match = re.search(pattern, description)
            if match:
                return match.group(0)
        
        return 'To be updated'


class JobPostingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job listings."""
    
    job_id = serializers.SerializerMethodField()
    employment_type = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = [
            'job_id',
            'title',
            'company',
            'location',
            'employment_type',
            'url',
            'apply_url',
            'application_mode',
            'source_type',
            'source',
            'date_posted',
            'date_scraped',
        ]
    
    def get_job_id(self, obj):
        return obj.id
    
    def get_employment_type(self, obj):
        if not obj.description:
            return 'To be updated'
            
        description_lower = obj.description.lower()
        if 'full-time' in description_lower or 'full time' in description_lower:
            return 'Full-time'
        elif 'part-time' in description_lower or 'part time' in description_lower:
            return 'Part-time'
        elif 'contract' in description_lower:
            return 'Contract'
        elif 'intern' in description_lower:
            return 'Internship'
        else:
            return 'To be updated'


class RecruiterJobSerializer(serializers.ModelSerializer):
    """Serializer for recruiter-created jobs (CRUD)."""
    applications_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = JobPosting
        read_only_fields = ['id', 'external_id', 'source', 'source_type', 'date_scraped', 'created_at', 'updated_at']
        fields = [
            'id', 'title', 'company', 'company_logo', 'location', 'description',
            'job_type', 'employment_mode', 'experience_level', 'education_level',
            'salary_min', 'salary_max', 'currency', 'compensation_type', 'benefits',
            'bonus_equity', 'company_size', 'industry', 'company_website',
            'application_deadline', 'application_method', 'number_of_openings',
            'visa_sponsorship', 'relocation_assistance', 'travel_requirements',
            'languages_required', 'apply_url', 'url', 'application_mode',
            'is_active', 'applications_count',
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        # Force recruiter-owned fields
        validated_data['source_type'] = 'recruiter'
        validated_data['source'] = 'recruiter_portal'
        validated_data['recruiter_owner'] = user
        # Ensure URL/external_id consistency
        request = self.context.get('request')
        # Prefer explicit url, else fallback to apply_url, else build a valid placeholder
        if not validated_data.get('url'):
            if validated_data.get('apply_url'):
                validated_data['url'] = validated_data['apply_url']
            else:
                # Build a valid absolute URL placeholder (prevents URLField/MD5 errors in model.save)
                placeholder = (request.build_absolute_uri('/') if request else 'https://app.local/')
                validated_data['url'] = placeholder.rstrip('/') + f"/recruiter/jobs/{user.id}/new"
        # Provide a deterministic external_id for recruiter jobs
        # Use a synthetic base including user and title to avoid MD5 over None
        base = f"recruiter:{user.id}:{validated_data.get('title','')}:" \
               f"{validated_data.get('company','')}:${validated_data.get('url')}"
        try:
            # Import model class to call helper
            from .models import JobPosting as JobModel
            validated_data['external_id'] = JobModel.generate_external_id(base, validated_data.get('title'), validated_data.get('company'))
        except Exception:
            # Fallback hash
            import hashlib
            validated_data['external_id'] = hashlib.md5(base.encode()).hexdigest()[:16]
        return super().create(validated_data)

    def validate(self, attrs):
    # For recruiter jobs, require application_mode
        mode = attrs.get('application_mode')
        if mode not in ['quick', 'redirect']:
            attrs['application_mode'] = 'quick'
    # Allow creating recruiter jobs without external URLs (Quick Apply in-platform)
        return attrs
