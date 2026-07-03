import json
import random
from pathlib import Path

from django.conf import settings
from django.shortcuts import render

WORD_COUNT = 30


def index(request):
    return render(request, 'index.html')


def typing_practice_vie(request):
    words_path = Path(settings.BASE_DIR) / 'templates' / 'typing-practice' / 'vie' / 'words.json'
    words = json.loads(words_path.read_text(encoding='utf-8'))
    sample = random.sample(list(words.items()), k=min(WORD_COUNT, len(words)))
    return render(request, 'typing-practice/vie/practice.html', {
        'words_json': json.dumps(sample),
    })
