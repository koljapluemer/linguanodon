import json
import shutil
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from tprboard.models import BoardObject, Locale, ObjectRelationship, SentenceFormulation

STATIC_ROOT = Path(__file__).resolve().parent.parent.parent / 'static' / 'tprboard'


class Command(BaseCommand):
    help = (
        'One-time/rerunnable dev tool: imports tpr-board content (objects, '
        'relationships, locale sentence formulations) plus binary assets '
        '(3D models, audio, explain image) from a local tpr-board checkout '
        'into the tprboard database and static directory. Never run in '
        'production - the resulting tprboard.sqlite3 and static assets are '
        'committed to git directly.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--source', required=True,
            help='Path to a local tpr-board checkout (with the tpr-board-data submodule initialized).',
        )
        parser.add_argument(
            '--flush', action='store_true',
            help='Delete existing Locale/BoardObject/ObjectRelationship/SentenceFormulation rows first.',
        )

    def handle(self, *args, **options):
        source = Path(options['source']).resolve()
        objects_dir = source / 'public' / 'objects'
        data_dir = source / 'public' / 'tpr-board-data'
        models_dir = source / 'public' / 'models'
        explain_image = source / 'src' / 'assets' / 'explain.webp'

        if not objects_dir.is_dir() or not data_dir.is_dir():
            raise CommandError(f'{source} does not look like a tpr-board checkout (missing public/objects or public/tpr-board-data).')

        if options['flush']:
            SentenceFormulation.objects.all().delete()
            ObjectRelationship.objects.all().delete()
            BoardObject.objects.all().delete()
            Locale.objects.all().delete()
            self.stdout.write('Flushed existing tprboard content rows.')

        canonical_task_keys = self._import_objects(objects_dir)
        locale_count, dropped = self._import_locales(data_dir, canonical_task_keys)
        self._copy_models(models_dir)
        self._copy_audio(data_dir)
        self._copy_explain_image(explain_image)

        self.stdout.write(self.style.SUCCESS(
            f'Imported {BoardObject.objects.count()} objects, '
            f'{ObjectRelationship.objects.count()} relationships, '
            f'{locale_count} locales, '
            f'{SentenceFormulation.objects.count()} formulations '
            f'({dropped} orphaned locale-file entries dropped).'
        ))

    def _import_objects(self, objects_dir):
        index_path = objects_dir / '_index.txt'
        slugs = [line.strip() for line in index_path.read_text(encoding='utf-8').splitlines() if line.strip()]

        records = {}
        for order, slug in enumerate(slugs):
            record = json.loads((objects_dir / f'{slug}.json').read_text(encoding='utf-8'))
            records[slug] = record
            hold = record.get('hold') or {}
            anchor = hold.get('anchor') or [None, None, None]
            BoardObject.objects.update_or_create(
                slug=slug,
                defaults={
                    'order': order,
                    'model_path': record['model'],
                    'hold_anchor_x': anchor[0],
                    'hold_anchor_y': anchor[1],
                    'hold_anchor_z': anchor[2],
                    'hold_scale': hold.get('scale'),
                },
            )

        canonical_task_keys = {}
        for source_slug, record in records.items():
            for target_slug, (verb, source_effect, target_effect) in (record.get('relationships') or {}).items():
                if target_slug not in records:
                    self.stdout.write(self.style.WARNING(
                        f'{source_slug}.json references unknown target "{target_slug}" - skipping relationship.'
                    ))
                    continue
                task_key = f'{source_slug}_{verb}_{target_slug}'
                relationship, _ = ObjectRelationship.objects.update_or_create(
                    source_id=source_slug,
                    target_id=target_slug,
                    defaults={
                        'verb': verb,
                        'source_effect': source_effect,
                        'target_effect': target_effect,
                        'task_key': task_key,
                    },
                )
                canonical_task_keys[task_key] = relationship

        return canonical_task_keys

    def _import_locales(self, data_dir, canonical_task_keys):
        index = json.loads((data_dir / 'index.json').read_text(encoding='utf-8'))
        dropped = 0

        for code, name in index.items():
            Locale.objects.update_or_create(code=code, defaults={'name': name})
            locale_json_path = data_dir / code / f'{code}.json'
            task_map = json.loads(locale_json_path.read_text(encoding='utf-8'))

            for task_key, formulations in task_map.items():
                relationship = canonical_task_keys.get(task_key)
                if relationship is None:
                    dropped += 1
                    continue
                for order, text in enumerate(formulations):
                    SentenceFormulation.objects.update_or_create(
                        locale_id=code,
                        relationship=relationship,
                        order=order,
                        defaults={'text': text},
                    )

        return len(index), dropped

    def _copy_models(self, models_dir):
        dest = STATIC_ROOT / 'models'
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(models_dir, dest)
        self.stdout.write(f'Copied 3D models into {dest}')

    def _copy_audio(self, data_dir):
        index = json.loads((data_dir / 'index.json').read_text(encoding='utf-8'))
        dest_root = STATIC_ROOT / 'audio'
        for code in index:
            dest = dest_root / code
            dest.mkdir(parents=True, exist_ok=True)
            for mp3_path in (data_dir / code).glob('*.mp3'):
                shutil.copy2(mp3_path, dest / mp3_path.name)
        self.stdout.write(f'Copied audio for {len(index)} locales into {dest_root}')

    def _copy_explain_image(self, explain_image):
        if not explain_image.exists():
            self.stdout.write(self.style.WARNING(f'{explain_image} not found - skipping.'))
            return
        dest = STATIC_ROOT / 'img' / 'explain.webp'
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(explain_image, dest)
        self.stdout.write(f'Copied explain image into {dest}')
