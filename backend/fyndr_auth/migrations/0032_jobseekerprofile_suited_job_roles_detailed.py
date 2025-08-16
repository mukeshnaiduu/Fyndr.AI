from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0031_jobseekerprofile_skills_detailed'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobseekerprofile',
            name='suited_job_roles_detailed',
            field=models.JSONField(default=list, blank=True),
        ),
    ]
