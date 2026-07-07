import json
import random
from pathlib import Path

from django.shortcuts import render

WORD_COUNT = 30
DATA_DIR = Path(__file__).resolve().parent / 'data'


def practice_vie(request):
    words = json.loads((DATA_DIR / 'vie.json').read_text(encoding='utf-8'))
    sample = random.sample(list(words.items()), k=min(WORD_COUNT, len(words)))
    config = {'lang': 'vie', 'words': sample}
    return render(request, 'typing-practice/vie/practice.html', {'config_json': json.dumps(config)})
