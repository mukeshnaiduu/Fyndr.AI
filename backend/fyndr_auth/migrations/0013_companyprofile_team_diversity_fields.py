from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0012_profile_onboarding_alignment'),
    ]

    operations = [
        migrations.AddField(
            model_name='companyprofile',
            name='team_size',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='department',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='current_openings',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='role_title',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='hiring_focus',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='diversity_initiatives',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='inclusive_practices',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='gender_diversity',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='cultural_diversity',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='companyprofile',
            name='leadership_diversity',
            field=models.CharField(blank=True, max_length=50),
        ),
    ]
