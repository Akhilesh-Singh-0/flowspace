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

<p>project management API — built from scratch</p>

<p><em>A backend system built to understand how real-time, multi-tenant, role-based platforms work at the engineering level.</em></p>

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white" alt="Clerk"/>
</p>

<p>
  <a href="https://your-live-url.com"><strong>Live Demo</strong></a> ·
  <a href="../web/README.md"><strong>Frontend Repo</strong></a> ·
  <a href="https://twitter.com/singh_akhil2272"><strong>Building in Public</strong></a>
</p>

</div>

---

## What is FlowSpace?

FlowSpace is a **project management platform** built from the ground up — workspaces, roles, projects, tasks, real-time updates, and background notifications. No shortcuts, no magic abstractions hiding how things work.

Every architectural decision is intentional:

- **4-layer REST API** — Route → Controller → Service → Repository
- **Role-based access control** — OWNER, ADMIN, MEMBER, VIEWER with enforced permissions at the service layer
- **Atomic operations** — workspace creation assigns roles in a single Prisma transaction
- **Real-time** — task updates pushed live via WebSockets + Redis Pub/Sub
- **Background jobs** — notifications processed asynchronously via BullMQ
- **Auth** — Clerk JWT middleware on every protected route, users auto-synced to PostgreSQL via webhook

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

## Key Engineering Decisions

| Decision | Why |
|---|---|
| Redis Pub/Sub for WebSockets | Decouples event emission from socket management — scales horizontally |
| BullMQ for notifications | Async processing keeps API response times fast — notifications don't block requests |
| Prisma transactions for workspace creation | Atomically creates workspace + assigns OWNER — prevents orphaned workspaces |
| Service layer owns RBAC | Permission checks live in business logic, not routes — easier to test and reason about |
| Clerk for auth | Eliminates auth complexity — focus on product logic |
| Repository pattern | DB queries isolated — swap Prisma for anything without touching business logic |

---

## What's Built

### ✅ Core Infrastructure
- [x] Turborepo monorepo with `apps/api` and `packages/` structure
- [x] Docker Compose for local PostgreSQL + Redis
- [x] Global error handling middleware with custom AppError class
- [x] Request ID tracing on every request
- [x] Zod validation on all incoming data
- [x] Health check endpoint with DB + Redis status

### ✅ Auth
- [x] `requireAuth` middleware — verifies Clerk JWT on every protected route
- [x] `requireRole` middleware — enforces RBAC at the service layer
- [x] `POST /auth/webhook` — syncs new Clerk users to PostgreSQL automatically via Svix

### ✅ Workspaces + Members
- [x] Full workspace CRUD with atomic owner assignment
- [x] Member management with full RBAC enforcement
- [x] Last owner protection — workspace cannot be left ownerless

### ✅ Projects + Tasks
- [x] Projects CRUD inside workspaces
- [x] Tasks CRUD with status, priority, assignee, due date
- [x] Task assignment triggers background notification via BullMQ

### ✅ Comments + Labels
- [x] Comments on tasks — create, list, delete
- [x] Labels — create per workspace, assign to tasks, remove from tasks

### ✅ Real-time
- [x] WebSocket server with heartbeat (ping/pong)
- [x] Redis Pub/Sub — task events broadcast to all workspace members instantly
- [x] Clients join workspace rooms to receive relevant events only

### ✅ Background Jobs
- [x] BullMQ notification queue
- [x] Notification worker with retry logic
- [x] Graceful shutdown — worker closes cleanly on SIGTERM

---

## Role Permissions

| Action | OWNER | ADMIN | MEMBER | VIEWER |
|---|:---:|:---:|:---:|:---:|
| Create workspace | ✅ | — | — | — |
| Invite members | ✅ | ✅ | — | — |
| Remove MEMBER/VIEWER | ✅ | ✅ | — | — |
| Remove ADMIN | ✅ | — | — | — |
| Remove OWNER | — | — | — | — |
| Create/update/delete projects | ✅ | ✅ | — | — |
| Create/update tasks | ✅ | ✅ | ✅ | — |
| Delete tasks | ✅ | ✅ | ✅ | — |
| Comment on tasks | ✅ | ✅ | ✅ | — |
| Delete comments | ✅ | ✅ | ✅ | — |
| Create labels | ✅ | ✅ | — | — |
| Assign/remove labels | ✅ | ✅ | — | — |
| View everything | ✅ | ✅ | ✅ | ✅ |

---

## API Reference

### Auth
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| POST | `/auth/webhook` | Clerk webhook — syncs new users to DB | — |

### Workspaces
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| POST | `/workspaces` | Create workspace — caller becomes OWNER | — |
| GET | `/workspaces` | List all workspaces the user belongs to | — |

### Workspace Members
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| POST | `/workspaces/:workspaceId/members` | Add member to workspace | ADMIN |
| GET | `/workspaces/:workspaceId/members` | List all workspace members | VIEWER |
| DELETE | `/workspaces/:workspaceId/members/:userId` | Remove member from workspace | ADMIN |

### Projects
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| POST | `/workspaces/:id/projects` | Create project | ADMIN |
| GET | `/workspaces/:id/projects` | List all projects in workspace | VIEWER |
| PATCH | `/workspaces/:id/projects/:projectId` | Update project | ADMIN |
| DELETE | `/workspaces/:id/projects/:projectId` | Delete project | ADMIN |

### Tasks
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| POST | `/workspaces/:workspaceId/projects/:projectId/tasks` | Create task | MEMBER |
| GET | `/workspaces/:workspaceId/projects/:projectId/tasks` | List all tasks in project | VIEWER |
| PATCH | `/workspaces/:workspaceId/tasks/:taskId` | Update task | MEMBER |
| DELETE | `/workspaces/:workspaceId/tasks/:taskId` | Delete task | MEMBER |

### Comments
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| POST | `/workspaces/:workspaceId/tasks/:taskId/comments` | Add comment to task | MEMBER |
| GET | `/workspaces/:workspaceId/tasks/:taskId/comments` | List all comments on task | VIEWER |
| DELETE | `/workspaces/:workspaceId/tasks/:taskId/comments/:commentId` | Delete comment | MEMBER |

### Labels
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| POST | `/workspaces/:workspaceId/labels` | Create label in workspace | ADMIN |
| GET | `/workspaces/:workspaceId/tasks/:taskId/labels` | Get labels on task | VIEWER |
| POST | `/workspaces/:workspaceId/tasks/:taskId/labels` | Assign label to task | ADMIN |
| DELETE | `/workspaces/:workspaceId/tasks/:taskId/labels/:labelId` | Remove label from task | ADMIN |

### System
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/health` | Server, DB, and Redis health status | — |

---

## User Journey

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
         │   → assign to member → triggers background notification
         │   → set status: BACKLOG / IN_PROGRESS / IN_REVIEW / DONE / CANCELLED
         │   → set priority: URGENT / HIGH / MEDIUM / LOW
         │   → add labels, comments
         │
         ▼ Everyone sees updates in real-time (no refresh needed)
         │
         ▼ Notifications processed in background via BullMQ

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
```

### 6. Generate Prisma client

```bash
npx prisma generate
```

### 7. Start the dev server

```bash
cd ../..
npm run dev
```

API runs at `http://localhost:3000`
Health check at `http://localhost:3000/health`
API Documentation at `http://localhost:3000/api-docs`

---

## Why I Built This

I got tired of building CRUD apps that look impressive on the surface but fall apart the moment you ask hard questions.

What happens when the last workspace owner tries to leave? What stops two admins from creating a race condition on member roles? How do you push a task update to 50 connected users without blocking the request cycle?

These aren't hypothetical problems. They're the problems every team collaboration tool has to solve — and most tutorials pretend they don't exist.

So I built FlowSpace to answer them myself. Every layer is hand-crafted. Every decision has a reason. The architecture isn't cargo-culted from a YouTube video — it's the result of thinking through what breaks and why.

---

## Building in Public

Follow the journey on Twitter/X: [@singh_akhil2272](https://twitter.com/singh_akhil2272)

---

## License

MIT — do whatever you want with it.

---

<div align="center">
  <sub>If this project helped you or you find it interesting — a ⭐ means a lot.</sub>
</div>