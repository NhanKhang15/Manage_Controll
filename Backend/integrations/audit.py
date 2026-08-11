from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from integrations.current_user import get_current_employee
from integrations.models import AuditLog

# Import models dynamically or when registered
TRACKED_MODELS = []


def register_audit_signal(model_cls, company_resolver=None, describe=None):
    """Đăng ký ghi AuditLog tự động khi tạo/sửa/xoá `model_cls`.

    company_resolver(instance) -> company_id: mặc định lấy instance.company_id
    (dùng khi model không có company FK trực tiếp, vd Task phải lấy qua project).
    describe(instance, action) -> str: câu mô tả tiếng Việt để hiển thị sẵn,
    tạo lúc ghi log vì record gốc có thể đã bị xoá sau này.
    """
    if model_cls in TRACKED_MODELS:
        return
    TRACKED_MODELS.append(model_cls)

    def _company_id(instance):
        if company_resolver:
            try:
                return company_resolver(instance)
            except Exception:
                return None
        return getattr(instance, 'company_id', None)

    def _description(instance, action):
        if describe:
            try:
                return describe(instance, action)
            except Exception:
                return None
        return None

    @receiver(post_save, sender=model_cls)
    def log_save(sender, instance, created, **kwargs):
        action = 'create' if created else 'update'
        AuditLog.objects.create(
            table_name=sender._meta.db_table,
            record_id=str(instance.pk),
            action=action,
            company_id=_company_id(instance),
            description=_description(instance, action),
            changed_by=get_current_employee(),
        )

    @receiver(post_delete, sender=model_cls)
    def log_delete(sender, instance, **kwargs):
        AuditLog.objects.create(
            table_name=sender._meta.db_table,
            record_id=str(instance.pk),
            action='delete',
            company_id=_company_id(instance),
            description=_description(instance, 'delete'),
            changed_by=get_current_employee(),
        )
