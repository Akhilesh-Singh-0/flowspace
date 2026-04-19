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

### project management API — built from scratch

> A backend system built to understand how real-time, multi-tenant, role-based platforms work at the engineering level.

![Status](https://img.shields.io/badge/status-building%20in%20public-1D9E75?style=flat-square)
![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20TypeScript%20%7C%20PostgreSQL-3C3489?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

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