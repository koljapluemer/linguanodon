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
uv run python manage.py shell              # Django shell with app context
uv run python manage.py check              # sanity-check the project
uv add <package>                           # add a dependency
```

## Project layout

- `config/` — Django project (settings, root urls, wsgi/asgi)
- `core/` — the main app
- `deploy/` — systemd/nginx config for the VPS deploy (see `doc/deploy.md`)
