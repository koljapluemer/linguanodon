import json
import random
from pathlib import Path

from django.shortcuts import render

from core.apps_registry import nav_context

WORD_COUNT = 30
DATA_DIR = Path(__file__).resolve().parent / 'data'


def home(request):
    return render(request, 'typing-practice/home.html', nav_context('typingpractice', 'home'))


def practice_vie(request):
    words = json.loads((DATA_DIR / 'vie.json').read_text(encoding='utf-8'))
    sample = random.sample(list(words.items()), k=min(WORD_COUNT, len(words)))
    config = {'lang': 'vie', 'words': sample}
    context = {'config_json': json.dumps(config), **nav_context('typingpractice', 'practice')}
    return render(request, 'typing-practice/vie/practice.html', context)


def settings_vie(request):
    return render(request, 'typing-practice/vie/settings.html', nav_context('typingpractice', 'settings'))
