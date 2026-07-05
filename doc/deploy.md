# Deploying to the VPS

This app takes over the droplet that used to run `transparent-input`. Django +
gunicorn behind nginx, Postgres on the same box. No CI/CD — deploys are a
manual `git pull` over SSH.

Config files: `deploy/gunicorn.service`, `deploy/nginx.conf`.

---

## One-time: retire transparent-input

SSH in as `deploy` (the user and its sudo/systemctl rights already exist from
the old setup):

```bash
ssh deploy@YOUR_IP
```

Stop and disable the old service:

```bash
sudo systemctl stop gunicorn
sudo systemctl disable gunicorn
```

Remove the old nginx site:

```bash
sudo rm /etc/nginx/sites-enabled/transparent-input
sudo rm /etc/nginx/sites-available/transparent-input
```

Drop the old database (back it up first with `pg_dump` if you want to keep
anything):

```bash
sudo -u postgres psql -c "DROP DATABASE transparent-input;"
sudo -u postgres psql -c "DROP USER transparent-input;"
```

Remove the old checkout and env file:

```bash
rm -rf ~/transparent-input
sudo rm /etc/transparent-input.env
```

The old GitHub deploy key (`~/.ssh/id_ed25519`) was scoped read-only to the
`transparent-input` repo on GitHub — it won't work for the new repo. You can
either reuse the same keypair (add its public key as a deploy key on the new
repo) or generate a fresh one; instructions for both are below.

nginx and Postgres are already installed from the old setup, so there's
nothing to `apt install` this time.

---

## One-time: set up linguanodon

### 1. Database

```bash
sudo -u postgres psql
```

```sql
CREATE USER linguanodon WITH PASSWORD 'choose-a-strong-password';
CREATE DATABASE linguanodon OWNER linguanodon;
\q
```

### 2. GitHub access

If reusing the old keypair, print the existing public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Otherwise generate a new one:

```bash
ssh-keygen -t ed25519 -C "deploy@droplet" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Copy the output, then in GitHub → `koljapluemer/linguandon` → **Settings →
Deploy keys → Add deploy key** → paste it in (read-only access is enough).

### 3. Clone the repo and install deps

`uv` is already installed from the old setup.

```bash
cd ~
git clone git@github.com:koljapluemer/linguandon.git linguanodon
cd linguanodon
uv sync --no-dev
```

### 4. Create the env file

Generate a secret key:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

Create the file (substitute your key and DB password):

```bash
sudo nano /etc/linguanodon.env
```

```
SECRET_KEY=<paste generated key here>
DATABASE_URL=postgresql://linguanodon:<db-password>@localhost/linguanodon
ALLOWED_HOSTS=your-domain.com
DEBUG=false
```

Lock down the file:

```bash
sudo chmod 600 /etc/linguanodon.env
```

### 5. Run migrations, collect static, create a superuser

```bash
set -a && source /etc/linguanodon.env && set +a
cd ~/linguanodon
uv run python manage.py migrate
uv run python manage.py migrate --database=tprboard
uv run python manage.py migrate --database=comprehensible_input
uv run python manage.py collectstatic --noinput
uv run python manage.py createsuperuser
```

`tprboard.sqlite3` (the tpr-board vocabulary/task content) is committed
directly to the repo, not loaded from a fixture - `git pull` already brings
the populated file. The `migrate --database=tprboard` step only matters when
a future code change ships a new migration for that app; it's a no-op
otherwise. `comprehensible_input.sqlite3` is NOT committed (it holds live,
admin-entered data) - the `migrate --database=comprehensible_input` step
creates it fresh on the server.

After `createsuperuser`, the account it creates has `is_staff`/`is_superuser`
but its app-level `role` still defaults to `NEW` - to let it manage
comprehensible-input videos, open `/admin/`, edit the user, and set `role`
to `Admin`.

**One-time note (first deploy after `accounts` was added):** this introduces
a custom `AUTH_USER_MODEL` (`accounts.User`). Django does not support
switching `AUTH_USER_MODEL` after `migrate` has already run against the
built-in `auth.User` - and this Postgres database already has. Before
running `migrate` on this deploy, drop and recreate the database (safe: no
real account data exists in prod yet):

```bash
sudo -u postgres psql -c "DROP DATABASE linguanodon;"
sudo -u postgres psql -c "CREATE DATABASE linguanodon OWNER linguanodon;"
```

### 6. Install and start gunicorn

```bash
sudo cp ~/linguanodon/deploy/gunicorn.service /etc/systemd/system/gunicorn.service
sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn
sudo systemctl status gunicorn   # should show "active (running)"
```

### 7. Configure nginx

```bash
sudo cp ~/linguanodon/deploy/nginx.conf /etc/nginx/sites-available/linguanodon
sudo sed -i 's/YOUR_DOMAIN/your-domain-or-ip/' /etc/nginx/sites-available/linguanodon
sudo ln -s /etc/nginx/sites-available/linguanodon /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

A bare IP works fine here — skip step 8 if you don't have a domain yet.

### 8. SSL (requires a real domain, not an IP)

If you're keeping the same domain that pointed at transparent-input, the
existing certificate covers the domain but not the new nginx server block's
content — just rerun certbot against it:

```bash
sudo certbot --nginx -d your-domain.com
```

Certbot edits the nginx config in place (adding the HTTPS server block and
redirect) and sets up auto-renewal.

---

## Ongoing operations

All commands below assume you are **SSH'd in as deploy**.

- **Logs**: `sudo journalctl -u gunicorn -f`
- **Django shell**: `cd ~/linguanodon && uv run python manage.py shell`
- **Postgres shell**: `sudo -u postgres psql linguanodon`
- **Deploy an update**:
  ```bash
  set -a && source /etc/linguanodon.env && set +a
  cd ~/linguanodon
  git pull
  uv sync --no-dev
  uv run python manage.py migrate
  uv run python manage.py migrate --database=tprboard
  uv run python manage.py migrate --database=comprehensible_input
  uv run python manage.py collectstatic --noinput
  sudo systemctl restart gunicorn
  ```
