from django.core.management.base import BaseCommand
from django.db.models import Q
from urllib.parse import quote_plus

from jobscraper.models import JobPosting

SAFE_SEARCH_BASE = "https://www.google.com/search?q="


def build_safe_url(company: str, title: str) -> str:
    query = quote_plus(f"{company} {title} jobs")
    return f"{SAFE_SEARCH_BASE}{query}"


class Command(BaseCommand):
    help = "Normalize job URLs to safe, resolvable links for bad/malformed career domains"

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Print changes without saving')
        parser.add_argument('--limit', type=int, default=0, help='Limit number of records to update (0 = all)')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']

        bad_patterns = [
            'careers.',  # guessed subdomains like careers.amazonindia.com
            'career.',
            'jobs.',
        ]

        # Candidates: URLs without scheme or that include bad patterns and return NXDOMAIN often
        qs = JobPosting.objects.all()

        # No scheme or starts with www only
        qs = qs.filter(
            Q(url__startswith='www.') | Q(url__startswith='careers.') | Q(url__startswith='jobs.') | Q(url__icontains='careers.')
        ) | JobPosting.objects.filter(url__regex=r'^(?!https?://).+')

        # Limit if requested
        total = qs.count()
        if limit and limit < total:
            qs = qs[:limit]

        updated = 0
        for job in qs:
            old_url = job.url or ''
            # If already a full http(s) URL but with a suspicious careers.<guess>, swap to safe search
            needs_fix = False
            if old_url and not old_url.lower().startswith(('http://', 'https://')):
                needs_fix = True
            if any(pat in old_url.lower() for pat in bad_patterns):
                needs_fix = True

            if not needs_fix:
                continue

            new_url = build_safe_url(job.company or '', job.title or '')

            if dry_run:
                self.stdout.write(f"Would update ID {job.id}: {old_url} -> {new_url}")
                continue

            job.url = new_url
            job.save(update_fields=['url'])
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"Processed {total} records. Updated {updated} URLs."))
