from django.db import migrations, models
from django.utils.text import slugify


def seed_skills_and_roles(apps, schema_editor):
    Skill = apps.get_model('fyndr_auth', 'Skill')
    JobRole = apps.get_model('fyndr_auth', 'JobRole')
    # Minimal seed; can be expanded later or loaded via fixtures
    skills = [
        ('Python', 'Programming Languages'),
        ('JavaScript', 'Programming Languages'),
        ('React', 'Frontend Development'),
        ('Django', 'Backend Development'),
        ('SQL', 'Database'),
        ('AWS', 'Cloud & DevOps'),
    ]
    roles = [
        ('Software Engineer', 'Engineering'),
        ('Frontend Developer', 'Engineering'),
        ('Backend Developer', 'Engineering'),
        ('Full Stack Developer', 'Engineering'),
        ('Data Scientist', 'Data'),
        ('Product Manager', 'Product'),
    ]
    for name, category in skills:
        Skill.objects.get_or_create(
            name=name,
            defaults={
                'slug': slugify(name),
                'category': category,
                'popularity': 10,
                'is_active': True,
            }
        )
    for title, category in roles:
        JobRole.objects.get_or_create(
            title=title,
            defaults={
                'normalized_title': title.lower(),
                'slug': slugify(title),
                'category': category,
                'popularity': 10,
                'is_active': True,
            }
        )


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobseekerprofile',
            name='preferred_roles',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.CreateModel(
            name='Skill',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=150, unique=True)),
                ('slug', models.SlugField(max_length=180, unique=True)),
                ('category', models.CharField(blank=True, max_length=120)),
                ('is_active', models.BooleanField(default=True)),
                ('popularity', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='JobRole',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(db_index=True, max_length=150, unique=True)),
                ('normalized_title', models.CharField(db_index=True, max_length=150)),
                ('slug', models.SlugField(max_length=180, unique=True)),
                ('category', models.CharField(blank=True, max_length=120)),
                ('is_active', models.BooleanField(default=True)),
                ('popularity', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.RunPython(seed_skills_and_roles, migrations.RunPython.noop),
    ]
