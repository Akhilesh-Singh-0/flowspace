# API Development Guide

This guide walks you through adding new endpoints to **flowspace** while respecting the layered architecture, validation conventions, and RBAC model already in place.

**Architecture Pattern:** Layered (Routes > Controllers > Services > Repositories) with feature modules
**Framework:** Express 5.2.1 (Node.js + TypeScript)
**Database:** PostgreSQL (via Prisma 5.22.0)
**Authentication:** Clerk JWT verified via `@clerk/backend`'s `verifyToken` inside `authMiddleware` (`apps/api/src/middleware/requireAuth.ts`)
**Validation:** Zod 3.22.4 via `validate(schema)` middleware in `src/middleware/validate.ts`

---

## 1. Mental Model — The Request Lifecycle

Every request flows through the same layered pipeline:

```
Client
  ↓ HTTP
Route (apps/api/src/modules/<resource>/<resource>.routes.ts)
  ↓ authMiddleware + requireRole(...) + validate(Schema)
Controller (<resource>.controller.ts)
  ↓ parses req, calls service, formats response (wraps in { success, data })
Service (<resource>.service.ts)
  ↓ business rules + RBAC helpers + side-effects
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
npm run db:migrate          # prompts for migration name, applies it, regenerates client
npm run db:generate         # re-run if you only changed typing-relevant bits
```

For our example (no new column), you can skip this step.

### Step 2 — Define a Zod Schema

Put the input schema in `apps/api/src/modules/tasks/task.schema.ts`.

The shared `validate()` middleware (`apps/api/src/middleware/validate.ts`) runs `schema.parse(req.body)` and **only** validates `req.body` — `req.params` and `req.query` are not passed to Zod. Keep your schemas flat (don't nest them under a `body` / `params` / `query` wrapper):

```ts
import { z } from 'zod';

export const UpdateTaskStatusSchema = z.object({
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']),
});

export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;
```

Validate route parameters (e.g. `:workspaceId`, `:taskId`) inside the controller or service if you need to, using plain Zod schemas or string checks. The middleware does not do this for you today.

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

The service enforces workspace membership and orchestrates side-effects (pub/sub events, BullMQ jobs). Use `findWorkspaceMember` (the exported helper in `@/modules/workspaces/workspace.repository`) to confirm the caller belongs to the workspace, and `publish` from `@/lib/pubsub` to broadcast events on the `workspace-events` channel (which is what `task.service.ts` already does).

Add to `task.service.ts`:

```ts
import * as taskRepository from './task.repository';
import { findWorkspaceMember } from '@/modules/workspaces/workspace.repository';
import { publish } from '@/lib/pubsub';
import type { TaskStatus } from '@prisma/client';

export async function updateStatus(params: {
  userId: string;
  workspaceId: string;
  taskId: string;
  status: TaskStatus;
}) {
  const membership = await findWorkspaceMember(params.userId, params.workspaceId);
  if (!membership) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  const task = await taskRepository.updateTaskStatus(params.taskId, params.status);

  // Broadcast real-time update over Redis pub/sub (fan-out to WebSocket clients)
  await publish('workspace-events', {
    type: 'task.updated',
    workspaceId: params.workspaceId,
    task,
  });

  return task;
}
```

### Step 5 — Controller

Controllers convert between HTTP and the service API. The authenticated identity is exposed on `req.user.userId` (attached by `authMiddleware`), and every controller returns the shared `{ success: true, data: ... }` envelope. Add to `task.controller.ts`:

```ts
import type { Request, Response, NextFunction } from 'express';
import * as taskService from './task.service';
import { findUserByClerkId } from '@/lib/user.repository';

export async function updateTaskStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await findUserByClerkId(req.user!.userId);
    const task = await taskService.updateStatus({
      userId: user!.id,
      workspaceId: req.params.workspaceId,
      taskId: req.params.taskId,
      status: req.body.status,
    });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}
```

### Step 6 — Register the Route

Wire it up in `task.routes.ts`. Every resource router in `apps/api/src/app.ts` is mounted under a base path (`app.use('/workspaces', taskRoutes)`), so the router's paths must be relative to that mount — start them with `/:workspaceId/...`, not `/workspaces/...`.

The canonical middleware order in `task.routes.ts` is `authMiddleware → requireRole(...) → validate(Schema) → handler`. Use that order for any new route:

```ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/requireAuth';
import { requireRole } from '@/middleware/requireRole';
import { validate } from '@/middleware/validate';
import { UpdateTaskStatusSchema } from './task.schema';
import { updateTaskStatusHandler } from './task.controller';

const router = Router();

router.patch(
  '/:workspaceId/tasks/:taskId/status',
  authMiddleware,
  requireRole('OWNER', 'ADMIN', 'MEMBER'),
  validate(UpdateTaskStatusSchema),
  updateTaskStatusHandler,
);

export default router;
```

> **Heads-up on current inconsistency:** `comment.routes.ts` and `label.routes.ts` currently place `validate(...)` **before** `requireRole(...)`, while `task.routes.ts`, `workspace.routes.ts`, and `project.routes.ts` place `requireRole(...)` first. Use the task-routes order (`auth → requireRole → validate → handler`) for any new code. Standardising the two older files is tracked in Technical-Debt.md.

The router itself is mounted in `apps/api/src/app.ts` under `app.use('/workspaces', taskRoutes)`.

---

## 4. Middleware Conventions

All protected routes use `authMiddleware` from `@/middleware/requireAuth`. Role-scoped routes also add `requireRole('OWNER', 'ADMIN', ...)`. The middleware populates `req.user = { userId: string }` (where `userId` is the JWT's `sub` claim); resolve the internal user via `findUserByClerkId` in `@/lib/user.repository`.

| Middleware | Purpose | Where |
|---|---|---|
| `authMiddleware` | Verifies Clerk JWT via `@clerk/backend`; populates `req.user = { userId: verified.sub }`. Short-circuits in `NODE_ENV=development` with `{ userId: 'test-user-1' }`. | First on every protected route |
| `validate(Schema)` | Runs `Schema.parse(req.body)` — **only** the JSON body is validated, not `req.params` or `req.query` | After auth and (by convention) after `requireRole` |
| `requireRole('OWNER', 'ADMIN', ...)` | Checks workspace membership + role | After auth, before `validate` in the canonical order |
| `errorHandler` | Maps thrown errors to the unified JSON envelope `{ success, data, error: { code, message, fields? }, requestId }` | Registered last in `app.ts` |

Validation errors short-circuit into `errorHandler` as `400` responses with `error.code = VALIDATION_ERROR` and a populated `error.fields` map. Role failures are surfaced by `requireRole` as `403`.

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

All protected routes use `authMiddleware` from `@/middleware/requireAuth`. The middleware, in order:

1. If `NODE_ENV === 'development'` → inject `req.user = { userId: 'test-user-1' }` and `return next()` (no JWT is verified). Never deploy the API with `NODE_ENV=development`.
2. Otherwise extract the `Authorization: Bearer <jwt>` header; return `401 UNAUTHORIZED` if missing or malformed.
3. Call `verifyToken(token, { secretKey: CLERK_SECRET_KEY })` from `@clerk/backend`. On an expired JWT the catch branch returns `401 TOKEN_EXPIRED`; any other verification failure returns `401 UNAUTHORIZED`.
4. On success, attach `req.user = { userId: verified.sub }` and call `next()`.

Only the `userId` field is attached to `req.user` — there is no `sessionId` or other Clerk claim available on the request. To resolve the internal `User` record:

```ts
import { findUserByClerkId } from '@/lib/user.repository';

const user = await findUserByClerkId(req.user!.userId);
```

Users are auto-provisioned by the Clerk webhook at `POST /auth/webhook` (Svix-verified).

---

## 7. Database Migrations

Edit `apps/api/prisma/schema.prisma`, then run `npm run db:migrate` to generate and apply a new migration. Always run `npm run db:generate` after schema changes to update the Prisma client types.

```bash
cd apps/api
npm run db:migrate           # prompts for a name, runs prisma migrate dev
npm run db:generate          # regenerates the typed client
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
npm test                                 # run everything through Turborepo
npx vitest                               # watch mode, from apps/api
npx vitest run src/modules/tasks         # a single module
```

See the [Contributing Guide](./contributing.md) for test conventions and the Vitest patterns we follow.

---

## 11. Utilities and Extension Points

A few empty stub files exist under `apps/api/src/` as future extension points. They are NOT implemented yet — the comments below apply to every one of them:

- `apps/api/src/middleware/rateLimiter.ts` — empty. Rate limiting is not implemented.
- `apps/api/src/utils/pagination.ts` — empty. No endpoints accept `?page=` / `?pageSize=` today.
- `apps/api/src/utils/slugify.ts` — empty.
- `apps/api/src/utils/crypto.ts` — empty.
- `apps/api/src/config/constants.ts` — empty.

All five are tracked in Technical-Debt.md and will be filled in when the corresponding features land. Don't import them until you see a real export.

---

## 12. Checklist Before Opening a PR

- [ ] New Prisma migration committed (if schema changed) and `prisma generate` run
- [ ] Zod schema added in `<resource>.schema.ts` (flat, not nested under `body` / `params`)
- [ ] Repository method has no business logic
- [ ] Service enforces RBAC (via `findWorkspaceMember` or `requireRole`) before calling the repository
- [ ] Route wires `authMiddleware` → `requireRole(...)` → `validate(...)` → handler (in that order)
- [ ] Error paths go through `next(err)` so `errorHandler` can format them
- [ ] Winston logs added for observability
- [ ] Vitest tests for the new service/controller paths

---

**Example Resource:** tasks — see `apps/api/src/modules/tasks/` for the complete reference implementation including `createTaskHandler`, `getTaskHandler`, `updateTaskHandler`, `deleteTaskHandler`.
