# Generated migration for adding projects JSONField to JobSeekerProfile
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0029_jobseekerprofile_suited_job_roles'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobseekerprofile',
            name='projects',
            field=models.JSONField(default=list, blank=True),
        ),
    ]
