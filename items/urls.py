from django.urls import path
from . import views

app_name = 'items'  # This namespace is crucial

urlpatterns = [
    # Admin URLs
    path('admin/timeline/', views.admin_timeline, name='admin_timeline'),
    path('admin/upload/', views.admin_upload, name='admin_upload'),
    path('admin/delete/<int:pk>/', views.delete_item, name='delete'),  # This is the correct pattern
    
    # Student URLs
    path('timeline/', views.student_timeline, name='student_timeline'),
    path('report-lost/', views.report_lost_item, name='report_lost'),
    path('lost-items/', views.lost_items_timeline, name='lost_items_timeline'),
    path('claim/<int:item_id>/', views.toggle_claim_status, name='toggle_claim'),
    path('responses/<int:item_id>/', views.check_item_updates, name='check_updates'),

]