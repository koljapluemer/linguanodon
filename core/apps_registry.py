"""Single source of truth for the practice apps shown on the index page.

Each app's own templates can reuse the same entry (e.g. code, name) via the
`apps_by_slug` context processor rather than duplicating it locally. The
`home`/`practice`/`stats`/`settings` url names here also drive the shared
`_app_subnav.html`/`_app_footer.html` partials every app template includes.
"""
from dataclasses import dataclass
from enum import Enum

# Shared "logo" palette: the 2-letter `code` rendered in TEXT_COLOR on
# BACKGROUND_COLOR, both on the index page card and in generated favicons
# (see `core.management.commands.generate_favicons`).
TEXT_COLOR = '#7a29e9'
BACKGROUND_COLOR = '#210b3f'


class AppState(Enum):
    PROOF_OF_CONCEPT = 'Proof of Concept'
    USABLE = 'Usable'
    RECOMMENDED = 'Recommended'

    @property
    def badge_class(self) -> str:
        return {
            AppState.PROOF_OF_CONCEPT: 'badge-ghost',
            AppState.USABLE: 'badge-info',
            AppState.RECOMMENDED: 'badge-success',
        }[self]


@dataclass(frozen=True)
class AppInfo:
    slug: str
    name: str
    # 2-letter code shown as a badge on the index card's screenshot and used
    # to generate the app's favicon (see
    # core.management.commands.generate_favicons).
    code: str
    description: str
    languages: str
    state: AppState
    home_url_name: str | None
    # None where `practice` takes a required argument (a lesson/video/
    # language pair) and so has no single parameterless URL to link to -
    # the subnav and index page fall back to `home_url_name` for those.
    practice_url_name: str | None
    stats_url_name: str | None = None
    settings_url_name: str | None = None
    # Short attribution/credits HTML, rendered `|safe` by _app_footer.html.
    footer_html: str = ''

    @property
    def screenshot_static_path(self) -> str:
        """Static-relative path to this app's index-card screenshot.

        Convention over configuration: every app has one at this fixed path,
        so it doesn't need to be set per entry above.
        """
        return f'{self.slug}/branding/screenshot.png'


APPS: list[AppInfo] = [
    AppInfo(
        slug='infinitesentences',
        name='Infinite Sentences',
        code='IS',
        description='Vocab-in-context sentence drills from Tatoeba pairs, with FSRS-scheduled spaced repetition.',
        languages='Multiple',
        state=AppState.RECOMMENDED,
        home_url_name='infinitesentences:landing',
        practice_url_name=None,
        stats_url_name='infinitesentences:stats',
        settings_url_name='infinitesentences:settings',
        footer_html=(
            'Sentence pairs sourced from Tatoeba. Spaced repetition powered by '
            '<a href="https://github.com/open-spaced-repetition/ts-fsrs" class="link">ts-fsrs</a> (MIT).'
            ' All data stays on your device. '
            '<a href="https://github.com/koljapluemer/infinite-sentences-frontend" class="link">Open source</a>.'
        ),
    ),
    AppInfo(
        slug='comprehensible_input',
        name='Comprehensible Input',
        code='CI',
        description='Browse and watch superbeginner comprehensible-input videos by language.',
        languages='Multiple',
        state=AppState.USABLE,
        home_url_name='comprehensible_input:home',
        practice_url_name=None,
        stats_url_name='comprehensible_input:stats',
    ),
    AppInfo(
        slug='tprboard',
        name='TPR Board',
        code='TP',
        description='A 3D vocabulary game that teaches words through actions and relationships between objects.',
        languages='Multiple',
        state=AppState.USABLE,
        home_url_name='tprboard:home',
        practice_url_name='tprboard:practice',
        stats_url_name='tprboard:stats',
        settings_url_name='tprboard:settings',
        footer_html='Spaced-repetition scheduling powered by Ebisu.',
    ),
    AppInfo(
        slug='prepositions3d',
        name='Acquire Prepositions 3D',
        code='PR',
        description='A WebXR/desktop 3D game for acquiring spatial prepositions.',
        languages='Multiple',
        state=AppState.USABLE,
        home_url_name='prepositions3d:home',
        practice_url_name='prepositions3d:practice',
    ),
    AppInfo(
        slug='saetze',
        name='Sätze',
        code='SZ',
        description='German cloze-sentence drills for confusable word families like "jeder/alle/ganz".',
        languages='German',
        state=AppState.USABLE,
        home_url_name='saetze:home',
        practice_url_name=None,
        footer_html='Example sentences from <a href="https://tatoeba.org" class="link">Tatoeba</a>, CC BY 2.0 FR.',
    ),
    AppInfo(
        slug='egyptiansentences',
        name='Basic Egyptian Sentences',
        code='EG',
        description='Timed cloze-word quiz for survival Egyptian Arabic sentences.',
        languages='Egyptian Arabic',
        state=AppState.USABLE,
        home_url_name='egyptiansentences:home',
        practice_url_name='egyptiansentences:practice',
        footer_html='Sentence data from lisaanmasry.org, used under Mike Green’s non-commercial license.',
    ),
    AppInfo(
        slug='arabicnumbers',
        name='Arabic Numbers Practice',
        code='AN',
        description='Learn to read and transliterate Arabic numbers from 0 to 100.',
        languages='Arabic',
        state=AppState.USABLE,
        home_url_name='arabicnumbers:home',
        practice_url_name='arabicnumbers:practice',
    ),
    AppInfo(
        slug='hebrewscript',
        name='Hebrew Script Practice',
        code='HS',
        description='Listen to audio clips and match them to Hebrew script.',
        languages='Hebrew',
        state=AppState.USABLE,
        home_url_name='hebrewscript:home',
        practice_url_name='hebrewscript:practice',
        stats_url_name='hebrewscript:stats',
    ),
    AppInfo(
        slug='viettonepractice',
        name='Vietnamese Tone Practice',
        code='VT',
        description='Listen to audio clips and identify Vietnamese tones by ear.',
        languages='Vietnamese',
        state=AppState.USABLE,
        home_url_name='viettonepractice:home',
        practice_url_name='viettonepractice:practice',
        stats_url_name='viettonepractice:stats',
    ),
    AppInfo(
        slug='typingpractice',
        name='Vietnamese Typing Practice',
        code='TY',
        description='Practice Vietnamese TELEX/VNI keystroke input against a fixed word list.',
        languages='Vietnamese',
        state=AppState.USABLE,
        home_url_name='typingpractice:home',
        practice_url_name='typingpractice:practice_vie',
        settings_url_name='typingpractice:settings_vie',
    ),
]

APPS_BY_SLUG: dict[str, AppInfo] = {app.slug: app for app in APPS}


def nav_context(slug: str, current_page: str) -> dict:
    """Context for `_app_subnav.html` / `_app_footer.html`.

    `current_page` is one of 'home' / 'practice' / 'stats' / 'settings',
    used to highlight the active tab in the subnav.
    """
    return {'app_info': APPS_BY_SLUG[slug], 'current_page': current_page}
