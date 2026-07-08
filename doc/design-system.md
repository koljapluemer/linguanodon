# Design system rules

The goal is not a component library or a build step. Every app stays a
build-free, hand-written port. The goal is that chrome (nav, footer, buttons,
colors, stats charts) is defined once and reused, while each app's actual
practice UI stays free to look like whatever the exercise needs.

## 1. Route shape: `home` / `practice` / `stats` / `settings`

Every app should expose up to four routes, named consistently in `urls.py`:

- **`home`** — explains the app: what it teaches, how the exercise works, any
  prerequisites (e.g. pick a language pair). Optional only if there's truly
  nothing to explain and `practice` is self-evident on load.
- **`practice`** — the actual practice interface. This is the app's reason to
  exist and always exists.
- **`stats`** — per-app stats, if the app has learning data detailed enough
  that the [unified tracking dashboard](#7-stats-use-the-shared-chart-palette)
  isn't enough on its own (FSRS card state, per-item accuracy, etc). Skip this
  route if there's nothing app-specific to show beyond trial counts.
- **`settings`** — only if the app has real per-user configuration (e.g.
  language pair).


---



**Current state:** only `infinitesentences` has this shape (`landing` / `learn/.../` /
`stats` / `settings`). Everyone else uses ad hoc root names — `practice`,
`board`, `game`, `lesson_list` — and most have no `home` at all (the root path
*is* the practice screen). Renaming these is a mechanical pass: `urls.py`
view name, the view function name if you want them to match, and the
`practice_url_name` reference in `core/apps_registry.py`. Root URL paths
(`''`) don't need to change, just the route *names*.

## 2. `core/apps_registry.py` is the single source of truth

`AppInfo` in `core/apps_registry.py` already centralizes name/description/
logo/state for the index page. Extend it — don't duplicate this data in
templates — with the route names and footer content every app needs:

```python
@dataclass(frozen=True)
class AppInfo:
    ...
    home_url_name: str | None = None      # None if the app has no home page
    practice_url_name: str = ...          # replaces today's `url_name`
    stats_url_name: str | None = None
    settings_url_name: str | None = None
    footer_html: str = ''                 # short attribution/credits, safe HTML
```

The shared sub-nav and footer (below) read from `apps_by_slug` — an app
template never hand-writes its own nav links or footer text.

## 3. Shared per-app sub-nav, rendered from the registry

`base.html`'s navbar (site name + sign in/out) is already global and fine as
is. What's missing is the second tier: Home / Practice / Stats / Settings
links for the app currently being viewed.

Today every app improvises this instead:
- hebrewscript / comprehensible_input hand-place a `btn btn-sm btn-outline`
  link top-right of the content div ("Stats", "Back to practice")
- egyptiansentences, saetze, tprboard, prepositions3d, arabicnumbers,
  typingpractice have no cross-page nav at all — one dead-end page
- infinitesentences does its own nav inside the Vue app per page

Replace all of this with one partial, e.g. `templates/_app_subnav.html`,
that takes the current app's slug, looks it up via `apps_by_slug`, and
renders only the links that have a non-`None` url name (active tab
highlighted). Every app template includes it the same way at the top of
`{% block content %}`. No app writes its own back/stats/settings links again.

## 4. Shared per-app footer, content from the registry

No app has a footer today — clean slate. Add `templates/_app_footer.html`,
included once by every app template (or once in `base.html` gated on
whether the current app has footer content), rendering
`apps_by_slug.<slug>.footer_html` with `|safe`. Use it for the kind of thing
that's currently scattered as inline text or missing entirely: data source
credits (Tatoeba, lisaanmasry.org, Mike Green's license terms — see
`README.md`'s per-app notes), links to the original standalone SPA if still
public, etc. Keep it short HTML (or Markdown rendered to HTML at registry
build time, if that ends up more pleasant to author) — not a rich content
area.

There is one true global footer (or none) for the site shell itself
(copyright, contact) — that's a separate, simpler thing from the per-app one
and lives directly in `base.html`, not in the registry.

## 5. Buttons, color, type: daisyUI tokens only, no raw Tailwind palette

USE `btn` liberally, do not use other sizes or special semantics unless strongly called for.
if something is truly and clearly THE primary action, use `btn btn-primary`.

`base.html` already pulls in daisyUI + Tailwind from CDN and sets
`data-theme="light"` — that's the one styling foundation every app shares.
Don't reach for raw Tailwind color utilities (`bg-yellow-500`, `bg-amber-400`,
`bg-emerald-500`, `bg-amber-200`) for anything that represents a semantic
state (success, warning, highlight). Use daisyUI's semantic classes
(`btn-primary`, `btn-success`, `bg-warning`, `text-error`, ...) so a future
theme change (or dark mode — see below) propagates everywhere instead of
requiring a grep-and-fix across every app's JS.

**Current state:** `arabicnumbers/practiceApp.js`, `tprboard/main.js`, and
`infinitesentences/IndexCard.js` all hardcode raw Tailwind colors for
progress bars / highlight cards. Low priority to fix (they're accents, not
chrome) but flag it in review when touching those files.

Small app-scoped CSS files (`arabicnumbers`, `hebrewscript`, `tprboard`,
`viettonepractice`, `infinitesentences` each have one, 4–99 lines) are fine —
they're single-purpose tweaks (e.g. a text-highlight marker), not competing
design systems. No need to consolidate those into a shared stylesheet.

## 6. Dark mode: No dark mode. All apps use globally defined daisy light theme

## 7. Stats: use the shared chart palette, don't invent a new one per app

`tracking/dashboard.js` (the cross-app activity dashboard) already defines a
light/dark-aware chart color system as CSS custom properties (`--series-1`
through `--series-8`, `--surface-1`, `--gridline`, etc., with a
`[data-theme="dark"]` override block). `hebrewscript/stats.js` and
`viettonepractice/stats.js` each currently pick their own Chart.js colors
independently, duplicating work and drifting from the tracking dashboard's
palette.

Lift that variable block out of `templates/tracking/dashboard.html` into a
shared stylesheet (e.g. `static/core/css/chart-theme.css`), and have every
per-app stats page load it and reference the same `--series-N` variables in
its Chart.js config instead of choosing new colors. One palette, defined
once, used everywhere a chart appears — including future per-app stats
pages.

Before building a bespoke per-app stats page for a new app, check whether
the unified `tracking` dashboard already covers it (trial counts, active
time, per day, per app) — only add an app-specific `stats` route for data the
tracking app can't show (FSRS card state, per-item accuracy, etc — see rule 1).

## 8. Don't duplicate the app's name/title inside the practice UI

Several apps render their own `<h1>App Name</h1>` from JS on the practice
screen itself (`egyptiansentences/gameApp.js`, `infinitesentences/landingApp.js`)
— redundant with the browser tab's `{% block title %}` and with the future
shared sub-nav, which will show the app name too. The app's name belongs on
`home` (as a real heading, it's a landing page) and in the page `<title>` —
not baked into the `practice` interface's JS.

## Applying this to an existing app (checklist)

1. Rename the root route to `practice` (add `home` if the app needs one).
2. Update `core/apps_registry.py`: fill in `home_url_name` / `practice_url_name` /
   `stats_url_name` / `settings_url_name` / `footer_html`.
3. Replace any hand-written back/stats links in the template with
   `{% include "_app_subnav.html" %}`.
4. Add `{% include "_app_footer.html" %}`.
5. Remove any in-JS `<h1>App Name</h1>` from the `main` view; move it to `home`.
6. If the app has a stats page, switch its chart colors to the shared
   `--series-N` variables (rule 7).
7. Swap any raw Tailwind semantic colors for daisyUI tokens (rule 5) while
   you're in the file — not a blocking requirement, but an easy win to bundle
   in.

## Starting a new app

Scaffold `home` / `practice` / `stats?` / `settings?` from the start, register it
in `core/apps_registry.py` immediately (even before it's linked from the
index page), and use `_app_subnav.html` / `_app_footer.html` from the first
commit — there should never again be a first version of an app with
ad hoc navigation to clean up later.
