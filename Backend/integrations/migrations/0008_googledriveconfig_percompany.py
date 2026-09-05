import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0005_company_due_soon_days'),
        ('employees', '0004_employeecompany_can_approve_proposals'),
        ('integrations', '0007_googledriveconfig'),
    ]

    operations = [
        migrations.DeleteModel(
            name='GoogleDriveConfig',
        ),
        migrations.CreateModel(
            name='GoogleDriveConfig',
            fields=[
                ('id', models.CharField(default=uuid.uuid4, editable=False, max_length=36, primary_key=True, serialize=False)),
                ('connected_email', models.CharField(blank=True, max_length=255, null=True)),
                ('access_token_encrypted', models.TextField(blank=True, null=True)),
                ('refresh_token_encrypted', models.TextField(blank=True, null=True)),
                ('token_expiry', models.DateTimeField(blank=True, null=True)),
                ('root_folder_id', models.CharField(blank=True, max_length=255, null=True)),
                ('root_folder_url', models.CharField(blank=True, max_length=500, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('company', models.OneToOneField(db_column='company_id', on_delete=django.db.models.deletion.CASCADE, related_name='drive_config', to='companies.company')),
                ('updated_by', models.ForeignKey(blank=True, db_column='updated_by', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='employees.employee')),
            ],
            options={
                'db_table': 'google_drive_config',
            },
        ),
    ]
