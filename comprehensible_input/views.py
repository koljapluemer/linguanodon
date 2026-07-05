import json

from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import CreateView, DeleteView, DetailView, ListView, TemplateView, UpdateView

from accounts.permissions import AdminRequiredMixin
from comprehensible_input.forms import VideoForm
from comprehensible_input.models import Language, Video


class LanguageListView(ListView):
    template_name = 'comprehensible-input/language-list.html'
    context_object_name = 'languages'

    def get_queryset(self):
        return Language.objects.filter(videos__isnull=False).distinct()


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
