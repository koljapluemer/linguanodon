from django.urls import path

from . import views

app_name = 'egyptiansentences'

urlpatterns = [
    path('', views.home, name='home'),
    path('practice/', views.practice, name='practice'),
    path('api/sentences/', views.api_sentences, name='api_sentences'),
]
