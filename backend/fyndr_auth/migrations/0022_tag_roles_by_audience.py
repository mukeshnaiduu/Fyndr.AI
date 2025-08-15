from django.db import migrations

JOBSEEKER_TITLES = set([
    # Software Engineering
    'Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Mobile Developer', 'iOS Developer', 'Android Developer',
    'React Developer', 'Node.js Developer', 'Java Developer', 'Python Developer',
    'Golang Developer', 'Ruby on Rails Developer', 'PHP Developer', 'C# .NET Developer',
    'Embedded Systems Engineer', 'Blockchain Developer', 'AR/VR Developer', 'Game Developer',
    'Tech Lead', 'Engineering Manager',
    # Data
    'Data Scientist', 'Data Analyst', 'Data Engineer', 'Machine Learning Engineer',
    'AI Engineer', 'Business Intelligence Analyst', 'Analytics Engineer',
    # DevOps & Cloud
    'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer', 'Cloud Architect', 'Platform Engineer',
    # Product
    'Product Manager', 'Product Owner', 'Technical Program Manager', 'Project Manager', 'Scrum Master',
    # Design & UX
    'UI/UX Designer', 'Product Designer', 'UX Researcher', 'Visual Designer',
    # QA
    'QA Engineer', 'SDET', 'Automation Test Engineer', 'Manual Tester',
    # Security
    'Security Engineer', 'Application Security Engineer', 'Security Analyst',
    # Marketing
    'Digital Marketing Manager', 'SEO Specialist', 'Content Writer', 'Growth Marketer', 'Performance Marketer',
    # Sales
    'Sales Executive', 'Account Executive', 'Business Development Manager', 'Inside Sales Representative', 'Customer Success Manager',
    # Operations
    'Operations Manager', 'Program Manager', 'Operations Analyst',
    # Support
    'Technical Support Engineer', 'Customer Support Specialist',
])

RECRUITER_TITLES = set([
    'HR Manager', 'Talent Acquisition Specialist', 'Recruiter', 'Senior Recruiter', 'Technical Recruiter',
    'People Operations Manager', 'HR Business Partner', 'HR Generalist', 'HRBP',
    'Recruitment Manager', 'Head of Talent', 'TA Manager'
])


def tag_roles(apps, schema_editor):
    JobRole = apps.get_model('fyndr_auth', 'JobRole')
    for role in JobRole.objects.all():
        title = (role.title or '').strip()
        js = title in JOBSEEKER_TITLES
        rc = title in RECRUITER_TITLES
        # default: if in neither list, consider for jobseekers
        role.for_jobseekers = js or not rc
        role.for_recruiters = rc
        role.save(update_fields=['for_jobseekers', 'for_recruiters'])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0021_set_role_audience_defaults'),
    ]

    operations = [
        migrations.RunPython(tag_roles, noop),
    ]
