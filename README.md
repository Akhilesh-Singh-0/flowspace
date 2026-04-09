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

### Production-grade project management API — built from scratch

> Think Linear or Jira, but every layer is hand-crafted to understand how these systems *actually* work under the hood.

![Status](https://img.shields.io/badge/status-building%20in%20public-1D9E75?style=flat-square)
![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20TypeScript%20%7C%20PostgreSQL-3C3489?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

</div>

---

## What is FlowSpace?

FlowSpace is a **project management platform** built from the ground up — workspaces, roles, projects, tasks, real-time updates, and background notifications. No shortcuts, no magic abstractions hiding how things work.

This is not a tutorial project. Every architectural decision is intentional:

- **4-layer REST API** — Route → Controller → Service → Repository
- **Role-based access control** — OWNER, ADMIN, MEMBER, VIEWER with enforced permissions at the service layer
- **Atomic operations** — workspace creation assigns roles in a single Prisma transaction
- **Real-time** — task updates pushed live via WebSockets + Redis Pub/Sub
- **Background jobs** — notifications processed asynchronously via BullMQ
- **Auth** — Clerk JWT middleware on every protected route, users auto-synced to PostgreSQL via webhook

---

## Architecture

```
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
└─────────────────┘
        ▲
        │ JWT verification
┌───────┴─────────┐
│      Clerk      │
│   (Auth + User  │
│    webhook)     │
└─────────────────┘
```

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

## What's Built So Far

### ✅ Core Infrastructure
- [x] Turborepo monorepo with `apps/api` and `packages/` structure
- [x] Docker Compose for local PostgreSQL + Redis
- [x] Global error handling middleware
- [x] Request ID tracing on every request
- [x] Zod validation on all incoming data

### ✅ Auth
- [x] `requireAuth` middleware — verifies Clerk JWT on every protected route
- [x] `POST /auth/webhook` — syncs new Clerk users to PostgreSQL automatically via Svix

### ✅ Workspaces
- [x] `POST /workspaces` — creates workspace + assigns OWNER role atomically (Prisma transaction)
- [x] `GET /workspaces` — returns all workspaces a user belongs to, with their role

---

## What's Coming Next

### 🔧 In Progress
- [ ] **RBAC** — full role-based permission checks at service layer for every action
- [ ] **Workspace Members API** — invite, list, remove with role-enforced permissions
  - OWNER can remove anyone
  - ADMIN can remove MEMBER and VIEWER only

### 📋 Roadmap
- [ ] Projects CRUD — create, list, update, delete projects inside a workspace
- [ ] Tasks CRUD — create tasks with status (todo / in-progress / done), labels, assignees
- [ ] Task comments — team members comment on tasks
- [ ] **Real-time updates** — WebSockets + Redis Pub/Sub so every task change is pushed live
- [ ] **Background notifications** — BullMQ processes notifications async (assignment, comments)
- [ ] Frontend — React dashboard consuming this API

---

## User Journey

```
User signs up
     │
     ▼ Clerk handles auth
     │ Webhook syncs user to PostgreSQL
     │
     ▼ Creates a Workspace → becomes OWNER automatically
     │
     ▼ Invites teammates → assigns roles (ADMIN / MEMBER / VIEWER)
     │
     ▼ Team creates Projects inside the workspace
     │
     ▼ Team creates Tasks inside projects
     │   → assign to member
     │   → set status: todo / in-progress / done
     │   → add labels: bug / feature / urgent
     │   → comment on tasks
     │
     ▼ Everyone sees updates in real-time (no refresh needed)
     │
     ▼ Notifications sent in background when tasks are assigned or commented
```

---

## Role Permissions

| Action | OWNER | ADMIN | MEMBER | VIEWER |
|---|:---:|:---:|:---:|:---:|
| Create workspace | ✅ | — | — | — |
| Invite members | ✅ | ✅ | — | — |
| Remove any member | ✅ | — | — | — |
| Remove MEMBER/VIEWER | ✅ | ✅ | — | — |
| Create projects | ✅ | ✅ | ✅ | — |
| Create & edit tasks | ✅ | ✅ | ✅ | — |
| Comment on tasks | ✅ | ✅ | ✅ | — |
| View everything | ✅ | ✅ | ✅ | ✅ |

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
```

### 4. Start local infrastructure

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
cd apps/api
npx prisma migrate dev
```

### 6. Start the dev server

```bash
# From root
npm run dev
```

API runs at `http://localhost:3000`

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/webhook` | Clerk webhook — syncs new users to DB |

### Workspaces
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/workspaces` | Create a workspace (caller becomes OWNER) | ✅ |
| GET | `/workspaces` | Get all workspaces the user belongs to | ✅ |

> More endpoints coming as features are built — follow along.

---

## Building in Public

I'm building FlowSpace in public — shipping real features, documenting real decisions, and sharing what I learn along the way.

Follow the journey:
- 🐦 Twitter/X: [@singh_akhil2272](https://twitter.com/singh_akhil2272)
- 💼 LinkedIn: [Akhilesh Singh](https://linkedin.com/in/akhilesh-singh-dev)

If you're building something similar or want to talk backend architecture — DM is open.

---

## Why I'm Building This

Most developers use Jira or Linear without understanding what's happening under the hood.

Building a production-grade version from scratch forces you to think about:
- How atomic operations prevent data inconsistency
- How RBAC should live at the service layer, not the route layer
- How real-time updates scale with Pub/Sub instead of polling
- How background jobs decouple notification logic from request handling

This project is my proof of work.

---

## License

MIT — do whatever you want with it.

---

<div align="center">
  <sub>If this project helped you or you find it interesting — a ⭐ means a lot.</sub>
</div>
