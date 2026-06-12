# SvelteKit Starter

A production-ready SvelteKit template with user authentication, PostgreSQL, Docker, and a polished UI foundation. Clone it when starting a new project and customize from there.

## What's included

- **SvelteKit 2** with TypeScript and the Node adapter
- **Tailwind CSS 4** with light/dark theme support
- **Auth:** register, login, email verification, password reset, account management
- **PostgreSQL** schema for users and sessions
- **Docker Compose** for local and production deployment
- **Email** via SMTP (optional — links are logged to the console when SMTP is not configured)

## Quick start

### 1. Clone and install

```sh
git clone <your-repo-url> my-app
cd my-app
npm install
```

### 2. Configure environment

```sh
cp .env.example .env
```

Set at minimum:

- `DATABASE_URL` — PostgreSQL connection string (for local dev outside Docker)
- `SESSION_SECRET` — a long random string
- `ORIGIN` — your app URL (e.g. `http://localhost:5173` for dev)

### 3. Run with Docker (recommended)

```sh
docker compose up -d --build
```

The app is available at [http://localhost:3001](http://localhost:3001).

### 4. Run locally (without Docker)

Start PostgreSQL and apply the schema:

```sh
psql $DATABASE_URL -f db/schema.sql
```

Then start the dev server:

```sh
npm run dev
```

## Customize for your project

1. **App name** — edit `APP_NAME` in `src/lib/app.ts`
2. **Package name** — update `name` in `package.json`
3. **Favicon** — replace `src/lib/assets/favicon.svg`
4. **Database** — extend `db/schema.sql` with your tables
5. **Routes** — add pages under `src/routes/dashboard/` or elsewhere
6. **Deploy** — see `deploy/DEPLOY.md` and update `deploy/nginx/app.conf` with your domain

## Project structure

```
src/
  lib/
    app.ts              # App name and storage keys
    components/         # Reusable UI (AuthCard, ThemeToggle, etc.)
    sections/           # Layout (Navbar, Footer)
    server/             # Server-only code (auth, db, mail)
    stores/             # Client stores (auth, theme)
  routes/
    api/auth/           # Auth API endpoints
    dashboard/          # Protected pages
    login, register/    # Public auth pages
db/
  schema.sql            # PostgreSQL schema
deploy/                 # VPS deployment notes and nginx config
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check with svelte-check |

## Deployment

See [deploy/DEPLOY.md](deploy/DEPLOY.md) for VPS deployment with Docker, Nginx, and Let's Encrypt.

A GitHub Actions workflow template is in [workflows/deploy.yml](workflows/deploy.yml).

## License

Use freely for your own projects.
