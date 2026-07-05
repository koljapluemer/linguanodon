import json

from django.http import JsonResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.urls import reverse

from hebrewscript.models import Clip


def practice(request):
    config = {
        'audioBaseUrl': static('hebrewscript/audio/'),
        'apiClipsUrl': reverse('hebrewscript:api_clips'),
    }
    return render(request, 'hebrew-script/practice.html', {'config_json': json.dumps(config)})


def stats(request):
    return render(request, 'hebrew-script/stats.html')


def api_clips(request):
    return JsonResponse(list(Clip.objects.values('filename', 'transcript')), safe=False)
