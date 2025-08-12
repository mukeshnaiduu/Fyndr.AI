from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobapplier', '0003_create_new_models'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobapplication',
            name='is_verified',
            field=models.BooleanField(default=False, help_text='Application verified against ATS or email'),
        ),
        migrations.AddField(
            model_name='jobapplication',
            name='verified_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='jobapplication',
            name='verified_source',
            field=models.CharField(blank=True, help_text='Source of verification: ats|email|manual', max_length=50),
        ),
        migrations.AddField(
            model_name='jobapplication',
            name='email_confirmed',
            field=models.BooleanField(default=False, help_text='Received confirmation email'),
        ),
        migrations.AddField(
            model_name='jobapplication',
            name='email_confirmed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
