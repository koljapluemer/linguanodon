from django.urls import path

from . import views

app_name = 'typingpractice'

urlpatterns = [
    path('', views.home, name='home'),
    path('vie/', views.practice_vie, name='practice_vie'),
    path('vie/settings/', views.settings_vie, name='settings_vie'),
]
