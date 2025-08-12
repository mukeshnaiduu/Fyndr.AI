from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import JobApplication, ApplicationEvent, ApplicationTracking
from jobscraper.models import JobPosting

User = get_user_model()


class JobApplicationSerializer(serializers.ModelSerializer):
    """Serializer for JobApplication model"""
    
    job_title = serializers.CharField(source='job.title', read_only=True)
    company = serializers.CharField(source='job.company', read_only=True)
    company_logo = serializers.URLField(source='job.company_logo', read_only=True)
    job_location = serializers.CharField(source='job.location', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    # Back-compat alias for UI consistency
    confirmation_number = serializers.CharField(source='external_application_id', read_only=True, allow_null=True)
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'user', 'username', 'job', 'job_title', 'company', 'company_logo', 
            'job_location', 'status', 'application_method', 'external_application_id',
            'confirmation_number', 'application_url', 'resume_text', 'cover_letter_text', 'custom_answers',
            'automation_log', 'ats_response', 'notes', 'is_tracking_enabled',
            'last_status_check', 'status_updates',
            'is_verified', 'verified_at', 'verified_source', 'email_confirmed', 'email_confirmed_at',
            'applied_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'applied_at']
    
    def create(self, validated_data):
        # Set user from request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ApplicationEventSerializer(serializers.ModelSerializer):
    """Serializer for ApplicationEvent model"""
    
    application_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ApplicationEvent
        fields = [
            'id', 'application', 'application_info', 'event_type', 'title', 
            'description', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_application_info(self, obj):
        return {
            'job_title': obj.application.job.title,
            'company': obj.application.job.company,
            'status': obj.application.status
        }


class ApplicationTrackingSerializer(serializers.ModelSerializer):
    """Serializer for ApplicationTracking model"""
    
    application_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ApplicationTracking
        fields = [
            'id', 'application', 'application_info', 'ats_system', 'external_tracking_id',
            'tracking_url', 'last_checked', 'check_frequency_minutes', 'next_check',
            'email_monitoring_enabled', 'email_keywords', 'tracking_data', 
            'status_history', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_checked']
    
    def get_application_info(self, obj):
        return {
            'job_title': obj.application.job.title,
            'company': obj.application.job.company,
            'status': obj.application.status
        }


class ApplicationCreateSerializer(serializers.Serializer):
    """Serializer for creating new applications (tolerant inputs)"""

    job_id = serializers.IntegerField()
    # Accept plain string and coerce to enum; default to 'manual' when missing/invalid
    application_method = serializers.CharField(required=False, allow_blank=True)
    resume_text = serializers.CharField(required=False, allow_blank=True)
    cover_letter_text = serializers.CharField(required=False, allow_blank=True)
    custom_answers = serializers.JSONField(required=False, default=dict)
    notes = serializers.CharField(required=False, allow_blank=True)
    enable_tracking = serializers.BooleanField(default=True)
    
    def validate_job_id(self, value):
        try:
            job = JobPosting.objects.get(id=value)
            return value
        except JobPosting.DoesNotExist:
            raise serializers.ValidationError("Job posting not found")
    
    def create(self, validated_data):
        user = self.context['request'].user
        job = JobPosting.objects.get(id=validated_data['job_id'])
        
        # Check if application already exists
        if JobApplication.objects.filter(user=user, job=job).exists():
            raise serializers.ValidationError("You have already applied to this job")
        
        # Normalize application_method
        method_str = (validated_data.get('application_method') or '').strip().lower()
        enum_choices = {c.value for c in JobApplication.ApplicationMethod}
        if method_str not in enum_choices:
            method_str = JobApplication.ApplicationMethod.MANUAL

        application = JobApplication.objects.create(
            user=user,
            job=job,
            application_method=method_str,
            resume_text=validated_data.get('resume_text', ''),
            cover_letter_text=validated_data.get('cover_letter_text', ''),
            custom_answers=validated_data.get('custom_answers', {}),
            notes=validated_data.get('notes', ''),
            is_tracking_enabled=validated_data.get('enable_tracking', True)
        )
        
        # Create initial event
        ApplicationEvent.objects.create(
            application=application,
            event_type=ApplicationEvent.EventType.APPLIED,
            title=f"Applied to {job.title}",
            description=f"Application submitted via {application.application_method}",
            metadata={'method': application.application_method}
        )
        
        # Create tracking if enabled
        if application.is_tracking_enabled:
            ApplicationTracking.objects.create(
                application=application,
                check_frequency_minutes=60,
                email_monitoring_enabled=True
            )
        
        return application


class ApplicationStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating application status"""
    
    status = serializers.ChoiceField(choices=JobApplication.ApplicationStatus.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False, default=dict)
    
    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data['status']
        
        # Update application
        instance.status = new_status
        if 'notes' in validated_data:
            instance.notes = validated_data['notes']
        instance.save()
        
        # Create status change event
        ApplicationEvent.objects.create(
            application=instance,
            event_type=ApplicationEvent.EventType.STATUS_CHANGE,
            title=f"Status changed from {old_status} to {new_status}",
            description=validated_data.get('notes', ''),
            metadata={
                'old_status': old_status,
                'new_status': new_status,
                **validated_data.get('metadata', {})
            }
        )
        
        return instance
