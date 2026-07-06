import json

from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse

from saetze.models import Exercise, Lesson


def lesson_list(request):
    return render(request, 'saetze/lesson-list.html', {'lessons': Lesson.objects.all()})


def lesson_practice(request, lesson_key):
    lesson = get_object_or_404(Lesson, key=lesson_key)
    config = {
        'apiExercisesUrl': reverse('saetze:api_exercises', args=[lesson_key]),
    }
    return render(request, 'saetze/practice.html', {'lesson': lesson, 'config_json': json.dumps(config)})


def api_exercises(request, lesson_key):
    exercises = Exercise.objects.filter(lesson_id=lesson_key).values(
        'id', 'english', 'english_credit', 'cloze', 'correct_answer', 'wrong_answer', 'german_credit',
    )
    return JsonResponse(list(exercises), safe=False)
