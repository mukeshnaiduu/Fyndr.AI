from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('fyndr_auth.urls')),
    # path('api/jobmatcher/', include('jobmatcher.urls')),  # Temporarily disabled for migration
    path('api/applications/', include('jobapplier.urls')),
    # path('api/jobtracker/', include('jobtracker.urls')),  # Temporarily disabled for migration
    path('', include('jobscraper.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
