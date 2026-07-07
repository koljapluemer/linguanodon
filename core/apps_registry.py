"""Single source of truth for the practice apps shown on the index page.

Each app's own templates can reuse the same entry (e.g. logo, name) via the
`apps_by_slug` context processor rather than duplicating it locally.
"""
from dataclasses import dataclass, field
from enum import Enum


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
    description: str
    languages: str
    state: AppState
    url_name: str
    # Static-relative paths, e.g. f'{slug}/branding/logo.svg'. None/[] until
    # real assets are added - templates must handle the missing case.
    logo: str | None = None
    screenshots: list[str] = field(default_factory=list)


APPS: list[AppInfo] = [
    AppInfo(
        slug='infinitesentences',
        name='Infinite Sentences',
        description='Vocab-in-context sentence drills from Tatoeba pairs, with FSRS-scheduled spaced repetition.',
        languages='Multiple',
        state=AppState.RECOMMENDED,
        url_name='infinitesentences:landing',
    ),
    AppInfo(
        slug='comprehensible_input',
        name='Comprehensible Input',
        description='Browse and watch superbeginner comprehensible-input videos by language.',
        languages='Multiple',
        state=AppState.USABLE,
        url_name='comprehensible_input:language_list',
    ),
    AppInfo(
        slug='tprboard',
        name='TPR Board',
        description='A 3D vocabulary game that teaches words through actions and relationships between objects.',
        languages='Multiple',
        state=AppState.USABLE,
        url_name='tprboard:board',
    ),
    AppInfo(
        slug='prepositions3d',
        name='Acquire Prepositions 3D',
        description='A WebXR/desktop 3D game for acquiring spatial prepositions.',
        languages='Multiple',
        state=AppState.USABLE,
        url_name='prepositions3d:game',
    ),
    AppInfo(
        slug='saetze',
        name='Sätze',
        description='German cloze-sentence drills for confusable word families like "jeder/alle/ganz".',
        languages='German',
        state=AppState.USABLE,
        url_name='saetze:lesson_list',
    ),
    AppInfo(
        slug='egyptiansentences',
        name='Basic Egyptian Sentences',
        description='Timed cloze-word quiz for survival Egyptian Arabic sentences.',
        languages='Egyptian Arabic',
        state=AppState.USABLE,
        url_name='egyptiansentences:practice',
    ),
    AppInfo(
        slug='arabicnumbers',
        name='Arabic Numbers Practice',
        description='Learn to read and transliterate Arabic numbers from 0 to 100.',
        languages='Arabic',
        state=AppState.USABLE,
        url_name='arabicnumbers:practice',
    ),
    AppInfo(
        slug='hebrewscript',
        name='Hebrew Script Practice',
        description='Listen to audio clips and match them to Hebrew script.',
        languages='Hebrew',
        state=AppState.USABLE,
        url_name='hebrewscript:practice',
    ),
    AppInfo(
        slug='viettonepractice',
        name='Vietnamese Tone Practice',
        description='Listen to audio clips and identify Vietnamese tones by ear.',
        languages='Vietnamese',
        state=AppState.USABLE,
        url_name='viettonepractice:practice',
    ),
    AppInfo(
        slug='typingpractice',
        name='Vietnamese Typing Practice',
        description='Practice Vietnamese TELEX/VNI keystroke input against a fixed word list.',
        languages='Vietnamese',
        state=AppState.USABLE,
        url_name='typingpractice:practice_vie',
    ),
]

APPS_BY_SLUG: dict[str, AppInfo] = {app.slug: app for app in APPS}
