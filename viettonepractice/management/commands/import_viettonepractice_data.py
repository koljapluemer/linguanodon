import random
import shutil
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from viettonepractice.management.commands._tone_algorithm import can_generate_tone_distractor, count_words, normalize_transcript
from viettonepractice.models import Clip

STATIC_ROOT = Path(__file__).resolve().parent.parent.parent / 'static' / 'viettonepractice'
MAX_WORDS = 5
DEFAULT_SAMPLE_SIZE = 1000
DEFAULT_SEED = 42


class Command(BaseCommand):
    help = (
        'One-time/rerunnable dev tool: imports a random sample of tone-confusion-capable '
        'clips (filename + transcript) from a local listen-to-viet checkout into the '
        'viettonepractice database, and copies the matching audio files into the app\'s '
        'static directory. Never run in production - the resulting viettonepractice.sqlite3 '
        'and static audio are committed to git directly.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--source', required=True,
            help='Path to a local listen-to-viet checkout (with public/transcriptAll.txt and public/mp3/).',
        )
        parser.add_argument(
            '--sample-size', type=int, default=DEFAULT_SAMPLE_SIZE,
            help=f'Number of clips to randomly sample (default {DEFAULT_SAMPLE_SIZE}).',
        )
        parser.add_argument(
            '--seed', type=int, default=DEFAULT_SEED,
            help=f'Random seed for reproducible sampling (default {DEFAULT_SEED}).',
        )
        parser.add_argument(
            '--keep-existing', action='store_true',
            help='Do not flush existing Clip rows / audio directory before importing.',
        )

    def handle(self, *args, **options):
        source = Path(options['source']).resolve()
        transcript_path = source / 'public' / 'transcriptAll.txt'
        mp3_dir = source / 'public' / 'mp3'

        if not transcript_path.is_file() or not mp3_dir.is_dir():
            raise CommandError(
                f'{source} does not look like a listen-to-viet checkout '
                '(missing public/transcriptAll.txt or public/mp3).'
            )

        relevant = self._find_relevant_clips(transcript_path)
        self.stdout.write(f'{len(relevant)} clips pass the <= {MAX_WORDS}-word + tone-distractor filter.')

        sample_size = options['sample_size']
        rng = random.Random(options['seed'])
        if len(relevant) <= sample_size:
            if len(relevant) < sample_size:
                self.stdout.write(self.style.WARNING(
                    f'Only {len(relevant)} relevant clips found, fewer than the requested '
                    f'sample size of {sample_size}. Using all of them.'
                ))
            sample = relevant
        else:
            sample = rng.sample(relevant, sample_size)

        if not options['keep_existing']:
            Clip.objects.all().delete()
            audio_dir = STATIC_ROOT / 'audio'
            if audio_dir.exists():
                shutil.rmtree(audio_dir)
            self.stdout.write('Flushed existing Clip rows and audio directory.')

        used_norm_count = self._import_sample(sample, mp3_dir)

        self.stdout.write(self.style.SUCCESS(
            f'Imported {Clip.objects.count()} clips (sampled {len(sample)} of {len(relevant)} relevant), '
            f'{used_norm_count} used normalized (norm_) audio.'
        ))

    def _find_relevant_clips(self, transcript_path):
        relevant = []

        with transcript_path.open('r', encoding='utf-8') as handle:
            for raw_line in handle:
                line = raw_line.strip()
                if not line:
                    continue

                parts = line.split('|')
                if len(parts) != 3:
                    continue

                filename, raw_transcript, timing = parts
                if not filename or not timing:
                    continue

                transcript = normalize_transcript(raw_transcript)
                if not transcript:
                    continue

                word_count = count_words(transcript)
                if word_count > MAX_WORDS:
                    continue

                if not can_generate_tone_distractor(transcript):
                    continue

                relevant.append((filename, transcript, word_count))

        return relevant

    def _import_sample(self, sample, mp3_dir):
        dest_root = STATIC_ROOT / 'audio'
        dest_root.mkdir(parents=True, exist_ok=True)
        used_norm_count = 0

        for filename, transcript, word_count in sample:
            norm_path = mp3_dir / f'norm_{filename}'
            base_path = mp3_dir / filename

            if norm_path.is_file():
                source_path, used_norm = norm_path, True
            elif base_path.is_file():
                source_path, used_norm = base_path, False
            else:
                self.stdout.write(self.style.WARNING(f'No audio file found for {filename} - skipping.'))
                continue

            shutil.copy2(source_path, dest_root / filename)
            if used_norm:
                used_norm_count += 1

            Clip.objects.update_or_create(
                filename=filename,
                defaults={
                    'transcript': transcript,
                    'word_count': word_count,
                    'used_normalized_audio': used_norm,
                },
            )

        return used_norm_count
