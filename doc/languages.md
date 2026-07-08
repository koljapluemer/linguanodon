# Language codes

The goal is one shared vocabulary for "which language(s) does this app teach",
so the index page and each app's own hero can show real, live data instead of
hand-typed prose — without forcing every app onto one shared data model.

## 1. Why there's no shared `Language` database table

`config/db_router.py` routes every content app (`infinitesentences`,
`comprehensible_input`, `prepositions3d`, `tprboard`, `saetze`,
`egyptiansentences`, `arabicnumbers`, `hebrewscript`, `viettonepractice`,
`typingpractice`) to its own dedicated SQLite file, and its `allow_relation`
refuses any foreign key across two different database aliases. `core` (which
holds the cross-app registry) and the apps' individual databases are
therefore permanently unable to share a relational `Language` model — `core`
can never `ForeignKey` into, say, `infinitesentences`' language table.

So the shared thing isn't a table, it's a **vocabulary of codes**: plain
strings every app agrees on the meaning of, each app storing/using them
however suits its own data.

## 2. The vocabulary: ISO 639-3

Codes are 3-letter ISO 639-3 (`deu`, `vie`, `arz`, `arb`, `tok`, ...) —
confirmed to already be what `infinitesentences`, `prepositions3d`, and
`tprboard`'s existing `Language`/`Locale` tables use. ISO 639-3 covers ~7,900
languages including most conlangs and dialects (Toki Pona is `tok`, Esperanto
is `epo`, Egyptian Arabic is `arz`), so it rarely runs out.

`core/languages.py::display_name(code)` resolves a code to a human-readable
name via the `iso639-lang` package — don't hand-maintain a code→name table,
that library already has one. For the rare code with no ISO 639-3 entry (an
invented dialect, a homebrew conlang), add it to `CUSTOM_LANGUAGES` in that
same file instead — a BCP-47-style private-use escape hatch, empty today
because nothing currently in use needs it.

## 3. How an app declares its codes

Every app has a `<slug>/languages.py` with one function:

```python
def get_language_codes() -> list[str]:
    ...
```

`core/languages.py::language_codes(slug)` imports this module lazily
(`importlib.import_module`) and calls it — `core` never needs to know how an
app's data is shaped, mirroring the existing "convention over configuration"
idiom (`AppInfo.screenshot_static_path`).

Two shapes in practice:
- **Single-language apps** (`saetze`, `egyptiansentences`, `arabicnumbers`,
  `hebrewscript`, `viettonepractice`, `typingpractice`) — a static
  one-item list, e.g. `return ['deu']`. No database involved.
- **Multi-language apps** (`infinitesentences`, `comprehensible_input`,
  `prepositions3d`, `tprboard`) — a live query against the app's own
  `Language`/`Locale` model's `code` field, e.g.
  `list(Language.objects.values_list('code', flat=True))`. New rows added
  later (via `/admin/` or an `import_*` management command) show up
  automatically — nothing else needs to change.

`core/languages.py::language_display(slug)` joins the resolved names for
display, e.g. `"German, Vietnamese"` — above `MAX_NAMES_SHOWN` (8) codes it
truncates to `"..., and {n} more"` instead of a long comma list
(`infinitesentences` alone has 35 language rows).

The `language_display` template filter (`core/templatetags/language_tags.py`)
is the only thing templates use: `{{ app.slug|language_display }}` in both
`templates/index.html` and `templates/_app_hero.html` — the only two places
in the repo that show a "Languages:" line.

## Checklist: adding a new app

1. Add `<slug>/languages.py` with `get_language_codes()`.
2. If the app teaches more than one language, give it its own `Language`/
   `Locale` model with a `code = models.CharField(max_length=8)` field
   (doesn't have to be the primary key), matching the existing three models'
   shape.
3. Register the app in `core/apps_registry.py` as usual — no `languages`
   field needed there, it's derived automatically.

## Checklist: adding a language to an existing multi-language app

Just add the row (via `/admin/` or the app's `import_*` command). The index
page and the app's own hero pick it up on the next request — no code change.
