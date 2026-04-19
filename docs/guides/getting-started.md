# Getting Started with FlowSpace

Welcome to **flowspace** — a project management backend built with Express, TypeScript, PostgreSQL, Prisma, Clerk, BullMQ, and WebSockets. This guide walks you through every step required to get the API running on your machine in development mode.

**Project:** flowspace
**Stack:** Node.js 18+ / TypeScript / Express 5.2.1 / PostgreSQL 15 / Prisma 5.22.0 / Redis
**Monorepo:** Turborepo 2.8.20 orchestrating `apps/api` and `packages/types`

---

## 1. Prerequisites

Before cloning the repository, make sure the following tools are installed and available on your `PATH`:

| Tool | Minimum Version | Why |
|---|---|---|
| Node.js | 18+ | Runtime for Express and the Prisma client |
| npm | 10.8.3+ | Declared in the root `package.json` as `"packageManager": "npm@10.8.3"`; drives the npm workspaces declared in the same file |
| Docker + Docker Compose | Latest | Local PostgreSQL 15 and Redis services defined in `docker-compose.yml` |
| Git | Latest | Source control |
| A Clerk account | N/A | Auth provider (free tier is fine) — grab the Secret Key, Publishable Key, and Webhook Secret from your Clerk dashboard |

You can verify your installation:

```bash
node --version       # v18.x or newer
npm --version        # 10.8.3 or newer
docker --version     # 24.x+
docker compose version
```

---

## 2. Clone and Install

Clone the repository and install workspace dependencies from the repo root. npm resolves the `"workspaces": ["apps/*", "packages/*"]` block in the root `package.json` and installs every workspace in a single pass. Turborepo then orchestrates the `dev` / `build` / `test` pipelines across those workspaces:

```bash
git clone https://github.com/Akhilesh-Singh-0/flowspace.git
cd flowspace
npm install
```

This installs dependencies for **both** `apps/api` (Express backend) and `packages/types` (shared TypeScript types — currently a scaffolded empty package) in one pass.

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
| `PORT` | `3000` | HTTP port the Express server binds to. The code default (in `apps/api/src/config/env.ts`) is `3000`; `apps/api/.env.example` is also aligned to `3000`. |
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
- **redis** — `redis:7-alpine` image, listening on `localhost:6379`, with a named volume `redis_data` mapped to `/data`; used by BullMQ and the pub/sub layer that powers WebSockets

Verify the containers are healthy:

```bash
docker-compose ps
```

---

## 5. Generate the Prisma Client and Run Migrations

Prisma powers the data layer. You need to generate the client (typed DB accessors) and apply the 5 existing migrations:

```bash
cd apps/api
npm run db:generate     # runs `prisma generate`
npm run db:migrate      # runs `prisma migrate dev` — applies migrations + regenerates client
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
npm run db:studio
```

---

## 6. Start the Development Server

From the repo root, use Turborepo's dev pipeline (it runs every workspace's `dev` script in parallel):

```bash
cd ../..              # back to repo root
npm run dev
```

The Express server starts with `nodemon` + `ts-node` hot-reload and binds to:

- API base URL: `http://localhost:3000`
- WebSocket endpoint: `ws://localhost:3000` (upgrades from the same HTTP server)

The server logs `FlowSpace API running { port: 3000 }` via Winston when it is ready. There is no `/health` endpoint today.

You can also run just the API package if you want:

```bash
npm --workspace @flowspace/api run dev
```

---

## 6a. Development Mode Auth Short-Circuit

When `NODE_ENV=development`, `authMiddleware` (`apps/api/src/middleware/requireAuth.ts` lines 17–20) **bypasses Clerk JWT verification entirely** and injects `req.user = { userId: "test-user-1" }` on every request. That means:

- You do **not** need to obtain or send a real Clerk JWT while developing locally — every protected endpoint will accept requests without an `Authorization` header.
- Every request is treated as coming from the user whose internal `User.id` equals `test-user-1`. Seed that user into your local database if you need authenticated flows to work end-to-end.
- This bypass exists only to reduce friction during local development. **Never** deploy the API with `NODE_ENV=development`; in production the same middleware verifies a real Clerk JWT via `@clerk/backend`'s `verifyToken` and attaches `req.user = { userId: verified.sub }`.

If you need to exercise the real JWT path locally, temporarily set `NODE_ENV=production` in `apps/api/.env` (keep `CLERK_SECRET_KEY` configured) and send a valid Bearer token on every request.

---

## 7. Run the Tests

The project uses **Vitest 4.1.2** (not Jest). Tests run through the Turborepo pipeline:

```bash
npm test                                              # all workspaces
npm --workspace @flowspace/api run test               # API only
npx vitest                                            # watch mode, from apps/api
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
| `packages/types/` | Scaffolded workspace for shared TypeScript types. Currently empty (`src/index.ts` exports nothing yet); will hold shared types once the frontend is introduced. |
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

**Clerk JWT rejected with 401** — confirm `CLERK_SECRET_KEY` is a Secret Key (starts with `sk_`), not a Publishable Key (`pk_`). Also remember: with `NODE_ENV=development` the middleware never reaches the JWT path; flip to `NODE_ENV=production` locally if you want to exercise it.

**Webhook returns 400** — the `POST /auth/webhook` route requires the raw body. Make sure you haven't reordered `express.json()` and the webhook router in `apps/api/src/app.ts`.

**Port 3000 already in use** — change `PORT` in `apps/api/.env` or stop whatever is running on 3000.

---
