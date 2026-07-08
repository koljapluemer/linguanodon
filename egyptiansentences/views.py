import json

from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse

from egyptiansentences.models import Sentence
from core.apps_registry import nav_context


def home(request):
    return render(request, 'egyptian-sentences/home.html', nav_context('egyptiansentences', 'home'))


def practice(request):
    config = {
        'apiSentencesUrl': reverse('egyptiansentences:api_sentences'),
    }
    context = {'config_json': json.dumps(config), **nav_context('egyptiansentences', 'practice')}
    return render(request, 'egyptian-sentences/practice.html', context)


def api_sentences(request):
    sentences = Sentence.objects.prefetch_related('cloze_words').all()
    data = [
        {
            'id': sentence.id,
            'arz': sentence.arz,
            'transliteration': sentence.transliteration,
            'translations': sentence.translations,
            'cloze_words': [
                {'word': cloze_word.word, 'distractors': cloze_word.distractors}
                for cloze_word in sentence.cloze_words.all()
            ],
        }
        for sentence in sentences
    ]
    return JsonResponse(data, safe=False)
