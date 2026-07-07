from django.urls import path

from . import views

app_name = 'tracking'

urlpatterns = [
    path('sync/', views.sync, name='sync'),
    path('state/<str:app_label>/', views.state, name='state'),
    path('dashboard/', views.dashboard, name='dashboard'),
]
