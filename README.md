# linguanodon

A Django app for language practice.

See `doc/deploy.md` for deploying to a VPS.

## Stack

- Django 6, Python 3.13, managed with `uv`
- SQLite (dev), Postgres (prod via `DATABASE_URL`)
- gunicorn + whitenoise + nginx for deployment

## Setup

```bash
uv sync
uv run python manage.py migrate
uv run python manage.py createsuperuser
```

## Core commands

```bash
uv run python manage.py runserver          # dev server at http://127.0.0.1:8000
uv run python manage.py makemigrations     # after changing core/models
uv run python manage.py migrate
uv run python manage.py migrate --database=tprboard  # after changing tprboard/models
uv run python manage.py migrate --database=comprehensible_input  # after changing comprehensible_input/models
uv run python manage.py migrate --database=arabicnumbers  # after changing arabicnumbers/models
uv run python manage.py migrate --database=prepositions3d  # after changing prepositions3d/models
uv run python manage.py shell              # Django shell with app context
uv run python manage.py check              # sanity-check the project
uv add <package>                           # add a dependency
```

## Project layout

- `config/` — Django project (settings, root urls, wsgi/asgi)
- `core/` — the main app
- `tprboard/` — TPR Board (3D vocabulary game), a build-free port of the
  standalone `tpr-board` SPA. Its content (vocab/tasks/3D-object
  relationships) lives in a dedicated `tprboard.sqlite3`, routed there
  automatically by `config/db_router.py` and committed directly to git
  (read-only in normal operation, no fixtures). Its static JS is hand-written
  ES modules with JSDoc type annotations instead of TypeScript - no build
  step. Optionally typecheck it with:
  ```bash
  npx -y -p typescript tsc --project jsconfig.json
  ```
  This is a dev-time convenience only, never part of deploy/collectstatic.
- `accounts/` — user accounts. A custom `User` model (`AUTH_USER_MODEL`)
  extending Django's `AbstractUser` with a `role` field (`NEW`/`TRUSTED`/
  `MODERATOR`/`ADMIN`). Signup is a small custom view; sign-in/sign-out use
  Django's built-in `LoginView`/`LogoutView`. Lives on `default` (Postgres in
  prod), like every app without its own `DATABASES` entry.
- `comprehensible_input/` — superbeginner comprehensible-input video
  watching. Any visitor can browse by language and watch; only `ADMIN`-role
  users can add/edit/delete videos (custom CRUD views, gated by
  `accounts.permissions.AdminRequiredMixin`). Its `Language`/`Video` content
  is live, admin-managed data (not a fixed import like the sibling apps
  below), so `comprehensible_input.sqlite3` is gitignored rather than
  committed. Watch time is tracked per video/language client-side in
  IndexedDB (same hand-written, build-free JS style as `tprboard`).
- `arabicnumbers/` — Arabic numbers practice (0-100), a build-free port of
  the standalone `arabic-numbers-practice` SPA. Its number/numeral/
  transliteration content lives in a dedicated `arabicnumbers.sqlite3`,
  committed to git like `tprboard.sqlite3`. Practice progress (spaced-
  repetition state, mission progress) is tracked client-side in IndexedDB,
  same as `tprboard`/`comprehensible_input`.
- `prepositions3d/` — Acquire Prepositions 3D (WebXR/desktop preposition
  game), a build-free port of the standalone `acquire-prepositions-3d` SPA.
  Its gloss/translation content lives in a dedicated `prepositions3d.sqlite3`,
  committed to git like `tprboard.sqlite3`. Its static JS is hand-written ES
  modules with JSDoc type annotations, loading A-Frame from a pinned CDN
  build - no build step. Learning progress is tracked client-side in
  localStorage only (no third-party analytics, unlike the original SPA).
- `deploy/` — systemd/nginx config for the VPS deploy (see `doc/deploy.md`)
