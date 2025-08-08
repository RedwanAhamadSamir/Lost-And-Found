from django.db import models
from accounts.models import CustomUser
from items.models import Item

class Response(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    response_date = models.DateTimeField(auto_now_add=True)
    message = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ('item', 'user')