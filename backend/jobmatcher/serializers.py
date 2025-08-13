"""
Serializers for JobMatcher models
"""
from rest_framework import serializers
from .models import JobScore, PreparedJob, UserPreferences
from jobscraper.serializers import JobPostingSerializer


class JobScoreSerializer(serializers.ModelSerializer):
    """Serializer for JobScore model"""
    job = JobPostingSerializer(read_only=True)
    
    class Meta:
        model = JobScore
        fields = [
            'id', 'job', 'score', 'skills_matched', 'keywords_missed',
            'embedding_similarity', 'ai_reasoning', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PreparedJobSerializer(serializers.ModelSerializer):
    """Serializer for PreparedJob model"""
    job = JobPostingSerializer(read_only=True)
    
    class Meta:
        model = PreparedJob
        fields = [
            'id', 'job', 'score', 'tailored_resume', 'tailored_cover_letter',
            'ai_customization_notes', 'packet_created_at', 'packet_ready'
        ]
        read_only_fields = ['id', 'packet_created_at']


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for UserPreferences model"""
    
    class Meta:
        model = UserPreferences
        fields = [
            'id', 'preferred_roles', 'preferred_locations', 'salary_expectation',
            'remote_preference', 'min_match_score', 'auto_prepare_threshold',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_min_match_score(self, value):
        """Validate min_match_score is between 0 and 100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Min match score must be between 0 and 100")
        return value
    
    def validate_auto_prepare_threshold(self, value):
        """Validate auto_prepare_threshold is between 0 and 100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Auto prepare threshold must be between 0 and 100")
        return value
