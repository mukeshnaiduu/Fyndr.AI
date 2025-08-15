from django.db import migrations


def set_defaults(apps, schema_editor):
    JobRole = apps.get_model('fyndr_auth', 'JobRole')
    JobRole.objects.filter(for_jobseekers=False).update(for_jobseekers=True)
    JobRole.objects.filter(for_recruiters=False).update(for_recruiters=True)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0020_jobrole_for_jobseekers_jobrole_for_recruiters_and_more'),
    ]

    operations = [
        migrations.RunPython(set_defaults, noop),
    ]
