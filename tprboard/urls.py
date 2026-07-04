from django.urls import path

from . import views

app_name = 'tprboard'

urlpatterns = [
    path('', views.board, name='board'),
    path('api/languages/', views.api_languages, name='api_languages'),
    path('api/locales/<str:code>/tasks/', views.api_locale_tasks, name='api_locale_tasks'),
    path('api/objects/', views.api_objects, name='api_objects'),
]
