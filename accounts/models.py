from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    username = None  # Remove the default username field
    user_id = models.CharField(max_length=20, unique=True, primary_key=True)
    email = models.EmailField(unique=True)
    is_admin = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'user_id'  # Use user_id to log in
    REQUIRED_FIELDS = ['email']  # email required when creating user via command line

    def save(self, *args, **kwargs):
        # Make user admin if user_id starts with 5 or higher (i.e., '5', '6', ..., '9')
        first_digit = str(self.user_id)[0]
        self.is_admin = first_digit >= '5'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.user_id

    @property
    def is_student(self):
        # If not admin, then student
        return not self.is_admin
