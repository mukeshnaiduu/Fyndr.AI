from django.db import migrations
from django.utils.text import slugify

ROLES_BY_CATEGORY = {
    'Software Engineering': [
        'Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer',
        'Full Stack Developer', 'Mobile Developer', 'iOS Developer', 'Android Developer',
        'React Developer', 'Node.js Developer', 'Java Developer', 'Python Developer',
        'Golang Developer', 'Ruby on Rails Developer', 'PHP Developer', 'C# .NET Developer',
        'Embedded Systems Engineer', 'Blockchain Developer', 'AR/VR Developer', 'Game Developer',
        'Tech Lead', 'Engineering Manager', 'CTO'
    ],
    'Data': [
        'Data Scientist', 'Data Analyst', 'Data Engineer', 'Machine Learning Engineer',
        'AI Engineer', 'Business Intelligence Analyst', 'Analytics Engineer'
    ],
    'DevOps & Cloud': [
        'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer', 'Cloud Architect',
        'Platform Engineer'
    ],
    'Product': [
        'Product Manager', 'Product Owner', 'Technical Program Manager', 'Project Manager', 'Scrum Master'
    ],
    'Design & UX': [
        'UI/UX Designer', 'Product Designer', 'UX Researcher', 'Visual Designer'
    ],
    'Quality Assurance': [
        'QA Engineer', 'SDET', 'Automation Test Engineer', 'Manual Tester'
    ],
    'Security': [
        'Security Engineer', 'Application Security Engineer', 'Security Analyst'
    ],
    'Marketing': [
        'Digital Marketing Manager', 'SEO Specialist', 'Content Writer', 'Growth Marketer', 'Performance Marketer'
    ],
    'Sales': [
        'Sales Executive', 'Account Executive', 'Business Development Manager', 'Inside Sales Representative', 'Customer Success Manager'
    ],
    'Operations': [
        'Operations Manager', 'Program Manager', 'Operations Analyst'
    ],
    'Support': [
        'Technical Support Engineer', 'Customer Support Specialist'
    ],
    'Human Resources': [
        'HR Manager', 'Talent Acquisition Specialist', 'Recruiter'
    ],
    'Finance': [
        'Financial Analyst', 'Accountant'
    ],
}

# Heavily searched/common roles to boost to the top in suggestions
POPULAR_ROLES = set([
    'Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'React Developer', 'Node.js Developer', 'Java Developer', 'Python Developer',
    'Data Scientist', 'Data Engineer', 'Machine Learning Engineer', 'DevOps Engineer', 'Site Reliability Engineer',
    'Cloud Engineer', 'Product Manager', 'UI/UX Designer', 'QA Engineer', 'Automation Test Engineer',
    'Customer Success Manager'
])


def _unique_slug(model, base_slug, exclude_pk=None):
    slug = base_slug
    i = 2
    qs = model.objects
    while qs.filter(slug=slug).exclude(pk=exclude_pk).exists():
        slug = f"{base_slug}-{i}"
        i += 1
    return slug


def seed_more_roles(apps, schema_editor):
    JobRole = apps.get_model('fyndr_auth', 'JobRole')
    for category, titles in ROLES_BY_CATEGORY.items():
        for title in titles:
            normalized = title.lower()
            obj = JobRole.objects.filter(title=title).first()
            if obj:
                changed = False
                if not obj.category:
                    obj.category = category
                    changed = True
                if not obj.normalized_title:
                    obj.normalized_title = normalized
                    changed = True
                # Popularity boost
                if title in POPULAR_ROLES:
                    if (obj.popularity or 0) < 100:
                        obj.popularity = 100
                        changed = True
                else:
                    if (obj.popularity or 0) < 50:
                        obj.popularity = max(obj.popularity or 0, 50)
                        changed = True
                if not obj.slug:
                    base = slugify(title) or title.lower().replace(' ', '-')
                    obj.slug = _unique_slug(JobRole, base, exclude_pk=obj.pk)
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
                category=category,
                is_active=True,
                popularity=100 if title in POPULAR_ROLES else 50,
            )


def unseed_more_roles(apps, schema_editor):
    # No-op: keep seeded roles
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0018_update_popular_skills'),
    ]

    operations = [
        migrations.RunPython(seed_more_roles, unseed_more_roles),
    ]
