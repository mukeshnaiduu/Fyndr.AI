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
            'location',
            'employment_type',
            'description',
            'requirements',
            'salary_range',
            'url',
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
