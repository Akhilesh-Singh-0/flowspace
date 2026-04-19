# Contributing to flowspace

Thanks for considering a contribution to **flowspace**. This guide covers everything you need to land a PR: the monorepo layout, branch and commit conventions, code style, and testing expectations.

**Project:** flowspace
**Monorepo:** Turborepo (`apps/api` + `packages/types`)
**Language:** TypeScript (strict)
**Test Framework:** Vitest 4.1.2

---

## 1. Monorepo Structure

```
flowspace/
├── apps/
│   ├── api/                           ← Express + TypeScript backend
│   │   ├── src/
│   │   │   ├── modules/               ← Feature modules (auth, workspaces, projects, tasks, comments, labels)
│   │   │   ├── middleware/            ← requireAuth, requireRole, validate, errorHandler, requestId, rateLimiter (stub)
│   │   │   ├── lib/                   ← prisma client, redis, pubsub, queue, worker, websocket, logger, user.repository
│   │   │   ├── config/                ← env (Zod), constants (stub)
│   │   │   ├── utils/                 ← pagination, slugify, crypto (all stubs today)
│   │   │   ├── types/                 ← internal Express type augmentations
│   │   │   └── server.ts
│   │   └── prisma/schema.prisma       ← 8 models
│   └── web/                           ← Frontend (coming soon — not yet present)
├── packages/
│   └── types/                         ← Scaffolded workspace for shared @flowspace/types.
│                                         Currently empty (src/index.ts exports nothing).
├── docs/                              ← Documentation (you are here)
├── docker-compose.yml                 ← Postgres 15 + Redis 7-alpine services for local dev
├── turbo.json
└── package.json                       ← npm workspaces + "packageManager": "npm@10.8.3"
```

Workspaces are declared in the root `package.json` under the `workspaces` key (npm-style). Turborepo orchestrates `dev`, `build`, `test` across every workspace.

---

## 2. Branch Naming

Create feature branches off `main`. Suggested prefixes (aligned with our commit conventions):

- `feat/<scope>-<short-description>` — new functionality
- `fix/<scope>-<short-description>` — bug fixes
- `docs/<scope>-<short-description>` — documentation only
- `refactor/<scope>-<short-description>` — no behavior change
- `chore/<scope>-<short-description>` — tooling, deps, CI

Examples:

- `feat/tasks-add-status-endpoint`
- `fix/auth-reject-expired-jwt`
- `docs/api-endpoint-map`

---

## 3. Commit Conventions

We follow **Conventional Commits**, matching the style observed in the project history (`feat(...)`, `fix(...)`, `docs(...)`, `refactor(...)`, `chore(...)`). Format:

```
<type>(<scope>): <subject>

<body>
```

Real examples from `git log`:

```
feat(jobs): trigger task assignment notification and start worker
feat(jobs): add notification worker with retry logic
feat(jobs): add BullMQ notification queue
fix(tasks): remove bad import, fix missing route slash, format findTaskById, centralise user repository imports, register comment and label routes
docs(readme): add root README with architecture and setup guide
```

Keep the subject imperative ("add", not "added"), under 72 characters.

---

## 4. Code Style

- **TypeScript strict mode** — no `any`, explicit return types on exported functions.
- **Feature modules** — one folder per resource (`apps/api/src/modules/<resource>/`) with `routes.ts`, `controller.ts`, `service.ts`, `repository.ts`, `schema.ts` files colocated.
- **Single responsibility** — routes wire middleware; controllers handle HTTP; services own business logic + RBAC; repositories only talk to Prisma.
- **Imports** — use the `@/` path alias (configured via `tsconfig-paths`) for internal imports: `import { prisma } from '@/lib/prisma'`.
- **Error handling** — always `next(err)` from async handlers; never write error responses directly.
- **Formatter** — none configured today (no Prettier config detected). Match the surrounding code.

Lint before pushing:

```bash
npm --workspace @flowspace/api run lint
npm --workspace @flowspace/api run lint -- --fix
```

---

## 5. Testing with Vitest

We use **Vitest 4.1.2**. Tests are colocated next to the module they cover (e.g. `task.service.test.ts` next to `task.service.ts`). No tests exist yet, so every PR that seeds the suite is hugely valuable.

```bash
npm test                                          # all workspaces
npm --workspace @flowspace/api run test           # API only
npx vitest                                        # watch mode (run from apps/api)
npx vitest run apps/api/src/modules/tasks         # a single module
npx vitest run --coverage                         # generate coverage
```

Example test for `createTaskHandler`. Note that `authMiddleware` attaches the authenticated identity as `req.user = { userId: ... }` (see `apps/api/src/middleware/requireAuth.ts`), and every controller returns the shared `{ success: true, data: ... }` envelope with `res.status(201).json(...)`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { createTaskHandler } from './task.controller';

describe('createTaskHandler', () => {
  it('creates a task when caller is a workspace member', async () => {
    const req = {
      user: { userId: 'user_123' },
      params: { workspaceId: 'ws_1', projectId: 'proj_1' },
      body: { title: 'Ship MVP' },
    } as any;
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() } as any;
    const next = vi.fn();

    await createTaskHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        title: 'Ship MVP',
        status: 'BACKLOG',
        priority: 'MEDIUM',
      }),
    });
  });
});
```

Expected response shape for `POST /workspaces/:workspaceId/projects/:projectId/tasks`:

```json
{
  "success": true,
  "data": {
    "id": "ckxyz...",
    "title": "Ship MVP",
    "status": "BACKLOG",
    "priority": "MEDIUM",
    "workspaceId": "ws_1",
    "projectId": "proj_1",
    "creatorId": "user_123",
    "assigneeId": null,
    "dueDate": null,
    "createdAt": "2026-04-18T12:00:00.000Z",
    "updatedAt": "2026-04-18T12:00:00.000Z"
  }
}
```

Expected behavior: creates a Task for a given workspace/project if the caller has `OWNER`/`ADMIN`/`MEMBER` role, persists via `task.repository`, emits a real-time pubsub event, enqueues a notification via BullMQ, and returns the created Task inside the `{ success, data }` envelope.

---

## 6. Local Development Loop

```bash
npm run dev                                         # starts every dev script via Turborepo
npm --workspace @flowspace/api run dev              # API only (nodemon + ts-node)
npm run build                                       # compile every workspace
```

Debug a specific file:

```bash
node --inspect -r ts-node/register apps/api/src/server.ts
```

Tail logs (depending on environment):

```bash
tail -f logs
docker logs -f flowspace-api
```

Attach the VS Code debugger and set breakpoints in `apps/api/src/modules/<resource>/*.controller.ts`.

---

## 7. Pull Request Flow

1. Fork or branch from `main`.
2. Make your change. Keep PRs focused.
3. Run `npm test` and `npm run build` locally — both must pass.
4. Update or add documentation in `docs/` if user-facing behavior changed.
5. Open a PR into `main` with:
   - A clear title in Conventional Commit format (e.g. `feat(tasks): add status endpoint`).
   - A description of the change, the motivation, and any screenshots/curl examples.
   - A note if a Prisma migration is included.
6. Address code review feedback by pushing more commits to the same branch (don't force-push during review).
7. A maintainer squash-merges the PR when approved.

---

## 8. Ground Rules

- Source of truth for directories: `apps/api/src` (code), `apps/api/src` (colocated tests preferred).
- Never commit `.env`, `.env.local`, or any file containing real secrets. Only commit `.env.example`.
- Never commit compiled output (`apps/api/dist/`) or `node_modules/`.
- Never commit `node_modules/.prisma/` — the client is generated from `schema.prisma`.
- Breaking API changes need a `/v2` strategy (see [API Development Guide](./api-development.md) §8). Don't mutate existing response shapes.

---

## 9. Where to Ask Questions

- Open a GitHub issue with the `question` label.
- For security-sensitive reports, email the maintainer directly rather than filing a public issue.

Thanks for contributing to flowspace!

---
