# Design system rules

The goal is not a component library or a build step. Every app stays a
build-free, hand-written port. The goal is that chrome (nav, footer, buttons,
colors, stats charts) is defined once and reused, while each app's actual
practice UI stays free to look like whatever the exercise needs.


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


- `AppInfo` in `core/apps_registry.py` centralizes name/description/
logo/state for the index page. 
- Shared per-app sub-nav, rendered from the registry

- Shared per-app footer, content from the registry

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


- Dark mode: No dark mode. All apps use globally defined daisy light theme

- use the shared chart palette, don't invent a new one per app
 in the page `<title>` —
not baked into the `practice` interface's JS.

## Starting a new app

Scaffold `home` / `practice` / `stats?` / `settings?` from the start, register it
in `core/apps_registry.py` immediately (even before it's linked from the
index page), and use `_app_subnav.html` / `_app_footer.html` from the first
commit — there should never again be a first version of an app with
ad hoc navigation to clean up later.
