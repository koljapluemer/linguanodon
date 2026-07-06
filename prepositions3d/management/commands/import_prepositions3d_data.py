import json
import shutil
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from prepositions3d.models import GlossTask, Language, Translation

STATIC_ROOT = Path(__file__).resolve().parent.parent.parent / 'static' / 'prepositions3d'


class Command(BaseCommand):
    help = (
        'One-time/rerunnable dev tool: imports acquire-prepositions-3d content '
        '(languages, gloss tasks, per-language sentence translations) plus binary '
        'assets (3D models, feedback sounds, per-language audio) from a local '
        'acquire-prepositions-3d checkout into the prepositions3d database and '
        'static directory. Never run in production - the resulting '
        'prepositions3d.sqlite3 and static assets are committed to git directly.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--source', required=True,
            help='Path to a local acquire-prepositions-3d checkout (with the public/data submodule initialized).',
        )
        parser.add_argument(
            '--flush', action='store_true',
            help='Delete existing Translation/GlossTask/Language rows first.',
        )

    def handle(self, *args, **options):
        source = Path(options['source']).resolve()
        data_json = source / 'public' / 'data' / 'data.json'
        languages_json = source / 'public' / 'data' / 'languages.json'
        audio_dir = source / 'public' / 'data' / 'audio'
        models_dir = source / 'src' / 'assets' / 'models'
        sound_dir = source / 'src' / 'assets' / 'sound'

        if not data_json.is_file() or not languages_json.is_file():
            raise CommandError(
                f'{source} does not look like an acquire-prepositions-3d checkout '
                '(missing public/data/data.json or public/data/languages.json - '
                'is the public/data submodule initialized?).'
            )

        if options['flush']:
            Translation.objects.all().delete()
            GlossTask.objects.all().delete()
            Language.objects.all().delete()
            self.stdout.write('Flushed existing prepositions3d content rows.')

        language_count = self._import_languages(languages_json)
        task_count, translation_count = self._import_glosses(data_json)
        self._copy_models(models_dir)
        self._copy_sound(sound_dir)
        self._copy_audio(audio_dir)

        self.stdout.write(self.style.SUCCESS(
            f'Imported {language_count} languages, {task_count} gloss tasks, '
            f'{translation_count} translations.'
        ))

    def _import_languages(self, languages_json):
        index = json.loads(languages_json.read_text(encoding='utf-8'))
        for code, name in index.items():
            Language.objects.update_or_create(code=code, defaults={'name': name})
        return len(index)

    def _import_glosses(self, data_json):
        glosses = json.loads(data_json.read_text(encoding='utf-8'))
        known_languages = set(Language.objects.values_list('code', flat=True))

        translation_count = 0
        for order, (key, entry) in enumerate(glosses.items()):
            GlossTask.objects.update_or_create(key=key, defaults={'order': order})
            audio = entry.get('audio') or {}

            for lang_code, text in entry.items():
                if lang_code == 'audio':
                    continue
                if lang_code not in known_languages:
                    self.stdout.write(self.style.WARNING(
                        f'{key}: skipping unknown language code "{lang_code}".'
                    ))
                    continue

                audio_path = audio.get(lang_code, '')
                if audio_path.startswith('audio/'):
                    audio_path = audio_path[len('audio/'):]

                Translation.objects.update_or_create(
                    task_id=key,
                    language_id=lang_code,
                    defaults={'text': text, 'audio_path': audio_path},
                )
                translation_count += 1

        return len(glosses), translation_count

    def _copy_models(self, models_dir):
        dest = STATIC_ROOT / 'models'
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(models_dir, dest)
        self.stdout.write(f'Copied 3D models into {dest}')

    def _copy_sound(self, sound_dir):
        dest = STATIC_ROOT / 'sound'
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(sound_dir, dest)
        self.stdout.write(f'Copied feedback sounds into {dest}')

    def _copy_audio(self, audio_dir):
        dest_root = STATIC_ROOT / 'audio'
        count = 0
        for lang_dir in sorted(p for p in audio_dir.iterdir() if p.is_dir()):
            dest = dest_root / lang_dir.name
            dest.mkdir(parents=True, exist_ok=True)
            for mp3_path in lang_dir.glob('*.mp3'):
                shutil.copy2(mp3_path, dest / mp3_path.name)
                count += 1
        self.stdout.write(f'Copied {count} audio files into {dest_root}')
