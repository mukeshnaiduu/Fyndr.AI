from django.db import migrations, models


class Migration(migrations.Migration):

	dependencies = [
		('fyndr_auth', '0028_companyprofile_card_brand_companyprofile_card_expiry_and_more'),
	]

	operations = [
		migrations.AddField(
			model_name='jobseekerprofile',
			name='suited_job_roles',
			field=models.JSONField(blank=True, default=list),
		),
	]
