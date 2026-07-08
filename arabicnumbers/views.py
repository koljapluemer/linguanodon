import json

from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse

from arabicnumbers.models import ArabicNumber
from core.apps_registry import nav_context


def home(request):
    return render(request, 'arabic-numbers/home.html', nav_context('arabicnumbers', 'home'))


def practice(request):
    config = {
        'apiNumbersUrl': reverse('arabicnumbers:api_numbers'),
    }
    context = {'config_json': json.dumps(config), **nav_context('arabicnumbers', 'practice')}
    return render(request, 'arabic-numbers/practice.html', context)


def api_numbers(request):
    return JsonResponse(
        list(ArabicNumber.objects.values('value', 'numeral', 'script', 'english', 'transliteration')),
        safe=False,
    )
