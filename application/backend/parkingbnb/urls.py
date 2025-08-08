"""
URL configuration for parkingbnb project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
# from marketplace.views import UserStatusView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    
)
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from django.contrib.staticfiles.views import serve as serve_staticfiles

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('marketplace.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),# This connect API endpoints!
    path('', RedirectView.as_view(url='/api/', permanent=False)),
]

if settings.DEBUG:
    urlpatterns += [
        path('static/<path:path>', serve_staticfiles, {'document_root': settings.STATIC_ROOT}),
    ]
    urlpatterns += [
        path('favicon.ico', RedirectView.as_view(url=settings.STATIC_URL + 'static/favicon.ico', permanent=True))
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # urlpatterns += [
    # path("users/status/", UserStatusView.as_view(), name="user-status"),
    # ]
    
    
#clearing static files
# sudo rm -rf /home/ubuntu/has_docker/application/backend/staticfiles_collected/ # Clear collected static files
# python manage.py collectstatic --noinput # Re-run collectstatic