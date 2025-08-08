# responses/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from .models import Response

@receiver(post_save, sender=Response)
def auto_claim_handler(sender, instance, created, **kwargs):
    if created:
        transaction.on_commit(
            lambda: instance.item.update_claim_status()
        )