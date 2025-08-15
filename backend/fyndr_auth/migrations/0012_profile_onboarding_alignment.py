from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0011_alter_oauthtoken_provider_portalcredentials'),
    ]

    operations = [
        # RecruiterProfile additions
        migrations.AddField(
            model_name='recruiterprofile',
            name='primary_industry',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='recruiterprofile',
            name='services_offered',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='recruiterprofile',
            name='recruiting_areas',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='recruiterprofile',
            name='recruitment_type',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='recruiterprofile',
            name='remote_work',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='recruiterprofile',
            name='position_types',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='recruiterprofile',
            name='salary_currency',
            field=models.CharField(blank=True, default='USD', max_length=10),
        ),
        migrations.AddField(
            model_name='recruiterprofile',
            name='salary_range_from',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='recruiterprofile',
            name='salary_range_to',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='recruiterprofile',
            name='communication_preferences',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='recruiterprofile',
            name='availability_start_date',
            field=models.DateField(blank=True, null=True),
        ),

        # CompanyProfile additions
        migrations.AddField(
            model_name='companyprofile',
            name='team_members',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='invite_emails',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='default_role',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='allow_invites',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='require_approval',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='activity_notifications',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='compliance_requirements',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='reporting_frequency',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='diversity_metrics',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='anonymous_data',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='bias_alerts',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='selected_integrations',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='hris_system',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='ats_system',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='selected_plan',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='billing_cycle',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='payment_method',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='billing_address',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='agree_to_terms',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='marketing_emails',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='sla_acknowledged',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='final_confirmation',
            field=models.BooleanField(default=False),
        ),
    ]
