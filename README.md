# MemLyra

A free flashcard study platform. Practice without an account, or sign up to sync your library, track progress, and share decks on the community marketplace.

**Live site:** [memlyra.com](https://memlyra.com)

## Features

- **Guest practice** (`/try`) — library, exercises, and marketplace browsing with data stored in the browser; no sign-up required
- **Flashcard library** — decks, tags, import/export, and organization tools
- **Exercise engine** — filter by deck or tags; modes include typing, multiple choice, self-grade, and Anki-style review; bidirectional practice
- **Progress tracking** — stars, learned/mastered/both-ways states, achievements, and streaks
- **Marketplace** — publish decks, browse community content, rate listings, and import into your library
- **SEO** — public marketplace pages with slugs, sitemap, robots.txt, and structured data
- **Auth** — register, email verification, password reset, and account management
- **Guest migration** — guest data can be imported when creating an account

## Tech stack

- **SvelteKit 2** with Svelte 5, TypeScript, and the Node adapter
- **Tailwind CSS 4** with light/dark theme support
- **PostgreSQL 16** via the `postgres` driver
- **Docker Compose** for local database and production deployment
- **Email** via SMTP (optional — verification links are logged to the console when SMTP is not configured)

## Quick start

### 1. Clone and install

```sh
git clone <your-repo-url> MemLyra
cd MemLyra
npm install
```

### 2. Configure environment

```sh
cp .env.example .env
```

Set at minimum:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Long random string for session cookies |
| `ORIGIN` | App URL (e.g. `http://localhost:5173` for dev) |
| `POSTGRES_PASSWORD` | Used by Docker Compose for the database container |

SMTP variables are optional for local development.

### 3. Start the database

```sh
npm run dev:db
# or: docker compose up -d db
```

On first start, `db/schema.sql` is applied automatically to a fresh Postgres volume.

### 4. Run the dev server

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

A dev admin account is seeded automatically when `NODE_ENV` is not `production`:

- **Email:** `admin` (short form) or `admin@local`
- **Password:** `admin`

### 5. Run with Docker (app + database)

```sh
docker compose up -d --build
```

The app is available at [http://localhost:3001](http://localhost:3001).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:db` | Start PostgreSQL via Docker Compose |
| `npm run db:migrate` | Apply any pending database migrations manually |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check with svelte-check |

## Project structure

```
src/
  lib/
    app.ts              # App name, tagline, storage keys
    components/         # UI (exercise, library, marketplace, auth, …)
    sections/           # Layout (Navbar, Footer)
    server/             # Auth, DB, flashcards, marketplace, mail, migrations
    stores/             # Client stores (auth, flashcards, decks, tags, marketplace)
    utils/              # Exercise logic, SEO, slugs, achievements, guest storage
  routes/
    api/                # REST endpoints (auth, flashcards, decks, tags, marketplace)
    dashboard/          # Protected app (exercise, library, progress, marketplace, account)
    try/                # Guest practice (no account)
    marketplace/        # Public marketplace browse and deck detail pages
    login, register/    # Auth pages
db/
  schema.sql            # Full schema for fresh installs
  migrations/           # Incremental migrations for existing databases
deploy/                 # VPS deployment notes and Nginx config
scripts/
  db-migrate.mjs        # Manual migration helper
```

## Routes overview

| Path | Access | Purpose |
|------|--------|---------|
| `/` | Public | Landing page |
| `/try/*` | Guest | Practice without an account |
| `/marketplace` | Public | Browse community decks |
| `/marketplace/[slug]` | Public | Deck detail (SEO-friendly) |
| `/dashboard/*` | Authenticated | Full app |
| `/login`, `/register` | Public | Auth flows |

## Database migrations

Fresh Docker volumes load `db/schema.sql` automatically and record all migrations as applied. Existing databases pick up any pending files from `db/migrations/` on app startup (or via `npm run db:migrate`).

Migrations are schema-only — they never copy data between environments. Your local database and production database stay independent.

| File | Purpose |
|------|---------|
| `001_flashcard_library.sql` | Decks, tags, flashcards |
| `002_marketplace.sql` | Marketplace tables |
| `003_marketplace_ratings.sql` | Deck ratings |
| `004_marketplace_slug.sql` | SEO slugs |
| `005_rate_limits_and_rating_stats.sql` | Postgres rate limits, denormalized rating stats |

See [deploy/DEPLOY.md](deploy/DEPLOY.md) for production notes.

## Deployment

Production runs on a VPS with Docker Compose, Nginx, and Let's Encrypt. Deploy manually on the server:

```bash
cd ~/MemLyra
git pull
docker compose up -d --build
```

Pending database migrations run automatically when the app starts. Full instructions: **[deploy/DEPLOY.md](deploy/DEPLOY.md)**

Nginx config template: `deploy/nginx/memlyra.conf`

## Environment variables

See [.env.example](.env.example) for all supported variables. Production requires `ORIGIN`, `SESSION_SECRET`, `POSTGRES_PASSWORD`, and SMTP settings for email verification to work reliably.

## License

Use freely for your own projects.
