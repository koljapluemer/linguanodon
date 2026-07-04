import json
from collections import defaultdict

from django.http import JsonResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.urls import reverse

from tprboard.models import BoardObject, Locale, SentenceFormulation


def board(request):
    config = {
        'audioBaseUrl': static('tprboard/audio/'),
        'modelsBaseUrl': static('tprboard/models/'),
        'explainImageSrc': static('tprboard/img/explain.webp'),
        'apiLanguagesUrl': reverse('tprboard:api_languages'),
        'apiObjectsUrl': reverse('tprboard:api_objects'),
        'apiLocaleTasksBaseUrl': '/tpr-board/api/locales/',
    }
    return render(request, 'tpr-board/board.html', {'config_json': json.dumps(config)})


def api_languages(request):
    return JsonResponse({locale.code: locale.name for locale in Locale.objects.all()})


def api_locale_tasks(request, code):
    formulations = (
        SentenceFormulation.objects
        .filter(locale_id=code)
        .select_related('relationship')
        .order_by('relationship__task_key', 'order')
    )

    task_map = defaultdict(list)
    for formulation in formulations:
        task_map[formulation.relationship.task_key].append(formulation.text)

    return JsonResponse(task_map)


def api_objects(request):
    objects = (
        BoardObject.objects
        .order_by('order')
        .prefetch_related('outgoing_relationships__target')
    )

    payload = []
    for board_object in objects:
        record = {'model': board_object.model_path}

        if board_object.hold_scale is not None:
            record['hold'] = {
                'anchor': [
                    board_object.hold_anchor_x,
                    board_object.hold_anchor_y,
                    board_object.hold_anchor_z,
                ],
                'scale': board_object.hold_scale,
            }

        relationships = {
            relationship.target_id: [
                relationship.verb,
                relationship.source_effect,
                relationship.target_effect,
            ]
            for relationship in board_object.outgoing_relationships.all()
        }

        if relationships:
            record['relationships'] = relationships

        payload.append({'name': board_object.slug, 'record': record})

    return JsonResponse(payload, safe=False)
