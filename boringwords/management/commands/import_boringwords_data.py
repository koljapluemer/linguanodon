import csv
from pathlib import Path

from django.apps import apps
from django.core.management.base import BaseCommand

from boringwords.languages import get_language_codes
from boringwords.models import Background, Word

IMPORT_DATA_DIR = Path(apps.get_app_config('boringwords').path) / 'import_data'
STATIC_DIR = Path(apps.get_app_config('boringwords').path) / 'static' / 'boringwords'


class Command(BaseCommand):
    help = (
        'Imports boringwords content (a hand-authored word deck plus an '
        'Unsplash background-photo pool, per language) from the committed '
        'CSVs in boringwords/import_data/ into the boringwords database. '
        'Unlike egyptiansentences/infinitesentences, this data has no '
        'external source-of-truth repo - the CSVs in import_data/ ARE the '
        'source of truth, hand-edited and re-imported via --flush as the '
        'deck grows. Never run in production - the resulting '
        'boringwords.sqlite3 is committed to git directly.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--flush', action='store_true',
            help='Delete existing Word/Background rows first.',
        )

    def handle(self, *args, **options):
        if options['flush']:
            Word.objects.all().delete()
            Background.objects.all().delete()
            self.stdout.write('Flushed existing boringwords content rows.')

        word_count = sum(self._import_words(lang) for lang in get_language_codes())
        bg_count = sum(self._import_backgrounds(lang) for lang in get_language_codes())

        self.stdout.write(self.style.SUCCESS(
            f'Imported {word_count} words, {bg_count} backgrounds.'
        ))

    def _import_words(self, language):
        path = IMPORT_DATA_DIR / 'words' / f'{language}.csv'
        if not path.is_file():
            self.stdout.write(self.style.WARNING(f'No word CSV for {language}, skipping.'))
            return 0

        created = 0
        with path.open(newline='', encoding='utf-8') as f:
            for row in csv.reader(f):
                if not row or len(row) < 2:
                    continue
                front, back = row[0].strip(), row[1].strip()
                if not front or not back:
                    continue
                Word.objects.create(language=language, front=front, back=back)
                created += 1
        return created

    def _import_backgrounds(self, language):
        credits_path = IMPORT_DATA_DIR / 'credits' / f'{language}.csv'
        image_dir = STATIC_DIR / language
        if not credits_path.is_file():
            self.stdout.write(self.style.WARNING(f'No credits CSV for {language}, skipping.'))
            return 0

        on_disk_stems = {p.stem for p in image_dir.glob('*.webp')} if image_dir.is_dir() else set()

        created = 0
        with credits_path.open(newline='', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                stem = Path(row['filename']).stem
                if stem not in on_disk_stems:
                    continue
                credit = (
                    f"Photo by [{row['photographer']}]({row['photographer_url']}) "
                    f"on [Unsplash]({row['unsplash_url']})"
                )
                Background.objects.create(language=language, filename=stem, credit=credit)
                created += 1
        return created
