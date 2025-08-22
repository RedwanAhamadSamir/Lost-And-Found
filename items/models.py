from django.db import models
from django.utils import timezone
from accounts.models import CustomUser
from django.core.mail import send_mail
from django.conf import settings
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
    
    class Meta:
        db_table = 'items_item'  # Explicit table name
    
    def __str__(self):
        return self.title
    
    def user_has_responded(self, user):
        return self.responses.filter(user=user).exists()
    
    @property
    def response_count(self):
        return self.responses.all().count()
    
    def update_claim_status(self):
        self.refresh_from_db()
        if not self.is_claimed and self.responses.exists():
            self.is_claimed = True
            self.claimed_by = self.responses.first().user
            self.claim_date = timezone.now()
            self.save(update_fields=['is_claimed', 'claimed_by', 'claim_date'])

class LostItem(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    date_reported = models.DateTimeField(auto_now_add=True)
    reported_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'items_lostitem'  # Explicit table name
    
    def __str__(self):
        return self.title

class LostItemComment(models.Model):
    lost_item = models.ForeignKey(LostItem, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    class Meta:
        db_table = 'items_lostitemcomment'  # Explicit table name
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.user_id} on {self.lost_item.title}"
    
    # Add this import at the top if not already present


# Add this new model after your existing models
class AdminReply(models.Model):
    response = models.ForeignKey('responses.Response', on_delete=models.CASCADE, related_name='admin_replies')
    admin = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'items_adminreply'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Admin reply by {self.admin.user_id} to {self.response.user.user_id}"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Send email notification to the original commenter
        if is_new:
            try:
                subject = f'Admin Reply to Your Comment - Lost & Found'
                message = f'''
                Hello {self.response.user.user_id},

                An admin has replied to your comment about "{self.response.item.title}".

                Your comment: "{self.response.message}"

                Admin reply: "{self.message}"

                You can view the full details on the Lost & Found portal.

                Best regards,
                Lost & Found Team
                '''
                
                # Assuming your CustomUser model has an email field
                if hasattr(self.response.user, 'email') and self.response.user.email:
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [self.response.user.email],
                        fail_silently=True,
                    )
            except Exception as e:
                print(f"Failed to send email: {e}")
                
                

