from django.conf.urls import url
from . import views
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    url(r'auth/login/', views.Login.as_view()),
    url(r'vps/', views.VPS.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
