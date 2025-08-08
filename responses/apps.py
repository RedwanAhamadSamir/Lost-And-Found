# responses/apps.py
from django.apps import AppConfig

class ResponsesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'responses'

    def ready(self):
        # Import and register your signals
        import responses.signals  # noqa