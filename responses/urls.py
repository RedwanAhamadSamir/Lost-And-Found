from django.urls import path
from . import views

app_name = 'responses'

urlpatterns = [
    path('create/<int:item_id>/', views.create_response, name='create'),
    path('item/<int:item_id>/', views.item_responses, name='item_responses'),
]