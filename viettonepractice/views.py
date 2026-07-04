import json

from django.http import JsonResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.urls import reverse

from viettonepractice.models import Clip


def practice(request):
    config = {
        'audioBaseUrl': static('viettonepractice/audio/'),
        'apiClipsUrl': reverse('viettonepractice:api_clips'),
    }
    return render(request, 'viet-tone-practice/practice.html', {'config_json': json.dumps(config)})


def stats(request):
    return render(request, 'viet-tone-practice/stats.html')


def api_clips(request):
    return JsonResponse(list(Clip.objects.values('filename', 'transcript')), safe=False)
