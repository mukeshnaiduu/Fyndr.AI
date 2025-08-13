from django.contrib import admin
from .models import JobScore, PreparedJob, UserPreferences


@admin.register(JobScore)
class JobScoreAdmin(admin.ModelAdmin):
    list_display = ['job', 'user_profile', 'score', 'match_status', 'scored_at']
    list_filter = ['match_status', 'scored_at', 'score']
    search_fields = ['job__title', 'job__company', 'user_profile__user__first_name', 'user_profile__user__last_name']
    ordering = ['-score', '-scored_at']
    readonly_fields = ['scored_at', 'match_status']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('job', 'user_profile', 'score', 'match_status')
        }),
        ('Skills Analysis', {
            'fields': ('skills_matched', 'keywords_missed'),
            'classes': ('collapse',)
        }),
        ('AI Enhancement (Future)', {
            'fields': ('embedding_similarity', 'ai_reasoning'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('scored_at',),
            'classes': ('collapse',)
        })
    )


@admin.register(PreparedJob)
class PreparedJobAdmin(admin.ModelAdmin):
    list_display = ['job', 'user_profile', 'score', 'packet_ready', 'applied', 'packet_created_at']
    list_filter = ['packet_ready', 'applied', 'packet_created_at', 'score']
    search_fields = ['job__title', 'job__company', 'user_profile__user__first_name', 'user_profile__user__last_name']
    ordering = ['-score', '-packet_created_at']
    readonly_fields = ['packet_created_at', 'last_updated', 'applied_at', 'completion_status']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('job', 'user_profile', 'score')
        }),
        ('Documents', {
            'fields': ('tailored_resume', 'tailored_cover_letter', 'packet_ready')
        }),
        ('Application Status', {
            'fields': ('applied', 'applied_at', 'completion_status'),
            'classes': ('collapse',)
        }),
        ('AI Enhancement (Future)', {
            'fields': ('ai_customization_notes', 'confidence_score'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('packet_created_at', 'last_updated'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['mark_as_applied', 'reset_application_status']
    
    def mark_as_applied(self, request, queryset):
        for prepared_job in queryset:
            prepared_job.mark_as_applied()
        self.message_user(request, f"Marked {queryset.count()} job packets as applied.")
    mark_as_applied.short_description = "Mark selected packets as applied"
    
    def reset_application_status(self, request, queryset):
        queryset.update(applied=False, applied_at=None)
        self.message_user(request, f"Reset application status for {queryset.count()} job packets.")
    reset_application_status.short_description = "Reset application status"


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user_profile', 'salary_expectation', 'remote_preference', 'min_match_score', 'updated_at']
    list_filter = ['remote_preference', 'salary_currency', 'min_match_score', 'updated_at']
    search_fields = ['user_profile__user__first_name', 'user_profile__user__last_name', 'user_profile__user__email']
    ordering = ['-updated_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user_profile',)
        }),
        ('Job Preferences', {
            'fields': ('preferred_roles', 'preferred_locations', 'remote_preference', 'employment_types')
        }),
        ('Compensation', {
            'fields': ('salary_expectation', 'salary_currency')
        }),
        ('Company Preferences', {
            'fields': ('company_sizes', 'industries'),
            'classes': ('collapse',)
        }),
        ('AI Matching Settings', {
            'fields': ('min_match_score', 'auto_apply_threshold'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
