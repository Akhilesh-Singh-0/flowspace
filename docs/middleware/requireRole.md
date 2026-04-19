# requireRole

## Overview

`requireRole` is a higher-order middleware factory that verifies the caller is a member of the workspace targeted by the request **and** holds one of the allowed roles. It is the primary workspace-RBAC enforcement point — services do not perform these checks themselves for project/task/label/comment routes.

**Source:** [`apps/api/src/middleware/requireRole.ts`](../../apps/api/src/middleware/requireRole.ts)

## Dependencies

| Import | From | Purpose |
|---|---|---|
| `findWorkspaceMember` | `@/modules/workspaces/workspace.repository` | Fetch the `WorkspaceMember` row for the caller |
| `findUserByClerkId` | `@/lib/user.repository` | Resolve Clerk id → internal `User.id` |
| `WorkspaceRole` | `@prisma/client` | Role enum: `'OWNER' \| 'ADMIN' \| 'MEMBER' \| 'VIEWER'` |
| `AppError` | `./errorHandler` | Structured domain errors |

## Exports

### `requireRole(...roles: WorkspaceRole[]): RequestHandler`

**Signature:**

```ts
export const requireRole: (...roles: WorkspaceRole[]) => RequestHandler
```

**Input:** Varargs list of allowed `WorkspaceRole` values.

**Returns:** A standard Express middleware `(req, res, next) => void`.

**Usage example:**

```ts
router.post(
  "/workspaces/:workspaceId/labels",
  authMiddleware,
  requireRole("OWNER", "ADMIN"),
  validate(CreateLabel),
  createLabelHandler,
)
```

## Behavior

Each call to the returned middleware runs five steps:

1. **Read caller identity.** `req.user!.userId` — the Clerk id populated by [`authMiddleware`](./requireAuth.md). `requireRole` must be mounted after `authMiddleware` or this will throw.
2. **Read the workspace id param.** `req.params.workspaceId || req.params.id` — a dual-key fallback. See the subsection below.
3. **Resolve internal user.** `findUserByClerkId(requesterId)`; on miss, throws `AppError("User not found", 404)`.
4. **Look up membership.** `findWorkspaceMember(dbUser.id, workspaceId)`; on miss, throws `AppError("User is not member of this workspace", 404)`.
5. **Check role.** If `workspaceMember.role` is not in `roles`, throws `AppError("Forbidden", 403)`. Otherwise calls `next()`.

All thrown errors are caught by the local `try/catch` and forwarded via `next(error)`, which reaches the global [`errorHandler`](./errorHandler.md).

### The `workspaceId || id` fallback

The projects router (`project.routes.ts`) is mounted under `/workspaces/:id/projects/...` rather than `/workspaces/:workspaceId/...` because the route reuses the existing `:id` segment from the parent. Every other workspace-scoped router uses the explicit `:workspaceId` name. The fallback expression supports both shapes so the same middleware works everywhere:

```ts
const workspaceId = (req.params.workspaceId || req.params.id) as string
```

If a future route defines *neither* param, `workspaceId` is `undefined` and `findWorkspaceMember` returns null, yielding a `404 User is not member of this workspace` — not an obvious diagnostic. Make sure every route that wires `requireRole` also exposes one of the two param names.

## Common failure modes

| Scenario | Outcome |
|---|---|
| Middleware mounted before `authMiddleware` | `req.user` is `undefined`; non-null assertion crashes → `500`. |
| Route path has no `:workspaceId` or `:id` param | Resolves as membership-not-found → `404`. |
| Caller's Clerk id has no local `User` row | `404 User not found`. |
| Caller is not a member of the workspace | `404 User is not member of this workspace`. |
| Caller is a member but holds a role not in `roles` | `403 Forbidden`. |

### Known repository bug (Technical-Debt)

`findUserByClerkId` in `apps/api/src/lib/user.repository.ts` currently queries `prisma.user.findUnique({ where: { id: clerkId } })`, i.e. by internal `User.id` instead of `clerkId`. Until this is corrected, `requireRole` effectively resolves "Clerk id" as "internal User id" — in development mode the injected id is `"test-user-1"`, which must correspond to the internal id for any workspace membership check to succeed.

## Error response shapes

All failures become the standard envelope emitted by `errorHandler`:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "APP_ERROR",
    "message": "Forbidden"
  },
  "requestId": "..."
}
```

Status codes by message:

| Status | `error.message` | Cause |
|---|---|---|
| 404 | `User not found` | Internal `User` row missing |
| 404 | `User is not member of this workspace` | No `WorkspaceMember` row |
| 403 | `Forbidden` | Membership exists, role disallowed |

## Cross-references

- [`docs/middleware/requireAuth`](./requireAuth.md) — must run before `requireRole`.
- [`docs/services/workspace.service`](../services/workspace.service.md) — the service-layer RBAC for workspace add/remove operations (separate from `requireRole`).
- [`docs/middleware/errorHandler`](./errorHandler.md) — error envelope translation.
