<div align="center">

<svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#818cf8"/>
      <stop offset="100%" stopColor="#6366f1"/>
    </linearGradient>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#6366f1"/>
      <stop offset="100%" stopColor="#4f46e5"/>
    </linearGradient>
    <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#4f46e5"/>
      <stop offset="100%" stopColor="#3730a3"/>
    </linearGradient>
  </defs>
  <rect x="6" y="4" width="20" height="7" rx="2.5" fill="url(#g1)" opacity="0.95"/>
  <rect x="3" y="13" width="20" height="7" rx="2.5" fill="url(#g2)" opacity="0.90"/>
  <rect x="8" y="22" width="18" height="6" rx="2.5" fill="url(#g3)" opacity="0.85"/>
  <circle cx="26" cy="7.5" r="1.5" fill="#a5b4fc" opacity="0.9"/>
  <circle cx="23" cy="16.5" r="1.5" fill="#818cf8" opacity="0.9"/>
  <circle cx="26" cy="25" r="1.5" fill="#6366f1" opacity="0.9"/>
  <line x1="26" y1="9" x2="23" y2="15" stroke="#818cf8" stroke-width="1" stroke-dasharray="2 2" opacity="0.5"/>
  <line x1="23" y1="18" x2="26" y2="23.5" stroke="#6366f1" stroke-width="1" stroke-dasharray="2 2" opacity="0.5"/>
</svg>

<h1>FlowSpace</h1>

<p>project management platform — built from scratch</p>

<p><em>A full-stack project management platform built to understand how real-time, multi-tenant, role-based systems work at the engineering level.</em></p>

<p>
  <img src="https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white" alt="Clerk"/>
</p>


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

```
flowspace/
├── apps/
│   ├── api/          ← Node.js + Express backend
│   └── web/          ← Next.js 14 frontend
├── packages/         ← Shared packages
├── docker-compose.yml
└── turbo.json
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js Frontend                    │
│          TanStack Query · Clerk · WebSocket             │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼────────────────────────────────┐
│                    Express API Server                   │
│                                                         │
│  Route Layer        → input validation (Zod)            │
│  Controller Layer   → request/response handling         │
│  Service Layer      → business logic + RBAC             │
│  Repository Layer   → Prisma ORM + PostgreSQL           │
└──────────┬──────────────────────┬───────────────────────┘
           │                      │
┌──────────▼──────┐    ┌──────────▼──────────────────────┐
│   PostgreSQL    │    │            Redis                 │
│                 │    │                                  │
│  Users          │    │  Pub/Sub (real-time events)      │
│  Workspaces     │    │  BullMQ queues (notifications)   │
│  Members        │    │                                  │
│  Projects       │    └──────────────────────────────────┘
│  Tasks          │
│  Comments       │
│  Labels         │
└─────────────────┘
        ▲
        │ JWT verification
┌───────┴─────────┐
│      Clerk      │
│  Auth + Webhook │
└─────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Language | TypeScript (strict, both apps) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | Clerk |
| Cache / Pub-Sub | Redis |
| Job Queue | BullMQ |
| Real-time | Native WebSockets |
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
cp apps/web/.env.example apps/web/.env.local
```

**`apps/api/.env`**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flowspace"
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
REDIS_URL="redis://localhost:6379"
PORT=3000
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/workspaces
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/workspaces
NEXT_PUBLIC_API_URL=http://localhost:3000
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

### 6. Start both apps

```bash
cd ../..
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| API Health | http://localhost:3000/health |
| API Docs | http://localhost:3000/api-docs |

---

## Deployed

| | URL |
|---|---|
| Frontend | [your-frontend-url.com](https://your-frontend-url.com) |
| Backend API | [your-backend-url.com](https://your-backend-url.com) |
| API Docs | [your-backend-url.com/api-docs](https://your-backend-url.com/api-docs) |

---

## Documentation

- [Frontend README](./apps/web/README.md) — UI architecture, design system, component structure
- [Backend README](./apps/api/README.md) — API reference, RBAC, architecture decisions

---

## Why I Built This

I wanted to know what it actually takes to build a collaborative tool that works the way the good ones do.

Not the surface level — the parts underneath. What happens when two admins modify the same resource at the same time? How do you push a task update to every connected client without blocking the request that triggered it? What stops the last workspace owner from accidentally locking everyone out?

These problems don't show up in tutorials. They show up when you try to build something real and start asking why things break.

So I built FlowSpace to work through them. The backend uses Redis Pub/Sub to decouple real-time event emission from socket management. The frontend updates its cache directly on mutations instead of refetching. Workspace creation is a single atomic transaction so there's never an orphaned record without an owner.

None of it is clever for the sake of it. It's just what the problem required.

---

## Building in Public

Follow the journey on Twitter/X: [@singh_akhil2272](https://twitter.com/singh_akhil2272)

If you're hiring for frontend or backend roles — DM is open.

---

## License

MIT — do whatever you want with it.

---

<div align="center">
  <sub>If this project helped you or you find it interesting — a ⭐ means a lot.</sub>
</div>