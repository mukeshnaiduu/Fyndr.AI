from django.db import migrations, models
from django.utils.text import slugify


def seed_locations(apps, schema_editor):
    Location = apps.get_model('fyndr_auth', 'Location')
    popular = [
        ('Bengaluru', 'Karnataka', 'India'),
        ('Mumbai', 'Maharashtra', 'India'),
        ('Hyderabad', 'Telangana', 'India'),
        ('Delhi NCR', 'Delhi', 'India'),
        ('Pune', 'Maharashtra', 'India'),
        ('Chennai', 'Tamil Nadu', 'India'),
        ('Gurugram', 'Haryana', 'India'),
        ('Noida', 'Uttar Pradesh', 'India'),
        ('Kolkata', 'West Bengal', 'India'),
        ('Ahmedabad', 'Gujarat', 'India'),
    ]
    for city, state, country in popular:
        display = f"{city}, {state}" if state and state not in city else city
        slug = slugify(f"{city}-{state}-{country}")
        Location.objects.get_or_create(
            city=city,
            state=state,
            country=country,
            defaults={
                'display_name': display,
                'slug': slug,
                'is_active': True,
                'popularity': 100
            }
        )


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0013_companyprofile_team_diversity_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('city', models.CharField(max_length=100)),
                ('state', models.CharField(blank=True, max_length=100)),
                ('country', models.CharField(default='India', max_length=100)),
                ('display_name', models.CharField(db_index=True, max_length=255)),
                ('slug', models.SlugField(max_length=255, unique=True)),
                ('is_active', models.BooleanField(default=True)),
                ('popularity', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'indexes': [
                    models.Index(fields=['city'], name='fyndr_auth_city_idx'),
                    models.Index(fields=['state'], name='fyndr_auth_state_idx'),
                    models.Index(fields=['country'], name='fyndr_auth_country_idx'),
                    models.Index(fields=['display_name'], name='fyndr_auth_display_idx'),
                ],
                'unique_together': {('city', 'state', 'country')},
            },
        ),
        migrations.RunPython(seed_locations, migrations.RunPython.noop),
    ]
