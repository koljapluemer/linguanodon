from django.urls import path

from . import views

app_name = 'saetze'

urlpatterns = [
    path('', views.home, name='home'),
    path('api/<slug:lesson_key>/exercises/', views.api_exercises, name='api_exercises'),
    path('<slug:lesson_key>/', views.lesson_practice, name='practice'),
]
