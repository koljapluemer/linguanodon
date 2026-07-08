from django.urls import path

from . import views

app_name = 'prepositions3d'

urlpatterns = [
    path('', views.home, name='home'),
    path('practice/', views.practice, name='practice'),
    path('api/languages/', views.api_languages, name='api_languages'),
    path('api/glossary/', views.api_glossary, name='api_glossary'),
]
