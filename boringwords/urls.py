from django.urls import path

from . import views

app_name = 'boringwords'

urlpatterns = [
    path('', views.home, name='home'),
    path('practice/<str:language>/', views.practice, name='practice'),
    path('api/deck/<str:language>/', views.api_deck, name='api_deck'),
]
