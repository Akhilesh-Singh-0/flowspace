# FlowSpace Security Audit

**Scope:** `apps/api` (as of commit `1179c60`).
**Areas reviewed:** hardcoded secrets, SQL injection, input validation,
dependency surface, CORS, debug/bypass endpoints, authentication, and
authorization (RBAC + resource ownership).

This doc summarizes what was found and which items the accompanying PR
fixes. Severity uses a simple High / Medium / Low scale from the point of
view of a multi-tenant SaaS where each workspace must be isolated.

---

## Critical / High severity (fixed in this PR)

### 1. Auth bypass in development mode — **HIGH**

`apps/api/src/middleware/requireAuth.ts` previously contained:

```ts
if (process.env.NODE_ENV === "development") {
  req.user = { userId: "test-user-1" };
  return next();
}
```

Any request — with no `Authorization` header at all — was accepted as a
fixed user whenever `NODE_ENV` was `development` **or unset** (because of
how this check fails open). A container that boots without `NODE_ENV=production`
set explicitly (a common misconfiguration, e.g. a fresh `docker run`, a
forgotten Fly/K8s env var, or a stage/preview environment that inherits the
wrong default) would silently expose every protected endpoint to anonymous
callers and attribute all actions to `test-user-1`.

**Fix:** the bypass was removed entirely. A comment documents why it must
not be re-added. If a local-only stub is needed in the future, it should be
gated on an explicit opt-in env var (e.g. `ALLOW_UNSAFE_AUTH_STUB=1`) that
is never set outside a developer's machine.

### 2. Overly permissive CORS — **HIGH**

`apps/api/src/app.ts` used `app.use(cors())`, which reflects the request
origin back as `Access-Control-Allow-Origin` for every origin. Combined
with a Bearer-token auth scheme this is acceptable for unauthenticated
public reads, but it makes any CSRF-ish or token-theft scenario worse and
leaks the API surface to any site.

**Fix:** CORS is now configured from an allow-list env var
`CORS_ALLOWED_ORIGINS` (comma-separated). Origins not on the list are
rejected; requests without an `Origin` header (curl, server-to-server,
same-origin) are still allowed. `credentials: true` is set so the
allow-list is actually enforced by the browser.

### 3. IDOR on task update / delete — **HIGH**

`task.routes.ts` routes `PATCH /workspaces/:workspaceId/tasks/:taskId` and
`DELETE /workspaces/:workspaceId/tasks/:taskId` ran `requireRole` against
the `workspaceId` in the URL, but the service layer never verified that
the target `taskId` actually belonged to that workspace.

An attacker who was a member of workspace `A` could modify or delete tasks
in a completely unrelated workspace `B` by sending:

```
PATCH /workspaces/A/tasks/<taskId-from-workspace-B>
```

**Fix:** `updateTask` and `deleteTask` now load the task and verify
`task.workspaceId === workspaceId` (URL). Mismatches return `404` rather
than `403` so we don't leak the existence of tasks in workspaces the
caller can't see. `addTask` and `getTask` got the same guard against
project IDs from other workspaces.

### 4. IDOR on project update / delete — **HIGH**

Same pattern as tasks: `updateProject(projectId, data)` and
`deleteProject(projectId)` ignored the `:id` (workspace) URL parameter
entirely. An `ADMIN`/`OWNER` of workspace `A` could pass a `projectId`
belonging to workspace `B` and mutate it.

**Fix:** `project.service.ts` now calls `ensureProjectInWorkspace` before
edit/delete, returning `404` on mismatch. A `findProjectById` helper was
added to the project repository for this check.

### 5. Broken self-removal logic in `removeWorkspaceMember` — **MEDIUM** (logic / auth)

`workspace.service.ts` compared `requesterId` (a Clerk user ID from the
JWT) against `targetUserId` (a database user ID passed in the URL). That
comparison was always false, which:

- Broke self-removal entirely for `MEMBER` / `VIEWER` (they'd get
  `403 "Not authorized"` when trying to leave their own workspace).
- In a scenario where an OWNER tries to remove themselves, the self-branch
  with its `ensureNotLastOwner` call was never taken. Control fell into
  the OWNER branch further down, which happens to also call
  `ensureNotLastOwner` — so there was no actual auth escalation, but this
  is still a latent bug that will break as soon as the non-self OWNER
  path changes.

**Fix:** compare `dbUser.id === targetUserId` (both DB IDs).

---

## Medium severity (fixed in this PR)

### 6. `findUserByClerkId` queried the wrong column — **MEDIUM** (correctness + auth)

`apps/api/src/lib/user.repository.ts` looked up a user via
`where: { id: clerkId }`. Per `schema.prisma`, `id` is a cuid and `clerkId`
is a separate `@unique` column, so this call effectively always returned
`null`. Every `addTask` attempted from a real Clerk session therefore
threw `"User not found" 404`. Downstream, it meant callers could
exercise the `requireRole` + project IDOR checks but never actually reach
the DB write path — so no data exfiltration, but the auth/RBAC semantics
were silently different from what the code reads like.

Note that `workspace.repository.ts` already had a correct implementation
(`where: { clerkId }`); the two copies had drifted.

**Fix:** corrected the `where` clause. Long term, the two copies should
be deduplicated into a single helper.

### 7. Missing leading slash on `POST` task route — **LOW/MEDIUM** (routing)

`task.routes.ts` had:

```ts
router.post(":workspaceId/projects/:projectId/tasks", ...)
```

Missing `/` made the path effectively unmountable on Express 5. Not a
security bug in itself, but it hid the controller fix below behind a
dead route.

**Fix:** added the leading `/`.

### 8. Stray third-party import in `task.controller.ts` — **LOW** (supply chain / build)

```ts
import { resetOriginalContainerCache } from "@excalidraw/excalidraw/types/element/textWysiwyg";
```

`@excalidraw/excalidraw` is not in `package.json`, the import is unused,
and pulling an unrelated drawing library into a backend controller is
clearly an IDE auto-import gone wrong. Beyond breaking `tsc`, a typo on
a package name in a backend `import` is a supply-chain risk (typosquat
packages are a known attack surface on npm).

**Fix:** removed the import.

### 9. `deleteTaskHandler` returned a hardcoded stub — **LOW** (correctness)

The delete handler ignored the repository's return value and always
responded with `{ "id": "TASK_ID" }`. Not a security issue but it hides
real behavior from clients and tests.

**Fix:** return the actual deleted task record.

---

## Items reviewed, nothing to fix

- **Hardcoded secrets / API keys.** No literal secrets in source. All
  Clerk / DB / Redis credentials come from env via a zod schema
  (`src/config/env.ts`). `.env.example` is empty-value only. Local
  `docker-compose.yml` uses `postgres:postgres` which is fine for local
  dev only — do not reuse that password in any deployed environment.
- **SQL injection.** All database access goes through Prisma's
  parameterized query API. No raw SQL, `$queryRawUnsafe`, or string
  interpolation into queries was found.
- **Unvalidated user input.** Every mutating route that accepts a body
  runs it through `validate(zodSchema)`. Path parameters (`:workspaceId`,
  `:projectId`, `:taskId`) are passed to Prisma as-is; Prisma rejects
  malformed cuids, so this is acceptable, but tightening them with
  `z.string().cuid()` would give nicer 400s and is a good follow-up.
- **Exposed debug / admin endpoints.** None found. The only non-JWT route
  is `POST /auth/webhook`, which is verified with `svix` signatures
  against `CLERK_WEBHOOK_SECRET`.
- **Missing authentication checks.** Every route except the signed
  webhook uses `authMiddleware`. Workspace mutation routes go through
  `requireRole` for RBAC. The IDOR fixes above close the remaining
  resource-ownership gap.

---

## Recommended follow-ups (not in this PR)

- **Rate limiting.** `src/middleware/rateLimiter.ts` is an empty file.
  Auth-adjacent endpoints (webhook, member add/remove) should have a
  per-IP / per-user limiter (e.g. `express-rate-limit` + Redis store).
- **Param schemas.** Add `z.string().cuid()` param validation for ids so
  callers get a `400` rather than a Prisma error on garbage input.
- **Deduplicate `findUserByClerkId`.** There are two copies
  (`lib/user.repository.ts` and `modules/workspaces/workspace.repository.ts`)
  and they drifted. Keep one.
- **Dependency pinning.** `@types/node@^25` and `typescript@^6` in
  `apps/api/package.json` are ahead of generally-released versions;
  worth pinning to whatever the deployed runtime actually supports.
- **`npm audit`.** Run in CI on every PR and fail on `high`/`critical`.
  The empty `packages/types` workspace is currently the only thing
  CI runs against.
- **Error responses.** `errorHandler` returns generic 500s for unknown
  errors — good. Consider also stripping stack traces from
  `logger.error` output in production (currently logged in full,
  acceptable if logs are trusted).

---

## Files changed in this PR

```
apps/api/src/app.ts                                   CORS hardening
apps/api/src/config/env.ts                            CORS_ALLOWED_ORIGINS
apps/api/src/lib/user.repository.ts                   findUserByClerkId fix
apps/api/src/middleware/requireAuth.ts                remove dev bypass
apps/api/src/modules/projects/project.controller.ts   pass workspaceId
apps/api/src/modules/projects/project.repository.ts   + findProjectById
apps/api/src/modules/projects/project.service.ts      IDOR guard
apps/api/src/modules/tasks/task.controller.ts         pass workspaceId, remove stray import, fix delete response
apps/api/src/modules/tasks/task.routes.ts             leading-slash fix
apps/api/src/modules/tasks/task.service.ts            IDOR guard
apps/api/src/modules/workspaces/workspace.service.ts  self-removal id-type fix
docs/SECURITY_AUDIT.md                                this report
```
