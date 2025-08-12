"""
Scrape real India jobs from ATS sources (Workday, Greenhouse, Lever) with legal, public endpoints.

Notes:
- Uses public JSON APIs/RSS-like endpoints where available.
- Filters for India locations where possible; otherwise searches for 'India' in location text.
- Saves apply_url and normalizes fields for frontend cards/details.
- Safe purge option will TRUNCATE jobs table with CASCADE to remove dependent rows.
"""

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.db import transaction
from datetime import datetime
import requests
import logging
from typing import List, Dict, Any

from jobscraper.models import JobPosting


logger = logging.getLogger(__name__)


class BaseATSScraper:
    source_name = ""

    def __init__(self, timeout: int = 20):
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        })

    def fetch_jobs(self, limit: int = 300) -> List[Dict[str, Any]]:
        raise NotImplementedError

    @staticmethod
    def _norm_url(url: str) -> str:
        if not url:
            return url
        u = url.strip()
        if not u.lower().startswith(("http://", "https://")):
            u = f"https://{u}"
        return u

    def _save(self, jobs: List[Dict[str, Any]]) -> int:
        saved = 0
        for jd in jobs:
            try:
                # Minimal validation
                title = jd.get('title')
                company = jd.get('company')
                url = self._norm_url(jd.get('url') or jd.get('apply_url'))
                if not (title and company and url):
                    continue

                # Ensure apply_url and model defaults
                jd['url'] = url
                jd['apply_url'] = self._norm_url(jd.get('apply_url') or url)
                jd.setdefault('source_type', 'scraped')
                jd.setdefault('application_mode', 'redirect')
                jd.setdefault('date_scraped', timezone.now())
                jd.setdefault('is_active', True)

                # Dedup by external_id+source when present; else by title+company+location
                external_id = jd.get('external_id')
                source = jd.get('source') or self.source_name
                location = jd.get('location')

                qs = None
                if external_id and source:
                    qs = JobPosting.objects.filter(external_id=external_id, source=source)
                else:
                    qs = JobPosting.objects.filter(title__iexact=title, company__iexact=company)
                    if location:
                        qs = qs.filter(location__icontains=location)

                if qs.exists():
                    continue

                # Keep only model fields
                allowed = {
                    'external_id','title','company','company_logo','location','url','source',
                    'date_posted','date_scraped','job_type','employment_mode','description',
                    'requirements','skills_required','skills_preferred','experience_level',
                    'education_level','certifications','tools_technologies','salary_min',
                    'salary_max','currency','compensation_type','benefits','bonus_equity',
                    'company_size','industry','company_rating','company_website',
                    'application_deadline','application_method','is_active','raw_data','apply_url',
                    'source_type','application_mode'
                }
                data = {k: v for k, v in jd.items() if k in allowed}
                JobPosting.objects.create(**data)
                saved += 1
            except Exception as e:
                logger.warning(f"Skip job due to error: {e}")
        return saved


class GreenhouseScraper(BaseATSScraper):
    source_name = 'greenhouse'

    def __init__(self, boards: List[str]):
        super().__init__()
        self.boards = boards

    def fetch_jobs(self, limit: int = 300) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for board in self.boards:
            try:
                url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs?content=true"
                r = self.session.get(url, timeout=self.timeout)
                if r.status_code != 200:
                    continue
                data = r.json() or {}
                for job in data.get('jobs', []):
                    loc = (job.get('location') or {}).get('name') or ''
                    if 'india' not in (loc or '').lower():
                        continue
                    out.append({
                        'external_id': str(job.get('id')),
                        'title': job.get('title'),
                        'company': board.title(),
                        'location': loc,
                        'description': (job.get('content') or '')[:1000],
                        'url': job.get('absolute_url'),
                        'apply_url': job.get('absolute_url'),
                        'source': 'greenhouse',
                        'date_posted': self._parse_dt(job.get('updated_at')),
                        'employment_mode': None,
                        'job_type': None,
                    })
                    if len(out) >= limit:
                        break
                if len(out) >= limit:
                    break
            except Exception as e:
                logger.error(f"Greenhouse {board} failed: {e}")
        return out

    @staticmethod
    def _parse_dt(s):
        if not s:
            return None
        try:
            return datetime.fromisoformat(s.replace('Z','+00:00')).date()
        except Exception:
            return None


class LeverScraper(BaseATSScraper):
    source_name = 'lever'

    def __init__(self, companies: List[str]):
        super().__init__()
        self.companies = companies

    def fetch_jobs(self, limit: int = 300) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for slug in self.companies:
            try:
                url = f"https://api.lever.co/v0/postings/{slug}?mode=json"
                r = self.session.get(url, timeout=self.timeout)
                if r.status_code != 200:
                    continue
                data = r.json() or []
                for job in data:
                    loc = ((job.get('categories') or {}).get('location') or '')
                    if 'india' not in (loc or '').lower():
                        continue
                    out.append({
                        'external_id': job.get('id'),
                        'title': job.get('text'),
                        'company': slug.title(),
                        'location': loc,
                        'description': (job.get('descriptionPlain') or '')[:1000],
                        'url': job.get('hostedUrl'),
                        'apply_url': job.get('hostedUrl'),
                        'source': 'lever',
                        'date_posted': None,
                    })
                    if len(out) >= limit:
                        break
                if len(out) >= limit:
                    break
            except Exception as e:
                logger.error(f"Lever {slug} failed: {e}")
        return out


class WorkdayScraper(BaseATSScraper):
    source_name = 'workday'

    def __init__(self, sites: List[Dict[str, str]]):
        super().__init__()
        self.sites = sites

    def fetch_jobs(self, limit: int = 300) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for cfg in self.sites:
            host = cfg['host']
            tenant = cfg['tenant']
            site = cfg['site']
            company = cfg.get('company') or tenant.title()
            try:
                base = f"https://{host}/wday/cxs/{tenant}/{site}/jobs"
                page_size = 20
                max_pages = max(1, min(50, (limit // page_size) + 3))
                seen_first_ids = set()
                offset = 0
                page_count = 0
                while True:
                    payload = {"limit": page_size, "offset": offset, "searchText": "India"}
                    r = self.session.post(base, json=payload, timeout=self.timeout)
                    if r.status_code != 200:
                        break
                    data = r.json() or {}
                    # Normalize list of jobs (flatten common shapes)
                    reqs: List[Dict[str, Any]] = []
                    def extend_from_container(container):
                        if isinstance(container, dict):
                            jp = container.get('jobPostings')
                            js = container.get('jobs')
                            if isinstance(jp, list):
                                for it in jp:
                                    if isinstance(it, dict):
                                        reqs.append(it)
                            if isinstance(js, list):
                                for it in js:
                                    if isinstance(it, dict):
                                        reqs.append(it)
                            # Sometimes the container itself is a job-like dict
                            if ('title' in container or 'externalPath' in container or 'id' in container) and container not in reqs:
                                reqs.append(container)
                        elif isinstance(container, list):
                            for it in container:
                                extend_from_container(it)

                    extend_from_container(data)
                    if not reqs:
                        break
                    # loop guards
                    first_id = None
                    try:
                        j0 = reqs[0]
                        if isinstance(j0, dict):
                            bf = j0.get('bulletFields') or {}
                            if isinstance(bf, dict):
                                first_id = j0.get('id') or bf.get('jobId')
                            else:
                                first_id = j0.get('id')
                    except Exception:
                        first_id = None
                    if first_id:
                        if first_id in seen_first_ids:
                            break
                        seen_first_ids.add(first_id)
                    for j in reqs:
                        if not isinstance(j, dict):
                            continue
                        title = j.get('title') or j.get('titleShort')
                        # Parse location robustly
                        loc = j.get('locationsText')
                        if not loc:
                            locs = j.get('locations')
                            if isinstance(locs, list):
                                parts = []
                                for li in locs:
                                    if isinstance(li, dict):
                                        parts.append(li.get('displayName') or li.get('name') or li.get('city') or '')
                                    else:
                                        parts.append(str(li))
                                loc = ', '.join([p for p in parts if p])
                            elif isinstance(locs, str):
                                loc = locs
                        # externalPath might appear under nested props in some responses; guard with defaults
                        ext_path = j.get('externalPath') or j.get('externalPathName') or j.get('externalUrl')
                        job_url = f"https://{host}{ext_path}" if ext_path and ext_path.startswith('/') else (ext_path or base)
                        if not ((loc and isinstance(loc, str) and 'india' in loc.lower()) or ('india' in (title or '').lower())):
                            continue
                        bf = j.get('bulletFields') or {}
                        external_id = None
                        if isinstance(bf, dict):
                            external_id = bf.get('jobId')
                        if not external_id:
                            external_id = j.get('id')
                        if not external_id and isinstance(j.get('id'), list):
                            # Some odd shapes return a list of ids; join safely
                            try:
                                external_id = '-'.join([str(x) for x in j.get('id')])
                            except Exception:
                                external_id = None
                        out.append({
                            'external_id': external_id or job_url,
                            'title': title,
                            'company': company,
                            'location': loc,
                            'description': (j.get('description') or j.get('subtitle') or '')[:1000],
                            'url': job_url,
                            'apply_url': job_url,
                            'source': 'workday',
                            'date_posted': None,
                        })
                        if len(out) >= limit:
                            break
                    if len(out) >= limit:
                        break
                    offset += page_size
                    page_count += 1
                    if page_count >= max_pages or offset > 1000:
                        break
            except Exception:
                logger.exception(f"Workday {tenant}/{site} failed")
            if len(out) >= limit:
                break
        return out


class Command(BaseCommand):
    help = 'Scrape real India jobs from ATS sources (Workday, Greenhouse, Lever) with valid apply URLs.'

    def add_arguments(self, parser):
        parser.add_argument('--target-count', type=int, default=1000)
        parser.add_argument('--clear-existing', action='store_true', help='Clear ALL jobs (including recruiter) before scraping')
        parser.add_argument('--clear-scraped', action='store_true', help='Clear only scraped jobs before scraping')

    def handle(self, *args, **options):
        target = options['target_count']
        clear_all = options.get('clear_existing')
        clear_scraped = options.get('clear_scraped')

        if clear_all:
            try:
                with transaction.atomic():
                    JobPosting.objects.all().delete()
            except Exception:
                from django.db import connection
                with connection.cursor() as cur:
                    cur.execute('TRUNCATE TABLE jobscraper_jobposting RESTART IDENTITY CASCADE')
            self.stdout.write(self.style.WARNING('Cleared ALL existing jobs'))
        elif clear_scraped:
            # Use raw SQL to avoid ORM cascades if dependent tables are missing in this DB
            from django.db import connection
            with connection.cursor() as cur:
                cur.execute("DELETE FROM jobscraper_jobposting WHERE source_type = %s", ['scraped'])
                deleted = cur.rowcount if cur.rowcount is not None else 0
            self.stdout.write(self.style.WARNING(f"Cleared {deleted} scraped jobs (kept recruiter jobs)"))

        total_saved = 0

        # Configure sources (curated examples known to have India roles)
        greenhouse_boards = [
            # add boards that commonly list India jobs
            'uber', 'twilio', 'atlassian', 'stripe', 'snowflake', 'zscaler', 'palantir', 'salesforce', 'databricks',
            'doordash', 'cloudflare', 'dropbox', 'okta', 'robinhood', 'pinterest', 'mongodb', 'elastic', 'hashicorp',
            'square', 'block', 'figma', 'reddit', 'hackerone', 'zapier', 'loom', 'linear', 'notion', 'sentry', 'postman',
            'swiggy', 'meesho', 'razorpay', 'slice', 'cred', 'gainsight', 'zomato', 'plaid', 'phonepe', 'groww', 'freshworks', 'thoughtspot'
        ]
        lever_companies = [
            'airbnb', 'rippling', 'ramp', 'fivetran', 'algolia', 'asana', 'brex', 'affirm', 'opendoor', 'scaleai',
            'instacart', 'benchling', 'discord', 'plotly', 'sourcegraph', 'gusto', 'webflow', 'openai', 'anthropic', 'nuro', 'stripe'
        ]
        workday_sites = [
            { 'host': 'nvidia.wd5.myworkdayjobs.com', 'tenant': 'nvidia', 'site': 'NVIDIAExternalCareerSite', 'company': 'NVIDIA' },
            { 'host': 'adobe.wd5.myworkdayjobs.com', 'tenant': 'adobe', 'site': 'external_experienced', 'company': 'Adobe' },
            { 'host': 'vmware.wd1.myworkdayjobs.com', 'tenant': 'vmware', 'site': 'VMware', 'company': 'VMware' },
            { 'host': 'microsoft.wd1.myworkdayjobs.com', 'tenant': 'microsoft', 'site': 'global', 'company': 'Microsoft' },
            { 'host': 'cisco.wd1.myworkdayjobs.com', 'tenant': 'cisco', 'site': 'CiscoCareers', 'company': 'Cisco' },
            { 'host': 'dell.wd1.myworkdayjobs.com', 'tenant': 'dell', 'site': 'DellCareers', 'company': 'Dell' },
            { 'host': 'intel.wd1.myworkdayjobs.com', 'tenant': 'intel', 'site': 'External', 'company': 'Intel' },
            { 'host': 'sap.wd3.myworkdayjobs.com', 'tenant': 'sap', 'site': 'SAPCareers', 'company': 'SAP' },
            { 'host': 'siemens.wd3.myworkdayjobs.com', 'tenant': 'siemens', 'site': 'careers', 'company': 'Siemens' },
            { 'host': 'salesforce.wd1.myworkdayjobs.com', 'tenant': 'salesforce', 'site': 'External_Career_Site', 'company': 'Salesforce' },
            { 'host': 'amd.wd1.myworkdayjobs.com', 'tenant': 'amd', 'site': 'AMD', 'company': 'AMD' },
            { 'host': 'qualcomm.wd5.myworkdayjobs.com', 'tenant': 'qualcomm', 'site': 'careers', 'company': 'Qualcomm' },
            { 'host': 'google.wd1.myworkdayjobs.com', 'tenant': 'google', 'site': 'en-US', 'company': 'Google' },
            { 'host': 'amazon.wd1.myworkdayjobs.com', 'tenant': 'amazon', 'site': 'global', 'company': 'Amazon' },
            { 'host': 'oracle.wd3.myworkdayjobs.com', 'tenant': 'oracle', 'site': 'external', 'company': 'Oracle' },
            { 'host': 'hpe.wd5.myworkdayjobs.com', 'tenant': 'hpe', 'site': 'careers', 'company': 'HPE' },
            { 'host': 'ibm.wd1.myworkdayjobs.com', 'tenant': 'ibm', 'site': 'Search', 'company': 'IBM' },
            { 'host': 'pepsico.wd1.myworkdayjobs.com', 'tenant': 'pepsico', 'site': 'PepsiCoCareers', 'company': 'PepsiCo' },
            { 'host': 'bytedance.wd1.myworkdayjobs.com', 'tenant': 'bytedance', 'site': 'ByteDance', 'company': 'ByteDance' },
        ]

        sources: List[BaseATSScraper] = [
            WorkdayScraper(workday_sites),
            GreenhouseScraper(greenhouse_boards),
            LeverScraper(lever_companies),
        ]

        for src in sources:
            if total_saved >= target:
                break
            self.stdout.write(f"Fetching from {src.source_name}...")
            try:
                remaining = max(0, target - total_saved)
                if remaining == 0:
                    break
                jobs = src.fetch_jobs(limit=remaining)
            except Exception as e:
                logger.error(f"Source {src.source_name} failed: {e}")
                jobs = []
            if not jobs:
                continue
            # Cap by remaining
            remaining = target - total_saved
            jobs = jobs[:max(remaining, 0)]
            saved = src._save(jobs)
            total_saved += saved
            self.stdout.write(self.style.SUCCESS(f"Saved {saved} from {src.source_name}. Total: {total_saved}"))

        self.stdout.write(self.style.SUCCESS(f"Done. Total saved: {total_saved}"))
