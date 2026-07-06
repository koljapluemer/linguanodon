import json
import random
import re
import unicodedata
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from egyptiansentences.models import ClozeWord, Sentence

DISTRACTOR_COUNT = 5
CANDIDATE_POOL_SIZE = 10

# Arabic diacritics (tashkeel) ranges - port of Game.vue's
# normalizeForCompare regex, used to avoid picking a distractor that's
# really the same word with different diacritics.
DIACRITICS_PATTERN = re.compile(
    '[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]'
)


def normalize_for_compare(value):
    value = DIACRITICS_PATTERN.sub('', value)
    value = ''.join(ch for ch in value if not unicodedata.category(ch).startswith('P'))
    return value.strip()


def levenshtein(a, b):
    if len(a) == 0:
        return len(b)
    if len(b) == 0:
        return len(a)

    matrix = [[0] * (len(a) + 1) for _ in range(len(b) + 1)]
    for i in range(len(b) + 1):
        matrix[i][0] = i
    for j in range(len(a) + 1):
        matrix[0][j] = j

    for i in range(1, len(b) + 1):
        for j in range(1, len(a) + 1):
            if b[i - 1] == a[j - 1]:
                matrix[i][j] = matrix[i - 1][j - 1]
            else:
                matrix[i][j] = min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1,
                )
    return matrix[len(b)][len(a)]


def find_closest_words(target, words, n):
    scored = sorted(
        ((word, levenshtein(target, word)) for word in words if word != target),
        key=lambda item: item[1],
    )
    return [word for word, _ in scored[:n]]


class Command(BaseCommand):
    help = (
        'One-time/rerunnable dev tool: imports egyptiansentences content '
        '(Egyptian Arabic cloze sentences from lisaanmasry.org, with '
        'precomputed wrong-answer distractors) from a local '
        'basic-egyptian-sentences checkout into the egyptiansentences '
        'database. Never run in production - the resulting '
        'egyptiansentences.sqlite3 is committed to git directly. Takes '
        'roughly a minute to run, since it computes Levenshtein distance '
        'for every distinct cloze-able word against the full word list.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--source', required=True,
            help='Path to a local basic-egyptian-sentences checkout.',
        )
        parser.add_argument(
            '--flush', action='store_true',
            help='Delete existing Sentence/ClozeWord rows first.',
        )

    def handle(self, *args, **options):
        source = Path(options['source']).resolve()
        sentences_path = source / 'public' / 'lisaanmasry_sentences.jsonl'
        words_path = source / 'public' / 'lisaanmasry_words.txt'

        if not sentences_path.is_file() or not words_path.is_file():
            raise CommandError(
                f'{source} does not look like a basic-egyptian-sentences '
                'checkout (missing public/lisaanmasry_sentences.jsonl or '
                'public/lisaanmasry_words.txt).'
            )

        if options['flush']:
            ClozeWord.objects.all().delete()
            Sentence.objects.all().delete()
            self.stdout.write('Flushed existing egyptiansentences content rows.')

        words = self._load_words(words_path)
        word_set = set(words)
        sentence_count, cloze_word_count = self._import_sentences(sentences_path, words, word_set)

        self.stdout.write(self.style.SUCCESS(
            f'Imported {sentence_count} sentences, {cloze_word_count} cloze words.'
        ))

    def _load_words(self, words_path):
        return [
            word for word in (
                line.strip() for line in words_path.read_text(encoding='utf-8').splitlines()
            )
            if word and not word.startswith('ـ')
        ]

    def _distractors_for(self, target, words, distractor_cache):
        if target in distractor_cache:
            return distractor_cache[target]

        base = normalize_for_compare(target)
        closest = find_closest_words(target, words, CANDIDATE_POOL_SIZE)
        filtered = [word for word in closest if normalize_for_compare(word) != base]
        pool = filtered if filtered else [word for word in words if normalize_for_compare(word) != base]

        distractors = pool[:DISTRACTOR_COUNT]
        if len(distractors) < DISTRACTOR_COUNT and pool:
            extra_pool = [word for word in pool if word not in distractors]
            random.shuffle(extra_pool)
            distractors += extra_pool[:DISTRACTOR_COUNT - len(distractors)]

        distractor_cache[target] = distractors
        return distractors

    def _import_sentences(self, sentences_path, words, word_set):
        distractor_cache = {}
        sentence_count = 0
        cloze_word_count = 0

        for line in sentences_path.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if not line:
                continue

            record = json.loads(line)
            usable_words = list(dict.fromkeys(
                word for word in record['arz'].split() if word in word_set
            ))
            if not usable_words:
                continue

            sentence = Sentence.objects.create(
                arz=record['arz'],
                transliteration=record['transliteration'],
                translations=record['translations'],
            )
            sentence_count += 1

            ClozeWord.objects.bulk_create(
                ClozeWord(
                    sentence=sentence,
                    word=word,
                    distractors=self._distractors_for(word, words, distractor_cache),
                )
                for word in usable_words
            )
            cloze_word_count += len(usable_words)

        return sentence_count, cloze_word_count
