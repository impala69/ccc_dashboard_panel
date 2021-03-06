from django.urls import path
from . import views
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path('auth/login/', views.Login.as_view()),
    path('servers/<str:server_id>/os-volume_attachments', views.Attachment.as_view()),
    path('vps/', views.VPS.as_view()),
    path('vps/<str:server_id>/', views.VPS.as_view()),
    path('vps-detail/<str:server_id>/action/', views.VPSDetail.as_view()),
    path('get_overview/', views.Overview.as_view()),
    path('keypairs/', views.KeyPairs.as_view()),
    path('keypairs/<str:name>/', views.KeyPairDetail.as_view()),
    path('volumes/', views.Volumes.as_view()),
    path('volumes/<str:name>/', views.VolumeDetail.as_view()),
    path('users/', views.User.as_view()),
    path('images/', views.Images.as_view()),
    path('flavors/', views.Flavors.as_view()),
    path('networks/', views.Networks.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
