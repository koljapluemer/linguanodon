from django.urls import path

from . import views

app_name = 'comprehensible_input'

urlpatterns = [
    path('', views.LanguageListView.as_view(), name='language_list'),
    path('language/<int:language_id>/', views.VideoListView.as_view(), name='video_list'),
    path('watch/<int:pk>/', views.WatchView.as_view(), name='watch'),
    path('stats/', views.StatsView.as_view(), name='stats'),
    path('manage/', views.VideoManageListView.as_view(), name='video_manage'),
    path('manage/add/', views.VideoCreateView.as_view(), name='video_add'),
    path('manage/<int:pk>/edit/', views.VideoUpdateView.as_view(), name='video_edit'),
    path('manage/<int:pk>/delete/', views.VideoDeleteView.as_view(), name='video_delete'),
]
