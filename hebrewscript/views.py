import json

from django.http import JsonResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.urls import reverse

from hebrewscript.models import Clip
from core.apps_registry import nav_context


def home(request):
    return render(request, 'hebrew-script/home.html', nav_context('hebrewscript', 'home'))


def practice(request):
    config = {
        'audioBaseUrl': static('hebrewscript/audio/'),
        'apiClipsUrl': reverse('hebrewscript:api_clips'),
    }
    context = {'config_json': json.dumps(config), **nav_context('hebrewscript', 'practice')}
    return render(request, 'hebrew-script/practice.html', context)


def stats(request):
    return render(request, 'hebrew-script/stats.html', nav_context('hebrewscript', 'stats'))


def api_clips(request):
    return JsonResponse(list(Clip.objects.values('filename', 'transcript')), safe=False)
