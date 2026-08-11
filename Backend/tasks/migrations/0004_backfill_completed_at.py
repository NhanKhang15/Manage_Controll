from django.db import migrations
from django.db.models import F


def backfill_completed_at(apps, schema_editor):
    """Task đã hoàn thành trước khi có cột completed_at — lấy tạm updated_at
    làm mốc thời gian hoàn thành (ước lượng tốt nhất có thể, không chính xác
    tuyệt đối nhưng hợp lý hơn để trống)."""
    Task = apps.get_model('tasks', 'Task')
    Task.objects.filter(is_completed=True, completed_at__isnull=True).update(completed_at=F('updated_at'))


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0003_task_completed_at'),
    ]

    operations = [
        migrations.RunPython(backfill_completed_at, noop),
    ]
