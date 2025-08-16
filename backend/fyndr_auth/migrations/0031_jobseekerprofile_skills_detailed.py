from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0030_jobseekerprofile_projects'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobseekerprofile',
            name='skills_detailed',
            field=models.JSONField(default=list, blank=True),
        ),
    ]
