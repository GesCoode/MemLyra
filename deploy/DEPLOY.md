# Deployment (VPS)

## Stack

- **App:** Docker (`app` on port 3001)
- **Database:** PostgreSQL 16 (`app-db`, internal only)
- **Reverse proxy:** Nginx + Let's Encrypt

## `.env` (on server, never commit)

Copy from `.env.example` and set production values:

```env
ORIGIN=https://example.com
POSTGRES_PASSWORD=...
SESSION_SECRET=...
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@example.com
SMTP_PASS=...
SMTP_FROM=My App <noreply@example.com>
```

## Deploy updates

```bash
cd ~/your-app
git pull
docker compose up -d --build
```

## Nginx

Config template: `deploy/nginx/app.conf`

On the server:

```bash
sudo ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app
sudo nginx -t && sudo systemctl reload nginx
```

SSL (first time):

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

## Delete a test account

```bash
docker exec -it app-db psql -U app -d app \
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
