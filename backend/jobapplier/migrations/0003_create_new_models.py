# Generated manually to handle missing tables

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('jobscraper', '0004_jobposting_company_logo'),
        ('jobapplier', '0002_alter_application_status_applicationstatushistory'),
    ]

    operations = [
        # Create new models only - don't try to remove old ones that may not exist
        migrations.CreateModel(
            name='JobApplication',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('applied', 'Applied'), ('in_review', 'In Review'), ('interview', 'Interview Scheduled'), ('rejected', 'Rejected'), ('offer', 'Offer Received'), ('accepted', 'Offer Accepted'), ('declined', 'Offer Declined'), ('withdrawn', 'Application Withdrawn'), ('failed', 'Application Failed')], default='pending', max_length=20)),
                ('application_method', models.CharField(choices=[('api', 'API'), ('browser', 'Browser Automation'), ('manual', 'Manual Application'), ('redirect', 'External Redirect')], default='manual', max_length=20)),
                ('external_application_id', models.CharField(blank=True, max_length=500, null=True)),
                ('application_url', models.URLField(blank=True, null=True)),
                ('resume_text', models.TextField(blank=True, help_text='Resume content used for this application')),
                ('cover_letter_text', models.TextField(blank=True, help_text='Cover letter content used')),
                ('custom_answers', models.JSONField(blank=True, default=dict, help_text='Custom answers to application questions')),
                ('automation_log', models.JSONField(blank=True, default=list, help_text='Log of automation steps')),
                ('ats_response', models.JSONField(blank=True, default=dict, help_text='Response from ATS system')),
                ('notes', models.TextField(blank=True, help_text='Internal notes')),
                ('is_tracking_enabled', models.BooleanField(default=True)),
                ('last_status_check', models.DateTimeField(blank=True, null=True)),
                ('status_updates', models.JSONField(blank=True, default=list)),
                ('applied_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='applications', to='jobscraper.jobposting')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='applications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'jobapplier_application',
                'ordering': ['-applied_at'],
            },
        ),
        migrations.CreateModel(
            name='ApplicationEvent',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('event_type', models.CharField(choices=[('applied', 'Application Submitted'), ('status_change', 'Status Changed'), ('email_received', 'Email Received'), ('interview_scheduled', 'Interview Scheduled'), ('follow_up', 'Follow Up'), ('rejection', 'Rejection Received'), ('offer', 'Offer Received'), ('withdrawn', 'Application Withdrawn'), ('note_added', 'Note Added')], max_length=30)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to='jobapplier.jobapplication')),
            ],
            options={
                'db_table': 'jobapplier_event',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ApplicationTracking',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('ats_system', models.CharField(blank=True, max_length=100)),
                ('external_tracking_id', models.CharField(blank=True, max_length=500)),
                ('tracking_url', models.URLField(blank=True, null=True)),
                ('last_checked', models.DateTimeField(auto_now=True)),
                ('check_frequency_minutes', models.IntegerField(default=60)),
                ('next_check', models.DateTimeField(blank=True, null=True)),
                ('email_monitoring_enabled', models.BooleanField(default=False)),
                ('email_keywords', models.JSONField(blank=True, default=list)),
                ('tracking_data', models.JSONField(blank=True, default=dict)),
                ('status_history', models.JSONField(blank=True, default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('application', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='tracking', to='jobapplier.jobapplication')),
            ],
            options={
                'db_table': 'jobapplier_tracking',
            },
        ),
        migrations.CreateModel(
            name='RealTimeConnection',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('channel_name', models.CharField(max_length=500, unique=True)),
                ('connected_at', models.DateTimeField(auto_now_add=True)),
                ('last_ping', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='realtime_connections', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'jobapplier_realtime_connection',
            },
        ),
        # Add unique constraint
        migrations.AlterUniqueTogether(
            name='jobapplication',
            unique_together={('user', 'job')},
        ),
    ]
