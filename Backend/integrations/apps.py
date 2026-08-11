from django.apps import AppConfig

ACTION_VERB = {'create': 'tạo', 'update': 'cập nhật', 'delete': 'xoá'}


class IntegrationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'integrations'

    def ready(self):
        import integrations.audit  # noqa
        from integrations.audit import register_audit_signal

        try:
            from events.models import Event
            register_audit_signal(
                Event,
                describe=lambda i, a: f'{ACTION_VERB[a]} sự kiện: {i.title}',
            )
        except ImportError:
            pass

        try:
            from tasks.models import Task
            register_audit_signal(
                Task,
                company_resolver=lambda i: i.project.company_id,
                describe=lambda i, a: f'{ACTION_VERB[a]} việc: {i.name}',
            )
        except ImportError:
            pass

        try:
            from projects.models import Project
            register_audit_signal(
                Project,
                describe=lambda i, a: f'{ACTION_VERB[a]} dự án: {i.name}',
            )
        except ImportError:
            pass

        try:
            from proposals.models import Proposal
            register_audit_signal(
                Proposal,
                describe=lambda i, a: f'{ACTION_VERB[a]} đề xuất: {i.title}',
            )
        except ImportError:
            pass
