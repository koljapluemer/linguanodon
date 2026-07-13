from django.urls import path

from . import views

app_name = 'comprehensible_input'

urlpatterns = [
    path('', views.InfiniteWatchView.as_view(), name='home'),
    path('videos/', views.LanguageListView.as_view(), name='all_videos'),
    path('language/<int:language_id>/', views.VideoListView.as_view(), name='video_list'),
    path('watch/<int:pk>/', views.WatchView.as_view(), name='practice'),
    path('random/<str:language_code>/', views.RandomVideoPartialView.as_view(), name='random_video'),
    path('stats/', views.StatsView.as_view(), name='stats'),
    path('manage/', views.VideoManageListView.as_view(), name='video_manage'),
    path('manage/add/', views.VideoCreateView.as_view(), name='video_add'),
    path('manage/<int:pk>/edit/', views.VideoUpdateView.as_view(), name='video_edit'),
    path('manage/<int:pk>/delete/', views.VideoDeleteView.as_view(), name='video_delete'),
]
