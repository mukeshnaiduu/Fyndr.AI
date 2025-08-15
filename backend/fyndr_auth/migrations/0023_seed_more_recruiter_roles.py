from django.db import migrations
from django.utils.text import slugify

RECRUITER_ROLES = [
    # Core recruiting roles
    'Senior Talent Acquisition Specialist',
    'Lead Recruiter',
    'Recruitment Consultant',
    'Recruitment Coordinator',
    'Technical Sourcer',
    'Talent Sourcer',
    'Senior Technical Recruiter',
    'Executive Recruiter',
    'Agency Recruiter',
    'Contract Recruiter',
    'RPO Recruiter',
    'Campus Recruiter',
    'Volume Hiring Specialist',
    'Diversity Recruiter',
    'IT Recruiter',
    'Non-Tech Recruiter',
    'Hiring Manager',
    # People/HR adjacent (recruiter audience)
    'Talent Operations Manager',
    'People & Culture Manager',
    'HR Operations Manager',
    'Compensation & Benefits Manager',
]

POPULAR = set([
    'Senior Talent Acquisition Specialist',
    'Lead Recruiter',
    'Recruitment Consultant',
    'Technical Sourcer',
    'Senior Technical Recruiter',
    'Executive Recruiter',
    'IT Recruiter',
    'Hiring Manager',
])

CATEGORY = 'Human Resources'


def _unique_slug(model, base_slug, exclude_pk=None):
    slug = base_slug
    i = 2
    qs = model.objects
    while qs.filter(slug=slug).exclude(pk=exclude_pk).exists():
        slug = f"{base_slug}-{i}"
        i += 1
    return slug


def upsert_recruiter_roles(apps, schema_editor):
    JobRole = apps.get_model('fyndr_auth', 'JobRole')
    for title in RECRUITER_ROLES:
        normalized = title.lower()
        obj = JobRole.objects.filter(title=title).first()
        if obj:
            changed = False
            if obj.category != CATEGORY:
                obj.category = CATEGORY
                changed = True
            if not obj.normalized_title:
                obj.normalized_title = normalized
                changed = True
            if not obj.slug:
                base = slugify(title) or title.lower().replace(' ', '-')
                obj.slug = _unique_slug(JobRole, base, exclude_pk=obj.pk)
                changed = True
            # Audience flags: recruiter-only
            if not obj.for_recruiters:
                obj.for_recruiters = True
                changed = True
            if obj.for_jobseekers:
                obj.for_jobseekers = False
                changed = True
            # Popularity
            desired_pop = 100 if title in POPULAR else max(obj.popularity or 0, 70)
            if (obj.popularity or 0) < desired_pop:
                obj.popularity = desired_pop
                changed = True
            if not obj.is_active:
                obj.is_active = True
                changed = True
            if changed:
                obj.save()
            continue
        # Create new
        base = slugify(title) or title.lower().replace(' ', '-')
        slug = _unique_slug(JobRole, base)
        JobRole.objects.create(
            title=title,
            normalized_title=normalized,
            slug=slug,
            category=CATEGORY,
            for_jobseekers=False,
            for_recruiters=True,
            is_active=True,
            popularity=100 if title in POPULAR else 70,
        )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0022_tag_roles_by_audience'),
    ]

    operations = [
        migrations.RunPython(upsert_recruiter_roles, noop),
    ]
