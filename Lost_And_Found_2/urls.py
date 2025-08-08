from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls', namespace='accounts')),
    path('items/', include('items.urls')),
    path('responses/', include('responses.urls')),
    # Add this line to redirect root URL to login page:
    path('', RedirectView.as_view(url='/accounts/login/')),
    
    # Add this line
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)