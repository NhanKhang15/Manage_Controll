from django.apps import AppConfig


class IntegrationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'integrations'

    def ready(self):
        import integrations.audit  # noqa
        try:
            from events.models import Event
            from integrations.audit import register_audit_signal
            register_audit_signal(Event)
        except ImportError:
            pass
