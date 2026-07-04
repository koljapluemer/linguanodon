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
- `deploy/` — systemd/nginx config for the VPS deploy (see `doc/deploy.md`)
