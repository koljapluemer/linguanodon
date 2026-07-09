# Deploying to the VPS

Django + gunicorn behind nginx, Postgres on the same box, running on a
DigitalOcean droplet (Ubuntu 24.04 LTS). No CI/CD — deploys are a manual
`git pull` over SSH. Droplet-level daily backups are enabled in the
DigitalOcean control panel (Droplet → Backups) — that's the disaster-recovery
story; nothing further to set up for that here.

Config files: `deploy/gunicorn.service`, `deploy/nginx.conf`.

---

## Part 1 — One-time: fresh droplet setup

Skip this section entirely if you're reusing an already-hardened droplet
(e.g. the one this app took over from `transparent-input` — see Part 2).
Only needed the first time you stand up a new droplet from scratch.

### 1. Create the droplet

Ubuntu 24.04 LTS, smallest size that fits the workload comfortably (this app
is Django + SQLite content files + one small Postgres DB — a 1 GB droplet is
plenty to start). Enable **Backups** and the **Monitoring** agent at
creation time (both free, both in the control panel) — no reason not to.

### 2. Non-root user + SSH hardening

Log in as root the first time, then:

```bash
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

(or manually copy your public key into `/home/deploy/.ssh/authorized_keys`).

Then, **before disabling password auth**, open a *second* terminal and
confirm you can SSH in as `deploy` with your key. Once confirmed, harden SSH.
On 24.04, drop overrides in `/etc/ssh/sshd_config.d/` rather than editing the
main file (it survives package upgrades):

```bash
sudo tee /etc/ssh/sshd_config.d/99-hardening.conf <<'EOF'
PermitRootLogin no
PasswordAuthentication no
EOF
sudo sshd -t   # validate syntax BEFORE reloading, or you can lock yourself out
sudo systemctl reload ssh
```

Keep the DigitalOcean web console (Droplet → Access → Console) in your back
pocket in case you do lock yourself out.

### 3. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

Optionally mirror the same rules in DigitalOcean's Cloud Firewall
(Networking → Firewalls) for defense in depth — redundant for a single
droplet but zero cost.

### 4. fail2ban + unattended-upgrades

```bash
sudo apt update
sudo apt install -y fail2ban unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades   # answer "Yes"
```

### 5. Swap

Droplets ship with no swap. Add some so an out-of-memory spike doesn't just
kill the process:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

### 6. Install system packages

```bash
sudo apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Part 2 — One-time: retire transparent-input

Only relevant if this droplet previously ran `transparent-input` (the app
`linguanodon` replaced). Skip on a fresh droplet.

SSH in as `deploy` (the user and its sudo/systemctl rights already exist
from the old setup):

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
repo) or generate a fresh one; instructions for both are in Part 3, step 2.

nginx, Postgres and `uv` are already installed from the old setup, so Part 1
step 6 is a no-op here.

---

## Part 3 — One-time: set up linguanodon

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

If reusing an old keypair, print the existing public key:

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
ALLOWED_HOSTS=linguanodon.com,www.linguanodon.com
DEBUG=false
SSL_ENABLED=false
```

Leave `SSL_ENABLED=false` for now — flip it to `true` after step 8 (SSL)
below. Turning it on before nginx has a real certificate breaks all HTTP
access (Django will redirect every request to an HTTPS that doesn't exist
yet).

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
uv run python manage.py migrate --database=arabicnumbers
uv run python manage.py migrate --database=prepositions3d
uv run python manage.py migrate --database=saetze
uv run python manage.py migrate --database=egyptiansentences
uv run python manage.py migrate --database=infinitesentences
uv run python manage.py collectstatic --noinput
uv run python manage.py createsuperuser
```

All the app-specific `.sqlite3` files (`tprboard`, `comprehensible_input`,
`arabicnumbers`, `prepositions3d`, `saetze`, `egyptiansentences`,
`infinitesentences`) are committed directly to the repo and arrive
populated via `git pull` — the `migrate --database=X` steps above only do
something the first time a migration ships for that app; otherwise they're
no-ops. This includes `comprehensible_input.sqlite3`: despite holding
admin-entered video/language data, it's tracked in git like the others (data
gets added locally through the admin UI and committed same as any other
change), so it doesn't need special-casing or a separate backup step.

After `createsuperuser`, the account it creates has `is_staff`/`is_superuser`
but its app-level `role` still defaults to `NEW` - to let it manage
comprehensible-input videos, open `/admin/`, edit the user, and set `role`
to `Admin`.

**One-time note (first deploy after `accounts` was added):** this introduces
a custom `AUTH_USER_MODEL` (`accounts.User`). Django does not support
switching `AUTH_USER_MODEL` after `migrate` has already run against the
built-in `auth.User`. If this Postgres database previously ran migrations
under the default user model, drop and recreate it first (safe if no real
account data exists yet):

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

`deploy/gunicorn.service` runs with systemd sandboxing on
(`ProtectSystem=strict`, `ProtectHome=true`, etc.) with an explicit
`ReadWritePaths` exception for the repo checkout, since gunicorn needs to
write to `comprehensible_input.sqlite3` and `staticfiles/`. If you ever move
the checkout out of `/home/deploy/linguanodon`, update `ReadWritePaths` (and
`WorkingDirectory`/`ExecStart`) to match.

### 7. Configure nginx

```bash
sudo cp ~/linguanodon/deploy/nginx.conf /etc/nginx/sites-available/linguanodon
sudo sed -i 's/YOUR_DOMAIN/linguanodon.com www.linguanodon.com/' /etc/nginx/sites-available/linguanodon
sudo ln -s /etc/nginx/sites-available/linguanodon /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

The domain is `linguanodon.com` — before step 8, point its DNS `A` record
(and `www`) at the droplet's IP if you haven't already; propagation can take
a few minutes to a few hours.

### 8. SSL

```bash
sudo certbot --nginx -d linguanodon.com -d www.linguanodon.com
```

Certbot edits the nginx config in place (adding the HTTPS server block and
redirect) and installs a systemd timer that checks twice daily and renews
anything within 30 days of expiry — no cron needed. Verify it actually works:

```bash
sudo certbot renew --dry-run
```

If reusing the domain that pointed at `transparent-input`, the existing
certificate covers the domain but not this nginx server block's content —
rerunning `certbot --nginx -d linguanodon.com -d www.linguanodon.com` as
above handles that.

Once the cert is live, turn on the HTTPS-only Django settings:

```bash
sudo nano /etc/linguanodon.env    # change SSL_ENABLED=false to SSL_ENABLED=true
sudo systemctl restart gunicorn
```

This flips `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`,
`CSRF_COOKIE_SECURE`, and HSTS all together (`config/settings.py`) — they're
gated behind one flag so they can't end up half-on. Sanity-check with:

```bash
uv run python manage.py check --deploy
```

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
  uv run python manage.py migrate --database=arabicnumbers
  uv run python manage.py migrate --database=prepositions3d
  uv run python manage.py migrate --database=saetze
  uv run python manage.py migrate --database=egyptiansentences
  uv run python manage.py migrate --database=infinitesentences
  uv run python manage.py collectstatic --noinput
  sudo systemctl restart gunicorn
  ```
