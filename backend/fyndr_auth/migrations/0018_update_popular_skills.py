from django.db import migrations

POPULAR_SKILLS = [
    'JavaScript', 'TypeScript', 'Python', 'Java',
    'React', 'Node.js', 'Django', 'Express.js',
    'HTML5', 'CSS3', 'Tailwind CSS',
    'PostgreSQL', 'MongoDB', 'MySQL',
    'AWS', 'Docker', 'Kubernetes', 'Git',
    'React Native', 'Flutter'
]


def apply_popularity(apps, schema_editor):
    Skill = apps.get_model('fyndr_auth', 'Skill')
    # Increase popularity for curated skills
    for name in POPULAR_SKILLS:
        Skill.objects.filter(name=name).update(popularity=100, is_active=True)


def revert_popularity(apps, schema_editor):
    Skill = apps.get_model('fyndr_auth', 'Skill')
    # Only revert skills we boosted back to a baseline if they are still at 100
    Skill.objects.filter(name__in=POPULAR_SKILLS, popularity=100).update(popularity=20)


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0017_seed_more_skills'),
    ]

    operations = [
        migrations.RunPython(apply_popularity, revert_popularity),
    ]
