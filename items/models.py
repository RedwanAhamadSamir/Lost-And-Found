from django.db import models
from django.utils import timezone
from accounts.models import CustomUser

class Item(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='items/')
    date_found = models.DateTimeField(auto_now_add=True)
    found_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='found_items')
    is_claimed = models.BooleanField(default=False)
    claimed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='claimed_items')
    claim_date = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.title
    
    def user_has_responded(self, user):
        return self.responses.filter(user=user).exists()
    
    @property
    def response_count(self):
        return self.responses.all().count()
    
    def update_claim_status(self):
        """Force update claim status if responses exist"""
        self.refresh_from_db()  # Get latest data
        if not self.is_claimed and self.responses.exists():
            self.is_claimed = True
            self.claimed_by = self.responses.first().user
            self.claim_date = timezone.now()
            self.save(update_fields=['is_claimed', 'claimed_by', 'claim_date'])
            print(f"DEBUG: Auto-claimed item {self.id}")  # Verify in logs

class LostItem(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    date_reported = models.DateTimeField(auto_now_add=True)
    reported_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.title