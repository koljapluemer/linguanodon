import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from saetze.models import Exercise, Lesson


class Command(BaseCommand):
    help = (
        'One-time/rerunnable dev tool: imports saetze content (lessons, cloze '
        'exercises with Tatoeba attribution) from a local saetze checkout into '
        'the saetze database. Never run in production - the resulting '
        'saetze.sqlite3 is committed to git directly.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--source', required=True,
            help='Path to a local saetze checkout (with the public/saetze-data submodule initialized).',
        )
        parser.add_argument(
            '--flush', action='store_true',
            help='Delete existing Exercise/Lesson rows first.',
        )

    def handle(self, *args, **options):
        source = Path(options['source']).resolve()
        data_dir = source / 'public' / 'saetze-data' / 'out'
        index_json = data_dir / 'index.json'

        if not index_json.is_file():
            raise CommandError(
                f'{source} does not look like a saetze checkout (missing '
                'public/saetze-data/out/index.json - is the public/saetze-data '
                'submodule initialized?).'
            )

        if options['flush']:
            Exercise.objects.all().delete()
            Lesson.objects.all().delete()
            self.stdout.write('Flushed existing saetze content rows.')

        lesson_count = self._import_lessons(index_json)
        exercise_count = self._import_exercises(data_dir)

        self.stdout.write(self.style.SUCCESS(
            f'Imported {lesson_count} lessons, {exercise_count} exercises.'
        ))

    def _import_lessons(self, index_json):
        index = json.loads(index_json.read_text(encoding='utf-8'))
        for order, (key, name) in enumerate(index.items()):
            Lesson.objects.update_or_create(key=key, defaults={'name': name, 'order': order})
        return len(index)

    def _import_exercises(self, data_dir):
        exercise_count = 0
        for lesson in Lesson.objects.all():
            lesson_json = data_dir / 'data' / f'{lesson.key}.json'
            if not lesson_json.is_file():
                self.stdout.write(self.style.WARNING(f'{lesson.key}: missing {lesson_json}, skipping.'))
                continue

            records = json.loads(lesson_json.read_text(encoding='utf-8'))
            Exercise.objects.filter(lesson=lesson).delete()
            Exercise.objects.bulk_create(
                Exercise(
                    lesson=lesson,
                    english=record['eng'][0],
                    english_credit=record['eng'][1],
                    cloze=record['cloze'],
                    correct_answer=record['answers'][0],
                    wrong_answer=record['answers'][1],
                    german_credit=record['deu_credit'],
                )
                for record in records
            )
            exercise_count += len(records)

        return exercise_count
