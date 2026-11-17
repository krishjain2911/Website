# RHSP Careers, Admin & Telemetry Deployment Guide

This document describes the production deployment architecture for the RHSP website on a Hostinger Debian VPS running Nginx and Node.js.

---

## 1. Architecture Overview

The site runs as an Astro application using `@astrojs/node` in standalone mode with on-demand server-side rendering (SSR) for specific routes:
- **Static Pages (Prerendered)**: All primary landing, solution, about, pegboard, and error pages are built statically during compilation (`dist/client/`). Nginx serves these directly from disk with maximum HTTP caching performance.
- **Dynamic Server Routes (`prerender = false`)**:
  - `/careers` and `/careers/[slug]`: Dynamically queries the SQLite database for live published roles so new postings, updates, or closures reflect immediately without rebuilding or redeploying.
  - `/admin`, `/admin/login`, `/admin/logout`: Password-authenticated console for managing postings and reviewing telemetry.
  - `/api/track`: First-party telemetry ingestion endpoint.
  - `/api/admin/*`: Protected management endpoints.

---

## 2. Environment Variables

Configure the following environment variables in your server configuration or systemd service file:

| Variable | Description | Default |
|---|---|---|
| `DATA_DIR` | Absolute filesystem directory where SQLite database file (`rhsp.db`) is stored. | `./data` |
| `CAREERS_EMAIL` | Target mailbox for open candidate applications and inquiries. | `letstalk@rhsp.solutions` |
| `NODE_ENV` | Runtime environment mode (`production` or `development`). | `production` |
| `HOST` | Loopback address for Node standalone server. | `127.0.0.1` |
| `PORT` | Local port for Node standalone server. | `4321` |

---

## 3. SQLite Database & Storage

The application uses `better-sqlite3` configured with **WAL (Write-Ahead Logging)** mode for high-concurrency read/write operations without table locking.
- Database path: `${DATA_DIR || './data'}/rhsp.db`.
- Automatic Migration: Idempotent table schemas (`jobs`, `events`, `sessions`, `login_attempts`, `track_rate_limits`) and performance indices are established automatically on application startup.
- Data Retention: `/api/track` automatically prunes telemetry events older than 13 months.

### Database Backup Procedure
Because WAL mode allows readers while writing, perform atomic backups using SQLite's online backup API or CLI tool:

```bash
# 1. Hot atomic backup to a timestamped archive
sqlite3 /var/lib/rhsp-data/rhsp.db ".backup '/var/backups/rhsp/rhsp-$(date +%F_%H%M%S).db'"

# 2. Compress the backup
gzip /var/backups/rhsp/rhsp-$(date +%F_%H%M%S).db

# 3. Automated Cron Job (Daily at 03:00 UTC)
# Add to /etc/crontab:
# 0 3 * * * www-data sqlite3 /var/lib/rhsp-data/rhsp.db ".backup '/var/backups/rhsp/rhsp-$(date +\%F).db'" && gzip -f /var/backups/rhsp/rhsp-$(date +\%F).db
```

---

## 4. Systemd Service Setup

A sample systemd service file is provided at `deploy/rhsp.service`.

1. Create application and data directories:
   ```bash
   sudo mkdir -p /var/www/rhsp
   sudo mkdir -p /var/lib/rhsp-data
   sudo mkdir -p /var/backups/rhsp
   sudo chown -R www-data:www-data /var/lib/rhsp-data /var/backups/rhsp
   ```

2. Copy the unit file to systemd:
   ```bash
   sudo cp deploy/rhsp.service /etc/systemd/system/rhsp.service
   sudo systemctl daemon-reload
   sudo systemctl enable rhsp
   sudo systemctl start rhsp
   ```

3. Check service health:
   ```bash
   sudo systemctl status rhsp
   sudo journalctl -u rhsp -f
   ```

---

## 5. Nginx Reverse Proxy Configuration

A sample configuration is provided in `deploy/nginx-rhsp.conf`.

1. Copy or integrate the location blocks into `/etc/nginx/sites-available/roundholesquarepeg.com`:
   - Static pre-rendered pages are served from `/var/www/rhsp/dist/client/`.
   - `/careers`, `/admin`, and `/api` requests are proxied via upstream `rhsp_node_backend` to `127.0.0.1:4321`.
2. Test Nginx syntax and reload:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 6. Build and Deployment Pipeline

```bash
# 1. Pull latest code
cd /var/www/rhsp
git pull origin main

# 2. Install production dependencies
npm ci

# 3. Build Astro standalone bundle
npm run build

# 4. Restart Node daemon
sudo systemctl restart rhsp
```
