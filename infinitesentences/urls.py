from django.urls import path

from . import views

app_name = 'infinitesentences'

urlpatterns = [
    path('', views.landing, name='landing'),
    path('learn/', views.select_native_language, name='select_native_language'),
    path('learn/<str:native_iso>/', views.select_target_language, name='select_target_language'),
    path('learn/<str:native_iso>/<str:target_iso>/', views.practice, name='practice'),
    path('stats/', views.stats, name='stats'),
    path('settings/', views.settings_page, name='settings'),

    path('api/languages/', views.api_languages, name='api_languages'),
    path('api/native-languages/', views.api_native_languages, name='api_native_languages'),
    path('api/target-languages/<str:native_iso>/', views.api_target_languages, name='api_target_languages'),
    path(
        'api/sentence-count/<str:native_iso>/<str:target_iso>/',
        views.api_sentence_count,
        name='api_sentence_count',
    ),
    path(
        'api/sentence/<str:native_iso>/<str:target_iso>/<str:index>/',
        views.api_sentence,
        name='api_sentence',
    ),
]
