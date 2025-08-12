import pytest
from django.core.management import call_command
from jobscraper.models import JobPosting

@pytest.mark.django_db
def test_scrape_and_urls_valid_small_batch():
    # Scrape a small batch to test validity quickly
    call_command('scrape_india_real_jobs', target_count=30, clear_existing=True)
    jobs = JobPosting.objects.all()
    assert jobs.count() > 0
    invalid = [j.url for j in jobs if not j.is_valid_url()]
    assert not invalid, f"Found invalid URLs: {invalid[:5]} (total {len(invalid)})"
