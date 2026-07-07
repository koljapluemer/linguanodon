from django.urls import path

from . import views

app_name = 'typingpractice'

urlpatterns = [
    path('vie/', views.practice_vie, name='practice_vie'),
]
