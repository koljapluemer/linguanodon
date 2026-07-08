"""Shared language-code vocabulary for every practice app.

There is deliberately no shared `Language` DB table: config/db_router.py
routes each content app to its own SQLite database, and `allow_relation`
blocks any foreign key across aliases, so a cross-app relational Language
model isn't possible here. Instead, the shared vocabulary is plain codes
(ISO 639-3, e.g. 'deu', 'vie', 'arz') - each app privately owns whatever
representation of "language" makes sense for its own data. See
doc/languages.md.
"""
import importlib

from iso639 import Lang
from iso639.exceptions import DeprecatedLanguageValue, InvalidLanguageValue

# Overrides for codes iso639-lang doesn't resolve (e.g. a private-use/BCP-47
# qaa-qtz or x-* code for an unregistered conlang or dialect). Empty today -
# every code currently in use resolves via iso639-lang.
CUSTOM_LANGUAGES: dict[str, str] = {}

# Above this many languages, the displayed line truncates to "...and N more"
# instead of listing every name - infinitesentences alone already has 35
# language rows.
MAX_NAMES_SHOWN = 8


def display_name(code: str) -> str:
    if code in CUSTOM_LANGUAGES:
        return CUSTOM_LANGUAGES[code]
    try:
        return Lang(code).name
    except (InvalidLanguageValue, DeprecatedLanguageValue):
        return code


def language_codes(slug: str) -> list[str]:
    """Codes an app currently has content in.

    Convention over configuration (mirrors AppInfo.screenshot_static_path):
    every app has a `<slug>/languages.py` with a `get_language_codes()`
    function - a static list for single-language apps, a live query against
    the app's own database for multi-language apps.
    """
    module = importlib.import_module(f'{slug}.languages')
    return module.get_language_codes()


def language_display(slug: str) -> str:
    names = [display_name(c) for c in language_codes(slug)]
    if len(names) <= MAX_NAMES_SHOWN:
        return ', '.join(names)
    shown, remaining = names[:MAX_NAMES_SHOWN], len(names) - MAX_NAMES_SHOWN
    return f'{", ".join(shown)}, and {remaining} more'
