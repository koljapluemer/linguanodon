import json

from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import CreateView, DeleteView, DetailView, ListView, TemplateView, UpdateView

from accounts.permissions import AdminRequiredMixin
from comprehensible_input.forms import VideoForm
from comprehensible_input.models import Language, Video
from core.apps_registry import nav_context


class InfiniteWatchView(ListView):
    template_name = 'comprehensible-input/home.html'
    context_object_name = 'languages'
    extra_context = nav_context('comprehensible_input', 'home')

    def get_queryset(self):
        return Language.objects.filter(videos__isnull=False).distinct()


class LanguageListView(ListView):
    template_name = 'comprehensible-input/all-videos.html'
    context_object_name = 'languages'
    extra_context = nav_context('comprehensible_input', 'extra')

    def get_queryset(self):
        return Language.objects.filter(videos__isnull=False).distinct()


class RandomVideoPartialView(TemplateView):
    template_name = 'comprehensible-input/_video-player.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        language = get_object_or_404(Language, code=self.kwargs['language_code'])
        context['language'] = language
        context['video'] = Video.objects.filter(language=language).order_by('?').first()
        return context


class VideoListView(ListView):
    template_name = 'comprehensible-input/video-list.html'
    context_object_name = 'videos'

    def get_queryset(self):
        self.language = get_object_or_404(Language, pk=self.kwargs['language_id'])
        return Video.objects.filter(language=self.language)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['language'] = self.language
        return context


class WatchView(DetailView):
    model = Video
    template_name = 'comprehensible-input/watch.html'
    context_object_name = 'video'
    extra_context = nav_context('comprehensible_input', 'practice')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        video = self.object
        context['config_json'] = json.dumps({
            'videoId': video.pk,
            'languageId': video.language_id,
            'languageName': video.language.name,
            'videoTitle': video.title,
            'youtubeId': video.youtube_id,
        })
        return context


class StatsView(TemplateView):
    template_name = 'comprehensible-input/stats.html'
    extra_context = nav_context('comprehensible_input', 'stats')


class VideoManageListView(AdminRequiredMixin, ListView):
    model = Video
    template_name = 'comprehensible-input/video-manage.html'
    context_object_name = 'videos'


class VideoFormViewMixin:
    model = Video
    form_class = VideoForm
    template_name = 'comprehensible-input/video-form.html'
    success_url = reverse_lazy('comprehensible_input:video_manage')


class VideoCreateView(AdminRequiredMixin, VideoFormViewMixin, CreateView):
    pass


class VideoUpdateView(AdminRequiredMixin, VideoFormViewMixin, UpdateView):
    pass


class VideoDeleteView(AdminRequiredMixin, DeleteView):
    model = Video
    template_name = 'comprehensible-input/video-confirm-delete.html'
    success_url = reverse_lazy('comprehensible_input:video_manage')
