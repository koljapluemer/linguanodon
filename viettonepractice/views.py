import json

from django.http import JsonResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.urls import reverse

from viettonepractice.models import Clip
from core.apps_registry import nav_context


def home(request):
    return render(request, 'viet-tone-practice/home.html', nav_context('viettonepractice', 'home'))


def practice(request):
    config = {
        'audioBaseUrl': static('viettonepractice/audio/'),
        'apiClipsUrl': reverse('viettonepractice:api_clips'),
    }
    context = {'config_json': json.dumps(config), **nav_context('viettonepractice', 'practice')}
    return render(request, 'viet-tone-practice/practice.html', context)


def stats(request):
    return render(request, 'viet-tone-practice/stats.html', nav_context('viettonepractice', 'stats'))


def api_clips(request):
    return JsonResponse(list(Clip.objects.values('filename', 'transcript')), safe=False)
