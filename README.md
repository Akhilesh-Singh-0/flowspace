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

- [Backend API Documentation](./apps/api/README.md)
- Frontend Documentation — coming soon

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