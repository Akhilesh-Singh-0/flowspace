<div align="center">

<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="60" rx="12" fill="#1D9E75"/>
  <rect x="12" y="18" width="16" height="4" rx="2" fill="white"/>
  <rect x="12" y="26" width="24" height="4" rx="2" fill="white"/>
  <rect x="12" y="34" width="20" height="4" rx="2" fill="white"/>
  <circle cx="44" cy="38" r="8" fill="#0F6E56"/>
  <rect x="41" y="36" width="6" height="2" rx="1" fill="white"/>
  <rect x="43" y="34" width="2" height="6" rx="1" fill="white"/>
</svg>

# FlowSpace

### A project management backend — workspaces, roles, real-time updates, background jobs.

![Status](https://img.shields.io/badge/status-building%20in%20public-1D9E75?style=flat-square)
![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20TypeScript%20%7C%20PostgreSQL-3C3489?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

</div>

---

## What is FlowSpace?

FlowSpace is a **project management platform** — workspaces, roles, projects, tasks, real-time updates, and background notifications. Every layer is hand-crafted. Every decision is intentional.

- **Multi-tenant workspaces** — users belong to multiple workspaces with different roles
- **Role-based access control** — OWNER, ADMIN, MEMBER, VIEWER enforced at the service layer
- **Real-time updates** — task changes pushed live via WebSockets + Redis Pub/Sub
- **Background jobs** — notifications processed asynchronously via BullMQ
- **Auth** — Clerk JWT on every protected route, users auto-synced via webhook

---

## Monorepo Structure

    flowspace/
    ├── apps/
    │   ├── api/          ← Node.js + Express backend
    │   └── web/          ← Frontend (coming soon)
    ├── packages/         ← Shared packages
    ├── docker-compose.yml
    └── turbo.json

---

## Architecture

    ┌─────────────────────────────────────────────────────────┐
    │                        Client                           │
    └────────────────────────┬────────────────────────────────┘
                             │ HTTP / WebSocket
    ┌────────────────────────▼────────────────────────────────┐
    │                    API Server                           │
    │                                                         │
    │  Route Layer        → express router, input validation  │
    │  Controller Layer   → request/response handling         │
    │  Service Layer      → business logic + RBAC checks      │
    │  Repository Layer   → Prisma ORM + PostgreSQL           │
    └──────────┬──────────────────────┬───────────────────────┘
               │                      │
    ┌──────────▼──────┐    ┌──────────▼──────────────────────┐
    │   PostgreSQL    │    │         Redis                   │
    │                 │    │                                 │
    │  Users          │    │  Pub/Sub (real-time events)     │
    │  Workspaces     │    │  BullMQ queues (notifications)  │
    │  Members        │    │                                 │
    │  Projects       │    └─────────────────────────────────┘
    │  Tasks          │
    │  Comments       │
    │  Labels         │
    └─────────────────┘
            ▲
            │ JWT verification
    ┌───────┴─────────┐
    │      Clerk      │
    │   (Auth + User  │
    │    webhook)     │
    └─────────────────┘

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Clerk |
| Cache / Pub-Sub | Redis |
| Job Queue | BullMQ |
| Real-time | WebSockets |
| Monorepo | Turborepo |
| Local Infra | Docker |
| Validation | Zod |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- A [Clerk](https://clerk.com) account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/Akhilesh-Singh-0/flowspace.git
cd flowspace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in your `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flowspace"
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
REDIS_URL="redis://localhost:6379"
PORT=3000
```

### 4. Start local infrastructure

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### 6. Start the dev server

```bash
cd ../..
npm run dev
```

API runs at `http://localhost:3000`
Health check at `http://localhost:3000/health`

---

## Documentation

- [Getting Started Guide](docs/guides/getting-started.md) — local setup walkthrough
- [API Development Guide](docs/guides/api-development.md) — how to add new endpoints
- [Deployment Guide](docs/guides/deployment.md) — production deployment instructions
- [Contributing Guide](docs/guides/contributing.md) — coding standards and workflow
- [API Reference](docs/api/README.md) — all 21 endpoints, auth, and error codes
- [Architecture Diagrams](docs/architecture/) — MVC flow, ER diagram, endpoint map
- [Backend README](./apps/api/README.md) — backend-specific notes

---

## Configuration

All runtime configuration for the API lives in `apps/api/.env`. Create it from the template:

```bash
cp apps/api/.env.example apps/api/.env
```

Then fill in values for the following variables:

| Variable | Purpose | Where to get it |
|---|---|---|
| `NODE_ENV` | Runtime mode (`development` / `production` / `test`) | Set locally |
| `PORT` | HTTP port the API binds to | Defaults to `4000` |
| `DATABASE_URL` | PostgreSQL connection string | Matches `postgres` service in `docker-compose.yml` |
| `REDIS_URL` | Redis connection string (pub/sub + BullMQ) | Matches `redis` service in `docker-compose.yml` |
| `CLERK_SECRET_KEY` | Clerk backend secret (verifies JWTs) | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| `CLERK_PUBLISHABLE_KEY` | Clerk frontend publishable key | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| `CLERK_WEBHOOK_SECRET` | Svix signing secret for `POST /auth/webhook` | Clerk Dashboard → Webhooks → Endpoint signing secret |

**Infrastructure tips:**
- **Postgres** — the included `docker-compose.yml` starts Postgres 15 with `user=postgres`, `password=postgres`, `db=flowspace` on port `5432`. Start it with `docker-compose up -d`.
- **Redis** — the same `docker-compose.yml` exposes Redis on port `6379`. No auth in local dev.
- **Clerk** — create a free Clerk application, then copy the test keys (`sk_test_*` / `pk_test_*`). Never commit live keys.

After editing `.env`, run migrations once with `cd apps/api && npx prisma migrate dev`.

---

## Building in Public

Follow the journey on Twitter/X: [@singh_akhil2272](https://twitter.com/singh_akhil2272)

If you're hiring for backend roles or internships — DM is open.

---

## License

MIT — do whatever you want with it.

---

<div align="center">
  <sub>If this project helped you or you find it interesting — a ⭐ means a lot.</sub>
</div>