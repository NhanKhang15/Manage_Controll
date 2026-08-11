from django.db import migrations

# audit_logs.action ở DB thật là MySQL ENUM('create','update','delete') tạo ngoài
# luồng migration chuẩn của Django (Django CharField+choices không map ra ENUM cấp
# DB nên AlterField ở migration trước không đụng tới nó) — chuyển hẳn sang VARCHAR
# để khớp với field Django thật, tránh lặp lại lỗi "Data truncated" mỗi khi thêm
# action mới sau này.
SQL_FORWARD = "ALTER TABLE audit_logs MODIFY COLUMN action VARCHAR(10) NOT NULL;"
SQL_REVERSE = "ALTER TABLE audit_logs MODIFY COLUMN action ENUM('create','update','delete') NOT NULL;"


class Migration(migrations.Migration):

    dependencies = [
        ('integrations', '0005_auditlog_company_auditlog_description_and_more'),
    ]

    operations = [
        migrations.RunSQL(sql=SQL_FORWARD, reverse_sql=SQL_REVERSE),
    ]
