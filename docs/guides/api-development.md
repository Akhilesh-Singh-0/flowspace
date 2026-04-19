# API Development Guide

This guide walks you through adding new endpoints to **flowspace** while respecting the layered architecture, validation conventions, and RBAC model already in place.

**Architecture Pattern:** Layered (Routes > Controllers > Services > Repositories) with feature modules
**Framework:** Express 5.2.1 (Node.js + TypeScript)
**Database:** PostgreSQL (via Prisma 5.22.0)
**Authentication:** Clerk JWT via `@clerk/express` middleware (`authMiddleware` in `src/middleware/requireAuth.ts`)
**Validation:** Zod 3.22.4 via `validate(schema)` middleware in `src/middleware/validate.ts`
**Generated:** 2026-04-18

---

## 1. Mental Model — The Request Lifecycle

Every request flows through the same five layers:

```
Client
  ↓ HTTP
Route (apps/api/src/modules/<resource>/<resource>.routes.ts)
  ↓ authMiddleware + validate(Schema) + requireRole(...)
Controller (<resource>.controller.ts)
  ↓ parses req, calls service, formats response
Service (<resource>.service.ts)
  ↓ RBAC enforcement + business rules
Repository (<resource>.repository.ts)
  ↓ Prisma client calls
PostgreSQL
```

Every layer has exactly one job. Don't call Prisma from a controller; don't enforce RBAC in a repository; don't put business logic in a route file.

---

## 2. Directory Layout of a Feature Module

Feature modules live under `apps/api/src/modules/<resource>/`. Each module follows the same file layout:

```
apps/api/src/modules/tasks/
├── task.routes.ts        ← Express router, mounts middleware + handlers
├── task.controller.ts    ← Request/response plumbing
├── task.service.ts       ← Business logic + RBAC
├── task.repository.ts    ← Prisma queries (no business logic)
└── task.schema.ts        ← Zod input schemas
```

The controller for tasks (`task.controller.ts`) exports `createTaskHandler`, `getTaskHandler`, `updateTaskHandler`, `deleteTaskHandler`.

---

## 3. Walkthrough — Add a New Endpoint (Using `tasks` as a Reference)

Suppose you want to add `PATCH /workspaces/:workspaceId/tasks/:taskId/status` that updates only the `status` field. Here's the complete flow.

### Step 1 — Update the Prisma Schema (if needed)

If you're adding a new column, edit `apps/api/prisma/schema.prisma`:

```prisma
model Task {
  id         String     @id @default(cuid())
  title      String
  status     TaskStatus @default(BACKLOG)
  priority   TaskPriority @default(MEDIUM)
  // ...existing fields
  updatedAt  DateTime   @updatedAt
}
```

Then generate a migration and regenerate the client:

```bash
cd apps/api
pnpm db:migrate          # prompts for migration name, applies it, regenerates client
pnpm db:generate         # re-run if you only changed typing-relevant bits
```

For our example (no new column), you can skip this step.

### Step 2 — Define a Zod Schema

Put the input schema in `apps/api/src/modules/tasks/task.schema.ts`:

```ts
import { z } from 'zod';

export const UpdateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    taskId: z.string().cuid(),
  }),
});

export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;
```

### Step 3 — Repository Method

Repositories only talk to Prisma. Add to `task.repository.ts`:

```ts
import { prisma } from '@/lib/prisma';
import type { TaskStatus } from '@prisma/client';

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  return prisma.task.update({
    where: { id: taskId },
    data: { status },
  });
}
```

### Step 4 — Service (Business Logic + RBAC)

The service enforces access control and orchestrates side-effects (pub/sub events, BullMQ jobs). Add to `task.service.ts`:

```ts
import * as taskRepository from './task.repository';
import { findMembership } from '@/modules/workspaces/workspace.repository';
import { publishTaskEvent } from '@/lib/pubsub';
import type { TaskStatus } from '@prisma/client';

export async function updateStatus(params: {
  userId: string;
  workspaceId: string;
  taskId: string;
  status: TaskStatus;
}) {
  const membership = await findMembership(params.userId, params.workspaceId);
  if (!membership) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  const task = await taskRepository.updateTaskStatus(params.taskId, params.status);

  // Broadcast real-time update over Redis pub/sub (fan-out to WebSocket clients)
  await publishTaskEvent(params.workspaceId, { type: 'task.updated', task });

  return task;
}
```

### Step 5 — Controller

Controllers convert between HTTP and the service API. Add to `task.controller.ts`:

```ts
import type { Request, Response, NextFunction } from 'express';
import * as taskService from './task.service';
import { findUserByClerkId } from '@/modules/users/user.repository';

export async function updateTaskStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await findUserByClerkId(req.auth!.userId);
    const task = await taskService.updateStatus({
      userId: user.id,
      workspaceId: req.params.workspaceId,
      taskId: req.params.taskId,
      status: req.body.status,
    });
    res.json(task);
  } catch (err) {
    next(err);
  }
}
```

### Step 6 — Register the Route

Wire it up in `task.routes.ts`:

```ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/requireAuth';
import { requireRole } from '@/middleware/requireRole';
import { validate } from '@/middleware/validate';
import { UpdateTaskStatusSchema } from './task.schema';
import { updateTaskStatusHandler } from './task.controller';

const router = Router({ mergeParams: true });

router.patch(
  '/workspaces/:workspaceId/tasks/:taskId/status',
  authMiddleware,
  validate(UpdateTaskStatusSchema),
  requireRole('OWNER', 'ADMIN', 'MEMBER'),
  updateTaskStatusHandler,
);

export default router;
```

The router is mounted in `apps/api/src/server.ts` (or `app.ts`), so re-exporting it from the module's index is enough for it to be picked up.

---

## 4. Middleware Conventions

All protected routes use `authMiddleware` from `@/middleware/requireAuth`. Role-scoped routes also add `requireRole('OWNER', 'ADMIN', ...)`. The middleware populates `req.auth` with the Clerk user claims; resolve the internal User via `user.repository.ts`.

| Middleware | Purpose | Where |
|---|---|---|
| `authMiddleware` | Verifies Clerk JWT, populates `req.auth` | First on every protected route |
| `validate(Schema)` | Runs Zod validation against `body`, `params`, `query` | After auth, before `requireRole` |
| `requireRole('OWNER', 'ADMIN', ...)` | Checks workspace membership + role | After validate, before controller |
| `errorHandler` | Maps thrown errors to JSON responses | Registered last in `app.ts` |

Validation errors are converted to `400` responses by `errorHandler`. Role failures become `403`.

---

## 5. Accessing the Prisma Client

Always import the singleton from `@/lib/prisma`:

```ts
import { prisma } from '@/lib/prisma';

const task = await prisma.task.findUnique({ where: { id: taskId } });
```

Never instantiate `new PrismaClient()` in a module — this leaks connections in dev mode under hot-reload.

---

## 6. Authentication Section

All protected routes use `authMiddleware` from `@/middleware/requireAuth`. The middleware:

1. Extracts the `Authorization: Bearer <jwt>` header
2. Verifies the JWT via `@clerk/express`
3. Attaches `req.auth = { userId, sessionId, ... }`

To resolve the internal `User` record from the Clerk ID:

```ts
import { findUserByClerkId } from '@/modules/users/user.repository';

const user = await findUserByClerkId(req.auth!.userId);
```

Users are auto-provisioned by the Clerk webhook at `POST /auth/webhook` (Svix-verified).

---

## 7. Database Migrations

Edit `apps/api/prisma/schema.prisma`, then run `pnpm db:migrate` to generate and apply a new migration. Always run `pnpm db:generate` after schema changes to update the Prisma client types.

```bash
cd apps/api
pnpm db:migrate           # prompts for a name, runs prisma migrate dev
pnpm db:generate          # regenerates the typed client
```

Migration files land in `apps/api/prisma/migrations/<timestamp>_<name>/`. Commit both the schema and the new migration directory.

---

## 8. API Versioning

No URL-based versioning is in place today. When breaking changes are needed, introduce a `/v2` prefix router in `app.ts` alongside the existing routers — don't mutate `/v1` contracts.

---

## 9. Logging and Debugging

Use the Winston logger from `@/lib/logger`. A per-request request ID is attached by the `requestId` middleware. Prefer structured logs:

```ts
import { logger } from '@/lib/logger';

logger.info('task.updated', { taskId: task.id, workspaceId, userId });
logger.error('task.update.failed', { taskId, error: err.message });
```

To attach a debugger, run:

```bash
node --inspect -r ts-node/register apps/api/src/server.ts
```

Then set breakpoints in `src/modules/<resource>/*.controller.ts` from VS Code.

---

## 10. Testing (Vitest)

Colocate tests with the module they cover (`apps/api/src/modules/tasks/task.service.test.ts`). The test directory is `apps/api/src` (colocated; no tests yet).

```bash
pnpm test                                # run everything through Turborepo
npx vitest                               # watch mode, from apps/api
npx vitest run src/modules/tasks         # a single module
```

See the [Contributing Guide](./contributing.md) for test conventions and the Vitest patterns we follow.

---

## 11. Checklist Before Opening a PR

- [ ] New Prisma migration committed (if schema changed) and `prisma generate` run
- [ ] Zod schema added in `<resource>.schema.ts`
- [ ] Repository method has no business logic
- [ ] Service enforces RBAC before calling the repository
- [ ] Route wires `authMiddleware` + `validate(...)` + `requireRole(...)` in that order
- [ ] Error paths go through `next(err)` so `errorHandler` can format them
- [ ] Winston logs added for observability
- [ ] Vitest tests for the new service/controller paths

---

**Example Resource:** tasks — see `apps/api/src/modules/tasks/` for the complete reference implementation including `createTaskHandler`, `getTaskHandler`, `updateTaskHandler`, `deleteTaskHandler`.

**Document generated:** 2026-04-18
