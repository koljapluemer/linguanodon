import json
import shutil
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from hebrewscript.management.commands._letter_algorithm import can_generate_distractor
from hebrewscript.models import Clip

STATIC_ROOT = Path(__file__).resolve().parent.parent.parent / 'static' / 'hebrewscript'


class Command(BaseCommand):
    help = (
        'One-time/rerunnable dev tool: imports the learn-hebrew-script sentence dataset '
        '(id + sentence pairs, filtered to ones capable of generating a letter-substitution '
        'distractor) from a local learn-hebrew-script checkout into the hebrewscript '
        'database, and copies the matching .opus audio files into the app\'s static '
        'directory. Never run in production - the resulting hebrewscript.sqlite3 and '
        'static audio are committed to git directly.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--source', required=True,
            help='Path to a local learn-hebrew-script checkout (with public/data/short_sentences.json and public/data/*.opus).',
        )
        parser.add_argument(
            '--keep-existing', action='store_true',
            help='Do not flush existing Clip rows / audio directory before importing.',
        )

    def handle(self, *args, **options):
        source = Path(options['source']).resolve()
        data_path = source / 'public' / 'data' / 'short_sentences.json'
        audio_dir = source / 'public' / 'data'

        if not data_path.is_file() or not audio_dir.is_dir():
            raise CommandError(
                f'{source} does not look like a learn-hebrew-script checkout '
                '(missing public/data/short_sentences.json or public/data/).'
            )

        with data_path.open('r', encoding='utf-8') as handle:
            entries = json.load(handle)

        relevant = [
            (entry['id'], entry['sentence'])
            for entry in entries
            if entry.get('id') and entry.get('sentence') and can_generate_distractor(entry['sentence'])
        ]
        self.stdout.write(f'{len(relevant)} of {len(entries)} entries pass the distractor filter.')

        if not options['keep_existing']:
            Clip.objects.all().delete()
            dest_audio_dir = STATIC_ROOT / 'audio'
            if dest_audio_dir.exists():
                shutil.rmtree(dest_audio_dir)
            self.stdout.write('Flushed existing Clip rows and audio directory.')

        imported_count = self._import_entries(relevant, audio_dir)

        self.stdout.write(self.style.SUCCESS(
            f'Imported {Clip.objects.count()} clips ({imported_count} audio files copied this run).'
        ))

    def _import_entries(self, entries, audio_dir):
        dest_audio_dir = STATIC_ROOT / 'audio'
        dest_audio_dir.mkdir(parents=True, exist_ok=True)
        imported_count = 0

        for filename, sentence in entries:
            source_path = audio_dir / f'{filename}.opus'
            if not source_path.is_file():
                self.stdout.write(self.style.WARNING(f'No audio file found for {filename} - skipping.'))
                continue

            shutil.copy2(source_path, dest_audio_dir / f'{filename}.opus')
            imported_count += 1

            Clip.objects.update_or_create(
                filename=filename,
                defaults={'transcript': sentence},
            )

        return imported_count
