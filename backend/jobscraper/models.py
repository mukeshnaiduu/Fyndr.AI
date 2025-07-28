from django.db import models
from django.utils import timezone
import hashlib


class JobPosting(models.Model):
    """
    Model to store job postings scraped from various sources.
    
    Each job posting is uniquely identified by external_id + source combination
    to prevent duplicates from the same source.
    """
    
    # Core job information
    external_id = models.CharField(
        max_length=255,
        help_text="Unique identifier from the source (can be URL hash if no ID available)"
    )
    title = models.CharField(max_length=255, help_text="Job title")
    company = models.CharField(max_length=255, help_text="Company name")
    location = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        help_text="Job location (can be 'Remote', city, etc.)"
    )
    description = models.TextField(help_text="Full job description", blank=True, null=True)
    url = models.URLField(help_text="Direct link to the job posting")
    
    # Source tracking
    source = models.CharField(
        max_length=50,
        help_text="Source identifier (e.g., 'greenhouse', 'weworkremotely')"
    )
    
    # Timestamps
    date_posted = models.DateField(
        null=True, 
        blank=True,
        help_text="Date the job was originally posted (from source)"
    )
    date_scraped = models.DateTimeField(
        default=timezone.now,
        help_text="When this job was scraped by our system"
    )
    
    # Additional metadata
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this job posting is still active"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Ensure no duplicate jobs from the same source
        unique_together = ['external_id', 'source']
        ordering = ['-date_scraped', '-date_posted']
        indexes = [
            models.Index(fields=['source', 'date_scraped']),
            models.Index(fields=['company']),
            models.Index(fields=['location']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.title} at {self.company} ({self.source})"
    
    @classmethod
    def generate_external_id(cls, url, title=None, company=None):
        """
        Generate a unique external_id when source doesn't provide one.
        Uses URL and optionally title/company for uniqueness.
        """
        base_string = url
        if title:
            base_string += f"|{title}"
        if company:
            base_string += f"|{company}"
        
        return hashlib.md5(base_string.encode()).hexdigest()[:16]
    
    def save(self, *args, **kwargs):
        """Override save to auto-generate external_id if not provided."""
        if not self.external_id:
            self.external_id = self.generate_external_id(
                self.url, self.title, self.company
            )
        super().save(*args, **kwargs)
