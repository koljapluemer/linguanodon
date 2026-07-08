from django.urls import path

from . import views

app_name = 'tprboard'

urlpatterns = [
    path('', views.home, name='home'),
    path('practice/', views.board, name='practice'),
    path('stats/', views.stats, name='stats'),
    path('settings/', views.settings, name='settings'),
    path('api/languages/', views.api_languages, name='api_languages'),
    path('api/locales/<str:code>/tasks/', views.api_locale_tasks, name='api_locale_tasks'),
    path('api/objects/', views.api_objects, name='api_objects'),
]
