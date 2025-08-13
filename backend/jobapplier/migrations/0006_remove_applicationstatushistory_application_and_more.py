"""
Idempotent no-op migration.

Previous migration 0005 already drops legacy tables with IF EXISTS. This
migration originally attempted to RemoveField/DeleteModel on tables that may
no longer exist, causing errors on fresh databases. Convert to a safe no-op.
"""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("jobapplier", "0005_remove_applicationstatushistory_application_and_more"),
    ]

    # No operations required; kept for migration sequence compatibility
    operations = []
