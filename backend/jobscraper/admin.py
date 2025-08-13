from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import JobPosting


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    """
    Admin interface for JobPosting model.
    
    Provides comprehensive management interface for scraped job postings.
    """
    
    list_display = [
        'title',
        'company',
        'location',
        'source',
        'is_active',
        'date_posted',
        'date_scraped',
        'view_job_link'
    ]
    
    list_filter = [
        'source',
        'is_active',
        'date_scraped',
        'date_posted',
        'company'
    ]
    
    search_fields = [
        'title',
        'company',
        'location',
        'description'
    ]
    
    list_editable = ['is_active']
    
    readonly_fields = [
        'external_id',
        'date_scraped',
        'created_at',
        'updated_at',
        'view_job_link',
        'description_preview'
    ]
    
    fieldsets = (
        ('Job Information', {
            'fields': (
                'title',
                'company',
                'location',
                'view_job_link',
                'description_preview'
            )
        }),
        ('Source Information', {
            'fields': (
                'external_id',
                'source',
                'url'
            )
        }),
        ('Dates', {
            'fields': (
                'date_posted',
                'date_scraped',
                'created_at',
                'updated_at'
            )
        }),
        ('Status', {
            'fields': (
                'is_active',
            )
        }),
        ('Full Description', {
            'fields': (
                'description',
            ),
            'classes': ('collapse',)
        })
    )
    
    date_hierarchy = 'date_scraped'
    
    ordering = ['-date_scraped', '-date_posted']
    
    list_per_page = 50
    
    actions = ['activate_jobs', 'deactivate_jobs', 'export_selected_jobs']
    
    def view_job_link(self, obj):
        """Display clickable link to the original job posting."""
        if obj.url:
            return format_html(
                '<a href="{}" target="_blank" rel="noopener">View Original Job</a>',
                obj.url
            )
        return "No URL"
    view_job_link.short_description = "Original Job"
    
    def description_preview(self, obj):
        """Display truncated description in admin."""
        if obj.description:
            preview = obj.description[:300]
            if len(obj.description) > 300:
                preview += "..."
            return format_html('<div style="max-width: 500px;">{}</div>', preview)
        return "No description"
    description_preview.short_description = "Description Preview"
    
    def activate_jobs(self, request, queryset):
        """Admin action to activate selected jobs."""
        updated = queryset.update(is_active=True)
        self.message_user(
            request,
            f"Successfully activated {updated} job posting(s)."
        )
    activate_jobs.short_description = "Activate selected job postings"
    
    def deactivate_jobs(self, request, queryset):
        """Admin action to deactivate selected jobs."""
        updated = queryset.update(is_active=False)
        self.message_user(
            request,
            f"Successfully deactivated {updated} job posting(s)."
        )
    deactivate_jobs.short_description = "Deactivate selected job postings"
    
    def export_selected_jobs(self, request, queryset):
        """Admin action to export selected jobs as CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="job_postings.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Title', 'Company', 'Location', 'Source', 'URL',
            'Date Posted', 'Date Scraped', 'Is Active'
        ])
        
        for job in queryset:
            writer.writerow([
                job.title,
                job.company,
                job.location or '',
                job.source,
                job.url,
                job.date_posted or '',
                job.date_scraped,
                job.is_active
            ])
        
        return response
    export_selected_jobs.short_description = "Export selected jobs as CSV"
    
    def get_queryset(self, request):
        """Optimize queryset for admin list view."""
        return super().get_queryset(request).select_related()
