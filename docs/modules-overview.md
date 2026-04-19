# Modules Overview

This page indexes every per-module reference document in `docs/`. It is an index only — each table links to the individual module doc that holds the authoritative API surface.

Files listed as "(planned)" are owned by another documentation pass; they will appear alongside the files already linked below.

---

## Services

Business-logic layer. Each service sits between controllers and repositories, enforces RBAC, and orchestrates side effects (pub/sub events, job enqueues).

| Module       | Doc                                               | Responsibility                                                                 | Priority | Notable side effects                                                         |
| ------------ | ------------------------------------------------- | ------------------------------------------------------------------------------ | :------: | ---------------------------------------------------------------------------- |
| `auth`       | [`services/auth.service.md`](./services/auth.service.md) (planned) | Clerk webhook handling; provisions `User` on `user.created`.              | HIGH     | DB write.                                                                    |
| `workspaces` | [`services/workspace.service.md`](./services/workspace.service.md) (planned) | Workspace + membership lifecycle; enforces "at least one owner" invariant. | HIGH     | DB writes inside transactions.                                               |
| `projects`   | [`services/project.service.md`](./services/project.service.md) (planned)     | Project CRUD scoped by workspace role.                                         | HIGH     | DB writes.                                                                   |
| `tasks`      | [`services/task.service.md`](./services/task.service.md) (planned)           | Task CRUD; publishes `workspace-events` and enqueues `TASK_ASSIGNED` jobs.     | HIGH     | Pub/sub publish + BullMQ enqueue.                                            |
| `comments`   | [`services/comment.service.md`](./services/comment.service.md) (planned)     | Comment CRUD scoped by task membership.                                        | MEDIUM   | DB writes.                                                                   |
| `labels`     | [`services/label.service.md`](./services/label.service.md) (planned)         | Workspace labels + task-label assignment.                                      | MEDIUM   | DB writes.                                                                   |

---

## Repositories

Thin Prisma wrappers. Each repository file exposes projection-specific helpers for exactly one Prisma model (or a pair of tightly-coupled join tables).

| Module       | Doc                                                                  | Exports |
| ------------ | -------------------------------------------------------------------- | :-----: |
| `auth`       | [`repositories/auth.repository.md`](./repositories/auth.repository.md)           | 1       |
| `workspaces` | [`repositories/workspace.repository.md`](./repositories/workspace.repository.md) | 7       |
| `projects`   | [`repositories/project.repository.md`](./repositories/project.repository.md)     | 4       |
| `tasks`      | [`repositories/task.repository.md`](./repositories/task.repository.md)           | 6       |
| `comments`   | [`repositories/comment.repository.md`](./repositories/comment.repository.md)     | 5       |
| `labels`     | [`repositories/label.repository.md`](./repositories/label.repository.md)         | 7       |

---

## Middleware

Cross-cutting Express middleware. Pipeline order is the order they are registered in [`apps/api/src/app.ts`](../apps/api/src/app.ts).

| Middleware                       | Doc                                                                                    | Pipeline order                         | Purpose                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `helmet`                         | (Express third-party middleware — not documented here)                                 | 1                                      | Security headers.                                                                        |
| `cors`                           | (Express third-party middleware — not documented here)                                 | 2                                      | Cross-origin requests.                                                                   |
| `express.raw` (`/auth/webhook`)  | See [`api/README.md`](./api/README.md) webhook section                                 | 3 (mounted on `/auth/webhook` only)    | Preserves raw body for Clerk signature verification.                                     |
| `express.json`                   | (Express built-in)                                                                     | 4                                      | JSON body parsing for every other route.                                                 |
| `requestId`                      | [`middleware/requestId-and-errorHandler.md`](./middleware/requestId-and-errorHandler.md) | 5                                      | Assigns / forwards `x-request-id`.                                                       |
| Route routers                    | See [`api/README.md`](./api/README.md)                                                 | 6                                      | Business routes.                                                                         |
| `requireAuth` (per-route)        | [`middleware/requireAuth.md`](./middleware/requireAuth.md) (planned)                    | Per-route, before handler              | Clerk JWT verification (dev-mode bypass — see planned doc).                              |
| `validate(schema)` (per-route)   | [`middleware/validate.md`](./middleware/validate.md) (planned)                          | Per-route, before handler              | Zod validation of body / params / query.                                                 |
| `errorHandler`                   | [`middleware/requestId-and-errorHandler.md`](./middleware/requestId-and-errorHandler.md) | Terminal                               | Maps known error types to the standard JSON envelope.                                    |

---

## Lib / Infrastructure

Shared plumbing. These modules have no business logic; they provide connection objects, queues, pub/sub, sockets, and logging.

| Lib                                         | Doc                                                                                                 | External dependency      |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------ |
| `redis`, `pubsub`, `queue`                  | [`lib/pubsub-and-queue.md`](./lib/pubsub-and-queue.md)                                              | `ioredis`, `bullmq`      |
| `websocket`                                 | [`lib/websocket.md`](./lib/websocket.md)                                                            | `ws`                     |
| `notification.worker`, `logger`             | [`lib/notification-worker-and-logger.md`](./lib/notification-worker-and-logger.md)                  | `bullmq`, `winston`      |
| `prisma`                                    | [`config/env-and-database.md`](./config/env-and-database.md) (planned)                              | `@prisma/client`         |
| `user.repository`                           | [`lib/user.repository.md`](./lib/user.repository.md) (planned — documents a known bug)              | `@prisma/client`         |

---

## Config and Database

Environment parsing, Prisma client, and database schema live together for reference.

- [`config/env-and-database.md`](./config/env-and-database.md) (planned) — Zod env schema + Prisma client + model summary.
- [`architecture/database-er.md`](./architecture/database-er.md) — ER diagram for all 8 models.

---

## Cross-References

- [`api/README.md`](./api/README.md) — HTTP endpoint reference.
- [`architecture/api-endpoint-map.md`](./architecture/api-endpoint-map.md) — endpoint map diagram.
- [`architecture/database-er.md`](./architecture/database-er.md) — database ER diagram.
- [`architecture/mvc-flow.md`](./architecture/mvc-flow.md) — request flow diagram.
- [`guides/getting-started.md`](./guides/getting-started.md)
- [`guides/api-development.md`](./guides/api-development.md)
- [`guides/contributing.md`](./guides/contributing.md)
- [`guides/deployment.md`](./guides/deployment.md)
