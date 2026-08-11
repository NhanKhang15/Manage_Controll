from django.db import migrations


def remap_trehan(apps, schema_editor):
    """'Trễ hạn' không còn là 1 giá trị status hợp lệ — trễ hạn giờ tính động
    từ due_date (xem TaskTable.tsx). Task nào đang có status='Trễ hạn' thì gán
    lại theo is_completed: đã xong -> Hoàn thành, chưa xong -> Cần làm."""
    Task = apps.get_model('tasks', 'Task')
    Task.objects.filter(status='Trễ hạn', is_completed=True).update(status='Hoàn thành')
    Task.objects.filter(status='Trễ hạn', is_completed=False).update(status='Cần làm')


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0005_task_effort_points_task_is_milestone_task_notes_and_more'),
    ]

    operations = [
        migrations.RunPython(remap_trehan, noop),
    ]
