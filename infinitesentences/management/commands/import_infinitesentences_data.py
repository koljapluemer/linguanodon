import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from infinitesentences.models import Language, LanguagePair, Sentence, SentencePart


class Command(BaseCommand):
    help = (
        'One-time/rerunnable dev tool: imports infinite-sentences content (languages, '
        'sentences, per-word gloss + usage examples with Tatoeba attribution) from a '
        'local infinite-sentences-frontend checkout into the infinitesentences database. '
        'Never run in production - the resulting infinitesentences.sqlite3 is committed '
        'to git directly.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--source', required=True,
            help=(
                'Path to a local infinite-sentences-frontend checkout (with the '
                'public/infinite-sentences-data submodule initialized).'
            ),
        )
        parser.add_argument(
            '--flush', action='store_true',
            help='Delete existing Language/LanguagePair/Sentence/SentencePart rows first.',
        )

    def handle(self, *args, **options):
        source = Path(options['source']).resolve()
        data_dir = source / 'public' / 'infinite-sentences-data'
        languages_json = data_dir / 'languages.json'
        native_languages_json = data_dir / 'native_languages.json'

        if not languages_json.is_file() or not native_languages_json.is_file():
            raise CommandError(
                f'{source} does not look like an infinite-sentences-frontend checkout '
                '(missing public/infinite-sentences-data/languages.json - is the '
                'public/infinite-sentences-data submodule initialized?).'
            )

        if options['flush']:
            SentencePart.objects.all().delete()
            Sentence.objects.all().delete()
            LanguagePair.objects.all().delete()
            Language.objects.all().delete()
            self.stdout.write('Flushed existing infinitesentences content rows.')

        language_count = self._import_languages(languages_json, native_languages_json)
        pair_count, sentence_count, part_count = self._import_pairs_and_sentences(data_dir)

        self.stdout.write(self.style.SUCCESS(
            f'Imported {language_count} languages, {pair_count} language pairs, '
            f'{sentence_count} sentences, {part_count} sentence parts.'
        ))

    def _import_languages(self, languages_json, native_languages_json):
        languages = json.loads(languages_json.read_text(encoding='utf-8'))
        native_codes = set(json.loads(native_languages_json.read_text(encoding='utf-8')))

        for code, info in languages.items():
            Language.objects.update_or_create(
                code=code,
                defaults={
                    'display_name': info.get('displayName', code),
                    'symbols': info.get('symbols', []),
                    'is_native': code in native_codes,
                },
            )

        return len(languages)

    def _import_pairs_and_sentences(self, data_dir):
        native_languages_json = data_dir / 'native_languages.json'
        native_codes = json.loads(native_languages_json.read_text(encoding='utf-8'))

        pair_count = 0
        sentence_count = 0
        part_count = 0

        for native_code in native_codes:
            native_dir = data_dir / native_code
            target_languages_json = native_dir / 'target_languages.json'
            if not target_languages_json.is_file():
                self.stdout.write(self.style.WARNING(
                    f'{native_code}: missing target_languages.json, skipping.'
                ))
                continue

            target_codes = json.loads(target_languages_json.read_text(encoding='utf-8'))
            native = Language.objects.get(code=native_code)

            for target_code in target_codes:
                pair_dir = native_dir / target_code
                index_txt = pair_dir / 'index.txt'
                if not index_txt.is_file():
                    self.stdout.write(self.style.WARNING(
                        f'{native_code}/{target_code}: missing index.txt, skipping.'
                    ))
                    continue

                target = Language.objects.get(code=target_code)
                max_index = int(index_txt.read_text(encoding='utf-8').strip())

                pair, _ = LanguagePair.objects.update_or_create(
                    native=native, target=target, defaults={'sentence_count': 0},
                )
                Sentence.objects.filter(pair=pair).delete()

                imported = self._import_sentences(pair_dir, pair, max_index)
                pair.sentence_count = imported[0]
                pair.save(update_fields=['sentence_count'])

                pair_count += 1
                sentence_count += imported[0]
                part_count += imported[1]

        return pair_count, sentence_count, part_count

    def _import_sentences(self, pair_dir, pair, max_index):
        sentence_count = 0
        part_count = 0

        for index in range(1, max_index + 1):
            sentence_json = pair_dir / f'{index}.json'
            if not sentence_json.is_file():
                continue

            record = json.loads(sentence_json.read_text(encoding='utf-8'))
            sentence = Sentence.objects.create(
                pair=pair,
                index=index,
                text=record['sentence'],
                translations=record.get('translations', []),
                credits=record.get('credits', []),
                transcription=record.get('transcription', ''),
            )
            sentence_count += 1

            parts = record.get('parts', [])
            SentencePart.objects.bulk_create(
                SentencePart(
                    sentence=sentence,
                    order=order,
                    content=part['content'],
                    translations=part.get('translations', []),
                    usage_examples=part.get('usageExamples', []),
                    transcription=part.get('transcription', ''),
                )
                for order, part in enumerate(parts)
            )
            part_count += len(parts)

        return sentence_count, part_count
