from django import forms
from .models import Item, LostItem
from responses.models import Response

class ItemForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = ['title', 'description', 'image']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }
        labels = {
            'title': 'Item Name',
            'description': 'Description',
            'image': 'Upload Image'
        }

class LostItemForm(forms.ModelForm):
    class Meta:
        model = LostItem
        fields = ['title', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }
        help_texts = {
            'title': 'Enter the name of the lost item',
            'description': 'Describe where and when you lost it'
        }

class ClaimForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = ['is_claimed']
        widgets = {
            'is_claimed': forms.HiddenInput()
        }