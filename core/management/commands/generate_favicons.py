from django.conf import settings
from django.core.management.base import BaseCommand

from core.apps_registry import APPS, BACKGROUND_COLOR, TEXT_COLOR

FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="{background}"/>
  <text x="32" y="33" text-anchor="middle" dominant-baseline="central"
        font-family="system-ui, sans-serif" font-size="42" font-weight="700"
        fill="{color}">{code}</text>
</svg>
"""


class Command(BaseCommand):
    help = "Generate favicon.svg for each app in the registry, from its 2-letter code."

    def handle(self, *args, **options):
        for app in APPS:
            svg = FAVICON_SVG.format(background=BACKGROUND_COLOR, color=TEXT_COLOR, code=app.code)
            out_dir = settings.BASE_DIR / app.slug / 'static' / app.slug / 'branding'
            out_dir.mkdir(parents=True, exist_ok=True)
            out_path = out_dir / 'favicon.svg'
            out_path.write_text(svg)
            self.stdout.write(f'Wrote {out_path.relative_to(settings.BASE_DIR)}')
