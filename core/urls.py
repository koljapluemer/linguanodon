from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('typing-practice/vie/', views.typing_practice_vie, name='typing_practice_vie'),
]
