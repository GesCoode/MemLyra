# MemLyra deployment (VPS)

## Stack

- **App:** Docker (`memlyra` on port 3001)
- **Database:** PostgreSQL 16 (`memlyra-db`, internal only)
- **Reverse proxy:** Nginx + Let's Encrypt
- **Public URL:** https://memlyra.com

## `.env` (on server, never commit)

```env
ORIGIN=https://memlyra.com
POSTGRES_PASSWORD=...
SESSION_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@gesmoo.com
SMTP_PASS=<google-app-password>
SMTP_FROM=MemLyra <noreply@gesmoo.com>
```

## Deploy updates

```bash
cd ~/MemLyra
git pull
docker compose up -d --build
```

### Run a database migration

```bash
docker exec -i memlyra-db psql -U memlyra -d memlyra < db/migrations/003_password_reset.sql
```

## Nginx

Config template: `deploy/nginx/memlyra.conf`

On the server:

```bash
sudo ln -sf /etc/nginx/sites-available/memlyra /etc/nginx/sites-enabled/memlyra
sudo nginx -t && sudo systemctl reload nginx
```

SSL (first time):

```bash
sudo certbot --nginx -d memlyra.com -d www.memlyra.com
```

## Cloudflare

- DNS: `memlyra.com` and `www` → server IP (proxied is fine)
- SSL/TLS mode: **Full (strict)** (origin has a valid Let's Encrypt cert)

## Delete a test account

```bash
docker exec -it memlyra-db psql -U memlyra -d memlyra \
  -c "DELETE FROM users WHERE email = 'you@example.com';"
```

## Auth email troubleshooting

Registration requires email verification before login. If users see errors or never receive mail:

1. Confirm all `SMTP_*` values are set in `.env` on the server.
2. Rebuild after changing env: `docker compose up -d --build`
3. Check app logs for SMTP errors or logged verification links:
   `docker logs memlyra --tail 100`
4. Manually verify an account:
   `docker exec -it memlyra-db psql -U memlyra -d memlyra -c "UPDATE users SET email_verified = TRUE WHERE email = 'you@example.com';"`
5. List accounts:
   `docker exec -it memlyra-db psql -U memlyra -d memlyra -c "SELECT email, name, email_verified, created_at FROM users ORDER BY created_at;"`
