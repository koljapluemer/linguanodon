import json

from django.http import Http404, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from boringwords.languages import get_language_codes
from boringwords.models import Background, Word
from core.apps_registry import nav_context
from core.languages import display_name


def home(request):
    return render(request, 'boring-words/home.html', {
        **nav_context('boringwords', 'home'),
        'languages': [{'code': c, 'name': display_name(c)} for c in get_language_codes()],
        'backdrop': Background.objects.order_by('?').first(),
    })


def practice(request, language):
    if language not in get_language_codes():
        raise Http404('Unknown language.')
    config = {
        'language': language,
        'apiDeckUrl': reverse('boringwords:api_deck', args=[language]),
    }
    context = {'config_json': json.dumps(config), **nav_context('boringwords', 'practice')}
    return render(request, 'boring-words/practice.html', context)


def api_deck(request, language):
    if language not in get_language_codes():
        raise Http404('Unknown language.')
    words = list(Word.objects.filter(language=language).values('id', 'front', 'back', 'credit'))
    backgrounds = list(Background.objects.filter(language=language).values('filename', 'credit'))
    return JsonResponse({'words': words, 'backgrounds': backgrounds})
