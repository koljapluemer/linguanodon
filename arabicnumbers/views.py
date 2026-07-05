import json

from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse

from arabicnumbers.models import ArabicNumber


def practice(request):
    config = {
        'apiNumbersUrl': reverse('arabicnumbers:api_numbers'),
    }
    return render(request, 'arabic-numbers/practice.html', {'config_json': json.dumps(config)})


def api_numbers(request):
    return JsonResponse(
        list(ArabicNumber.objects.values('value', 'numeral', 'script', 'english', 'transliteration')),
        safe=False,
    )
