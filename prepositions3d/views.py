import json
from collections import defaultdict

from django.http import JsonResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.urls import reverse

from prepositions3d.models import Language, Translation
from core.apps_registry import nav_context


def home(request):
    return render(request, 'prepositions-3d/home.html', nav_context('prepositions3d', 'home'))


def practice(request):
    config = {
        'modelsBaseUrl': static('prepositions3d/models/'),
        'soundBaseUrl': static('prepositions3d/sound/'),
        'apiLanguagesUrl': reverse('prepositions3d:api_languages'),
        'apiGlossaryUrl': reverse('prepositions3d:api_glossary'),
    }
    context = {'config_json': json.dumps(config), **nav_context('prepositions3d', 'practice')}
    return render(request, 'prepositions-3d/game.html', context)


def api_languages(request):
    return JsonResponse({language.code: language.name for language in Language.objects.all()})


def api_glossary(request):
    translations = (
        Translation.objects
        .select_related('task', 'language')
        .order_by('task__order', 'language_id')
    )

    payload = defaultdict(dict)
    for translation in translations:
        entry = payload[translation.task_id]
        entry[translation.language_id] = translation.text
        if translation.audio_path:
            entry.setdefault('audio', {})[translation.language_id] = static(
                f'prepositions3d/audio/{translation.audio_path}'
            )

    return JsonResponse(dict(payload))
