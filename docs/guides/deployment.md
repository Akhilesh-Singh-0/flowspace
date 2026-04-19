# Deployment Guide

This guide covers promoting **flowspace** from local development to a production environment. flowspace is a monorepo orchestrated by Turborepo; the deployable artifact is the compiled `apps/api` package plus its production dependencies.

**Project:** flowspace
**Artifact:** Node.js 18+ Express API (`apps/api/dist/server.js`)
**Build Tool:** Turborepo 2.8.20 (pipeline in `turbo.json`)
**Package Manager:** npm 10.8.3 (declared in the root `package.json` as `"packageManager": "npm@10.8.3"`)
**Database:** PostgreSQL 15 (Prisma migrations)
**Cache / Jobs:** Redis (BullMQ)

---

## 1. Pre-Flight Checklist

Before deploying, run the full quality gate locally:

```bash
npm test             # Vitest across every workspace
npm run build        # Turborepo builds apps/api -> apps/api/dist
```

The build compiles TypeScript (`tsc`) into `apps/api/dist/`. Verify the output boots locally and confirm Winston logs `FlowSpace API running` and `WebSocket server started` within a few seconds:

```bash
node apps/api/dist/server.js
```

If any of these fail, stop — do not deploy a broken build.

---

## 2. Environment Variables

Every environment must provide the following keys (validated by Zod at boot):

| Key | Example | Description |
|---|---|---|
| `NODE_ENV` | `production` | Must be `production` outside dev/test |
| `PORT` | `3000` | Port the Express server binds to |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/flowspace?connection_limit=10` | PostgreSQL 15 connection string |
| `REDIS_URL` | `rediss://:pass@host:6379` | Redis connection string (use `rediss://` for TLS) |
| `CLERK_SECRET_KEY` | `sk_live_...` | Clerk **production** Secret Key (not test) |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Clerk **production** Publishable Key |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` | Svix signing secret for `POST /auth/webhook` |

Full list (for copy/paste into your platform's UI): `NODE_ENV, PORT, DATABASE_URL, REDIS_URL, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, CLERK_WEBHOOK_SECRET`.

> **Important:** the Clerk keys must be **production** keys from your Clerk production instance. Using `sk_test_*` in production will reject real user JWTs. Rotate `CLERK_WEBHOOK_SECRET` whenever you rotate the webhook endpoint in Clerk.

> **Warning — never deploy with `NODE_ENV=development`.** `authMiddleware` short-circuits Clerk verification in development mode (see `apps/api/src/middleware/requireAuth.ts` lines 17–20) and will treat every request as `userId=test-user-1`, granting unauthenticated access to every protected route. Always set `NODE_ENV=production` (or `test` for CI) on any deployed instance.

---

## 3. Database Migrations in Production

Run Prisma migrations as part of every release, **before** the new process starts serving traffic. Never run `prisma migrate dev` in production — it prompts interactively and can destabilize the schema.

```bash
cd apps/api
npx prisma migrate deploy
```

`migrate deploy` applies every pending migration non-interactively and is safe to run on every release (it is a no-op when nothing changed).

A typical CI deploy sequence:

```bash
npm ci
npm run build
npx --workspace @flowspace/api prisma migrate deploy
npm --workspace @flowspace/api run start    # node dist/server.js
```

---

## 4. Running the Node.js API Server

The production entrypoint is `apps/api/dist/server.js`. Use whatever process manager your platform provides:

```bash
# PM2
pm2 start apps/api/dist/server.js --name flowspace-api --env production

# systemd (via ExecStart=)
ExecStart=/usr/bin/node /srv/flowspace/apps/api/dist/server.js

# plain
NODE_ENV=production node apps/api/dist/server.js
```

The server listens on `PORT` (default `3000`). Handle `SIGTERM` for graceful shutdown — the process closes the HTTP server, drains BullMQ workers, and disconnects from Redis and Prisma before exiting.

---

## 5. Deploying on Heroku

Heroku reads `package.json` at the repo root. The default Node.js buildpack understands npm workspaces declared in the root `package.json`.

```bash
heroku login
heroku create flowspace-api
heroku addons:create heroku-postgresql:essential-0
heroku addons:create heroku-redis:mini
heroku config:set NODE_ENV=production \
  CLERK_SECRET_KEY=sk_live_... \
  CLERK_PUBLISHABLE_KEY=pk_live_... \
  CLERK_WEBHOOK_SECRET=whsec_...
```

(`DATABASE_URL` and `REDIS_URL` are injected automatically by the add-ons.)

Add a `Procfile` at the repo root:

```
release: npx --workspace @flowspace/api prisma migrate deploy
web: npm --workspace @flowspace/api start
```

The `release` phase runs `prisma migrate deploy` on every deploy, and `web` boots `node apps/api/dist/server.js`.

---

## 6. Deploying on DigitalOcean App Platform

Use Managed PostgreSQL 15 + Managed Redis cluster; inject connection strings via `DATABASE_URL` and `REDIS_URL`.

In the App Platform UI:

- **Source:** this Git repository, branch `main`
- **Build command:** `npm ci && npm run build`
- **Run command:** `npx --workspace @flowspace/api prisma migrate deploy && npm --workspace @flowspace/api start`
- **HTTP port:** `3000`
- **Environment variables (encrypted):** `NODE_ENV, DATABASE_URL, REDIS_URL, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, CLERK_WEBHOOK_SECRET`

Attach Managed PostgreSQL 15 and Managed Redis as components; App Platform injects the respective connection strings.

Point your domain (e.g. `flowspace.example.com`) at the app.

---

## 7. Deploying with Docker

A production Dockerfile for `apps/api`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api apps/api
COPY packages packages
RUN npm ci
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 3000
CMD ["node", "apps/api/dist/server.js"]
```

Build and run:

```bash
docker build -t flowspace-api .
docker run -d \
  --name flowspace-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  -e CLERK_SECRET_KEY=sk_live_... \
  -e CLERK_PUBLISHABLE_KEY=pk_live_... \
  -e CLERK_WEBHOOK_SECRET=whsec_... \
  flowspace-api
```

For a self-contained stack, pair with a `postgres:15` service (env: `POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres, POSTGRES_DB=flowspace`; port `5432`; volume `postgres_data`) and a `redis:7-alpine` service (port `6379`; volume `redis_data:/data`) — exactly matching the repo's `docker-compose.yml`.

---

## 8. Redis and PostgreSQL Requirements

- **PostgreSQL 15+** — Prisma targets the `postgresql` provider. The 8 models + migrations require at least v13, but 15 is the version we develop against.
- **Redis 7+** — used for both Pub/Sub (real-time WebSocket fan-out) and BullMQ (notification queue). The repo's `docker-compose.yml` uses `redis:7-alpine`. A single Redis instance is fine; use the same `REDIS_URL` for both.

Prisma manages its own connection pool. Tune via `?connection_limit=` on `DATABASE_URL` (e.g. `?connection_limit=10` for a mid-sized container).

---

## 9. Database Backups

Use managed Postgres automated backups (Heroku PG, DO Managed DB) wherever possible. For self-hosted deployments, run `pg_dump` on a schedule:

```bash
pg_dump "$DATABASE_URL" | gzip > flowspace-$(date +%Y%m%d).sql.gz
```

Restoring:

```bash
gunzip -c flowspace-20260418.sql.gz | psql "$DATABASE_URL"
```

---

## 10. Observability

**Logs** — Winston logs (`@/lib/logger`) ship to stdout as structured JSON. Aggregate with your platform's log drain (Datadog, Papertrail, DO Logs, etc.):

```bash
heroku logs --tail -a flowspace        # Heroku
docker logs -f flowspace-api           # Docker
```

**Error tracking** — not yet configured. Recommended: add Sentry in `server.ts` and wire it into the `errorHandler` middleware.

**Log aggregation** — all logs are emitted via Winston to stdout as structured JSON; forward via platform log drains.

---

## 11. CI/CD Reference Script

A minimal GitHub Actions `deploy` step:

```yaml
- run: npm ci
- run: npm run build
- run: npx --workspace @flowspace/api prisma migrate deploy
- run: npm --workspace @flowspace/api run start
  env:
    NODE_ENV: production
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    REDIS_URL: ${{ secrets.REDIS_URL }}
    CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
    CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_PUBLISHABLE_KEY }}
    CLERK_WEBHOOK_SECRET: ${{ secrets.CLERK_WEBHOOK_SECRET }}
```

---

## 12. Post-Deploy Smoke Tests

There is no dedicated health endpoint (`/health` is not implemented). Instead, confirm the server is reachable and that authenticated traffic works:

```bash
curl -I https://flowspace.example.com/
# Expect: HTTP/1.1 404 Not Found — the server has no root route, but must respond.
# If you get a connection error, the app has not started. Confirm via platform logs.

curl -H "Authorization: Bearer $CLERK_JWT" https://flowspace.example.com/workspaces
# Expect: 200 OK with { "success": true, "data": [...] }

curl -X POST -H "svix-id: ..." -H "svix-timestamp: ..." -H "svix-signature: ..." \
  --data @clerk-webhook-sample.json https://flowspace.example.com/auth/webhook
# Expect: 200 OK when the signature matches CLERK_WEBHOOK_SECRET
```

Also check:

- Production logs via your platform — confirm the Winston `FlowSpace API running` and `WebSocket server started` lines appeared
- WebSocket upgrade (`wscat -c wss://flowspace.example.com`)
- BullMQ queue depth (`notification` queue should be 0 at idle)
- Prisma migration status (`npx prisma migrate status` against production `DATABASE_URL`)

---

## 13. Rollback

1. Redeploy the previous Git tag via your platform.
2. **Do not** run `prisma migrate resolve --rolled-back` unless you understand the consequences — prefer forward-fix migrations.
3. If a migration corrupted data, restore from the last backup (see §9) before redeploying.

---
