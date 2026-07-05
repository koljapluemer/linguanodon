from django.urls import path

from . import views

app_name = 'hebrewscript'

urlpatterns = [
    path('', views.practice, name='practice'),
    path('stats/', views.stats, name='stats'),
    path('api/clips/', views.api_clips, name='api_clips'),
]
