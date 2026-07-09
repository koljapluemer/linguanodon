# Deploying to the VPS

Django + gunicorn behind nginx, Postgres on the same box, on a DigitalOcean
droplet. No CI/CD — deploys are a manual `git pull` over SSH.

## Deploy an update

SSH in as `deploy`, then:

```bash
set -a && source /etc/linguanodon.env && set +a
cd ~/linguanodon
git pull
uv sync --no-dev
uv run python manage.py migrate
uv run python manage.py migrate --database=tprboard
uv run python manage.py migrate --database=comprehensible_input
uv run python manage.py migrate --database=arabicnumbers
uv run python manage.py migrate --database=prepositions3d
uv run python manage.py migrate --database=saetze
uv run python manage.py migrate --database=egyptiansentences
uv run python manage.py migrate --database=infinitesentences
uv run python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
```

`nginx.conf` changes do **not** ship via `git pull`. The file nginx actually
reads is `/etc/nginx/sites-available/linguanodon`, a standalone copy that
diverged from `deploy/nginx.conf` the moment Certbot edited it in place
(added the `:443` block, cert paths, HTTP→HTTPS redirect). To apply an nginx
change: edit `/etc/nginx/sites-available/linguanodon` directly on the
server, then `sudo nginx -t && sudo systemctl reload nginx`. `deploy/nginx.conf`
in git is a reference copy only — keep it updated by hand if you want it to
mean anything, but nothing enforces that it matches reality.

## Files relevant to reconstructing the deploy

- `deploy/gunicorn.service` — systemd unit, installed at
  `/etc/systemd/system/gunicorn.service`. Runs with `ProtectSystem=strict` /
  `ProtectHome=true` and an explicit `ReadWritePaths` for the repo checkout
  (gunicorn writes `comprehensible_input.sqlite3` and `staticfiles/`).
- `deploy/nginx.conf` — reference copy of the server config; **not** what's
  live (see above).
- `/etc/linguanodon.env` (server-only, not in git) — `SECRET_KEY`,
  `DATABASE_URL`, `ALLOWED_HOSTS`, `DEBUG`, `SSL_ENABLED`. `chmod 600`.
  `EnvironmentFile=` in `gunicorn.service` loads it into gunicorn only, not
  into interactive shells — `source` it manually for `manage.py`.
- `/etc/nginx/sites-available/linguanodon` (server-only) — actual live nginx
  config, hand-edited by Certbot. Source of truth for anything nginx-related.
- `/etc/letsencrypt/` (server-only) — Certbot certs + renewal config; renewed
  automatically by a systemd timer, no cron needed.
- Postgres DB `linguanodon`, user `linguanodon` — created once, not
  reproducible from a file; credentials live in `DATABASE_URL` above.
- App-specific `.sqlite3` files (`tprboard`, `comprehensible_input`,
  `arabicnumbers`, `prepositions3d`, `saetze`, `egyptiansentences`,
  `infinitesentences`) — committed to the repo, arrive via `git pull`.
- GitHub deploy key (`~/.ssh/id_ed25519` on server, server-only) — read-only,
  registered under repo Settings → Deploy keys.
