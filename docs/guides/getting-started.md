# Getting Started with FlowSpace

Welcome to **flowspace** — a project management backend built with Express, TypeScript, PostgreSQL, Prisma, Clerk, BullMQ, and WebSockets. This guide walks you through every step required to get the API running on your machine in development mode.

**Project:** flowspace
**Stack:** Node.js 18+ / TypeScript / Express 5.2.1 / PostgreSQL 15 / Prisma 5.22.0 / Redis
**Monorepo:** Turborepo 2.8.20 orchestrating `apps/api` and `packages/types`
**Generated:** 2026-04-18

---

## 1. Prerequisites

Before cloning the repository, make sure the following tools are installed and available on your `PATH`:

| Tool | Minimum Version | Why |
|---|---|---|
| Node.js | 18+ | Runtime for Express and the Prisma client |
| pnpm | 8+ (or npm 10.8.3) | Monorepo-aware package manager (pnpm preferred per Turborepo convention; npm works as well) |
| Docker + Docker Compose | Latest | Local PostgreSQL 15 and Redis services defined in `docker-compose.yml` |
| Git | Latest | Source control |
| A Clerk account | N/A | Auth provider (free tier is fine) — grab the Secret Key, Publishable Key, and Webhook Secret from your Clerk dashboard |

You can verify your installation:

```bash
node --version       # v18.x or newer
pnpm --version       # 8.x or newer (or use npm 10.8.3)
docker --version     # 24.x+
docker compose version
```

---

## 2. Clone and Install

Clone the repository and install workspace dependencies from the repo root. Turborepo will pick up every package in `apps/*` and `packages/*`:

```bash
git clone https://github.com/Akhilesh-Singh-0/flowspace.git
cd flowspace
pnpm install
```

> If you prefer npm: `npm install` works and uses the project's npm workspaces configuration. The Turborepo pipeline in `turbo.json` is package-manager agnostic.

This installs dependencies for **both** `apps/api` (Express backend) and `packages/types` (shared TypeScript types) in one pass.

---

## 3. Configure Environment Variables

The API reads its configuration from `apps/api/.env`. A template lives at `apps/api/.env.example`:

```bash
cp apps/api/.env.example apps/api/.env
```

Required keys (all validated by Zod in `apps/api/src/config/env.ts`):

| Key | Example | Description |
|---|---|---|
| `NODE_ENV` | `development` | Runtime mode; gates Prisma query logging and auth dev short-circuit |
| `PORT` | `3000` | HTTP port the Express server binds to |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/flowspace` | Matches the docker-compose Postgres service |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string for pub/sub and BullMQ queues |
| `CLERK_SECRET_KEY` | `sk_test_<YOUR_CLERK_SECRET_KEY>` | Clerk backend secret used to verify incoming JWTs |
| `CLERK_PUBLISHABLE_KEY` | `pk_test_<YOUR_CLERK_PUBLISHABLE_KEY>` | Clerk publishable key (for the future frontend package) |
| `CLERK_WEBHOOK_SECRET` | `whsec_<YOUR_CLERK_WEBHOOK_SECRET>` | Svix webhook secret used to verify `POST /auth/webhook` |

Obtain the three `CLERK_*` values from your Clerk dashboard. The `DATABASE_URL` and `REDIS_URL` defaults above match the `docker-compose.yml` services, so no changes are needed if you use Docker.

---

## 4. Start PostgreSQL and Redis

The repo ships with a `docker-compose.yml` at the root that boots both services with production-appropriate defaults:

```bash
docker-compose up -d
```

This starts:

- **postgres** — `postgres:15` image, listening on `localhost:5432`, with a named volume `postgres_data` for persistence
- **redis** — listening on `localhost:6379`, used by BullMQ and the pub/sub layer that powers WebSockets

Verify the containers are healthy:

```bash
docker-compose ps
```

---

## 5. Generate the Prisma Client and Run Migrations

Prisma powers the data layer. You need to generate the client (typed DB accessors) and apply the 5 existing migrations:

```bash
cd apps/api
pnpm db:generate     # runs `prisma generate`
pnpm db:migrate      # runs `prisma migrate dev` — applies migrations + regenerates client
```

Verify that migrations applied cleanly:

```bash
npx prisma migrate status
```

You should see the following migrations marked as applied:

- `init` (2026-04-04)
- `add_project_model` (2026-04-13)
- `add_task_model` (2026-04-13)
- `add_comment_model` (2026-04-16)
- `add_label_model` (2026-04-18)

Optional: open Prisma Studio to browse the database visually:

```bash
pnpm db:studio
```

---

## 6. Start the Development Server

From the repo root, use Turborepo's dev pipeline (it runs every package's `dev` script in parallel):

```bash
cd ../..              # back to repo root
pnpm dev
```

The Express server starts with `nodemon` + `ts-node` hot-reload and binds to:

- API base URL: `http://localhost:3000`
- Health check: `http://localhost:3000/health`
- WebSocket endpoint: `ws://localhost:3000` (upgrades from the same HTTP server)

You can also run just the API package if you want:

```bash
pnpm --filter @flowspace/api dev
```

---

## 7. Run the Tests

The project uses **Vitest 4.1.2** (not Jest). Tests run through the Turborepo pipeline:

```bash
pnpm test                              # all workspaces
pnpm --filter @flowspace/api test      # API only
npx vitest                             # watch mode, from apps/api
```

> Note: no test files exist in the repository yet. Contributors are strongly encouraged to seed the suite. See the [Contributing Guide](./contributing.md) for testing conventions.

---

## 8. Project Layout

The relevant directories once everything is running:

| Path | Purpose |
|---|---|
| `apps/api/src/server.ts` | HTTP + WebSocket bootstrap |
| `apps/api/src/app.ts` | Express app, middleware, route registration |
| `apps/api/src/modules/` | Feature modules (auth, workspaces, projects, tasks, comments, labels) |
| `apps/api/src/config/` | Environment + Prisma + Redis configuration |
| `apps/api/prisma/schema.prisma` | Database schema (8 models) |
| `packages/types/` | Shared TypeScript types used by API (and future frontend) |
| `docs/` | Project documentation (you're reading this!) |

---

## 9. Next Steps

- [API Documentation](../api/README.md) — all 21 endpoints with request/response shapes
- [API Development Guide](./api-development.md) — how to add a new endpoint in the layered architecture
- [Deployment Guide](./deployment.md) — taking flowspace to production
- [Contributing Guide](./contributing.md) — code conventions, commit format, PR flow

---

## Troubleshooting

**`prisma migrate dev` hangs or errors** — make sure `docker-compose up -d` completed and `DATABASE_URL` matches the compose service (port 5432, user `postgres`).

**Clerk JWT rejected with 401** — confirm `CLERK_SECRET_KEY` is a Secret Key (starts with `sk_`), not a Publishable Key (`pk_`).

**Webhook returns 400** — the `POST /auth/webhook` route requires the raw body. Make sure you haven't reordered `express.json()` and the webhook router in `apps/api/src/app.ts`.

**Port 3000 already in use** — change `PORT` in `apps/api/.env` or stop whatever is running on 3000.

---

**Document generated:** 2026-04-18
