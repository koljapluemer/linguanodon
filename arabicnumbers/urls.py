from django.urls import path

from . import views

app_name = 'arabicnumbers'

urlpatterns = [
    path('', views.home, name='home'),
    path('practice/', views.practice, name='practice'),
    path('api/numbers/', views.api_numbers, name='api_numbers'),
]
