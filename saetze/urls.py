from django.urls import path

from . import views

app_name = 'saetze'

urlpatterns = [
    path('', views.lesson_list, name='lesson_list'),
    path('api/<slug:lesson_key>/exercises/', views.api_exercises, name='api_exercises'),
    path('<slug:lesson_key>/', views.lesson_practice, name='practice'),
]
