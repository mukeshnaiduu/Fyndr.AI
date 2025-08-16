from django.db import migrations


def remove_suited_job_roles(apps, schema_editor):
    JobSeekerProfile = apps.get_model('fyndr_auth', 'JobSeekerProfile')
    # No data migration needed; existing data in suited_job_roles_detailed used.

class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0033_remove_jobseekerprofile_skills_detailed'),
    ]

    operations = [
        # Remove legacy suited_job_roles field if present
        migrations.RemoveField(
            model_name='jobseekerprofile',
            name='suited_job_roles',
        ),
    ]
