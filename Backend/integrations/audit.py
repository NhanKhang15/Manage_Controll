from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from integrations.models import AuditLog

# Import models dynamically or when registered
TRACKED_MODELS = []


def register_audit_signal(model_cls):
    if model_cls not in TRACKED_MODELS:
        TRACKED_MODELS.append(model_cls)

        @receiver(post_save, sender=model_cls)
        def log_save(sender, instance, created, **kwargs):
            action = 'create' if created else 'update'
            table_name = sender._meta.db_table
            record_id = str(instance.pk)
            AuditLog.objects.create(
                table_name=table_name,
                record_id=record_id,
                action=action,
            )

        @receiver(post_delete, sender=model_cls)
        def log_delete(sender, instance, **kwargs):
            table_name = sender._meta.db_table
            record_id = str(instance.pk)
            AuditLog.objects.create(
                table_name=table_name,
                record_id=record_id,
                action='delete',
            )
