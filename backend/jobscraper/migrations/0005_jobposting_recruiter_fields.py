from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('jobscraper', '0004_jobposting_company_logo'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='jobposting',
            name='source_type',
            field=models.CharField(choices=[('scraped', 'Scraped'), ('recruiter', 'Recruiter')], default='scraped', help_text='Origin of this job (scraped vs posted by recruiter)', max_length=20),
        ),
        migrations.AddField(
            model_name='jobposting',
            name='application_mode',
            field=models.CharField(choices=[('redirect', 'Redirect'), ('quick', 'Quick Apply')], default='redirect', help_text='Primary apply experience for this job', max_length=20),
        ),
        migrations.AddField(
            model_name='jobposting',
            name='apply_url',
            field=models.URLField(blank=True, help_text='Explicit application URL if different from job detail URL', null=True),
        ),
        migrations.AddField(
            model_name='jobposting',
            name='recruiter_owner',
            field=models.ForeignKey(blank=True, help_text='Recruiter user who owns this posting (for recruiter source)', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='recruiter_jobs', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddIndex(
            model_name='jobposting',
            index=models.Index(fields=['source_type', 'recruiter_owner', 'is_active', 'date_posted'], name='jobscraper_jobposting_source_type_owner_idx'),
        ),
    ]
