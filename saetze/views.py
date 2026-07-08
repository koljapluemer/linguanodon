import json

from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse

from saetze.models import Exercise, Lesson
from core.apps_registry import nav_context


def home(request):
    context = {'lessons': Lesson.objects.all(), **nav_context('saetze', 'home')}
    return render(request, 'saetze/home.html', context)


def lesson_practice(request, lesson_key):
    lesson = get_object_or_404(Lesson, key=lesson_key)
    config = {
        'apiExercisesUrl': reverse('saetze:api_exercises', args=[lesson_key]),
    }
    context = {'lesson': lesson, 'config_json': json.dumps(config), **nav_context('saetze', 'practice')}
    return render(request, 'saetze/practice.html', context)


def api_exercises(request, lesson_key):
    exercises = Exercise.objects.filter(lesson_id=lesson_key).values(
        'id', 'english', 'english_credit', 'cloze', 'correct_answer', 'wrong_answer', 'german_credit',
    )
    return JsonResponse(list(exercises), safe=False)
