# workspace.service

## Overview

The workspace service owns creation of workspaces, enumeration of a user's workspaces, and management of workspace membership (add / list / remove). It enforces role-based authorization at the service layer for member operations and guarantees that a workspace can never be left without an `OWNER`.

**Source:** [`apps/api/src/modules/workspaces/workspace.service.ts`](../../apps/api/src/modules/workspaces/workspace.service.ts)

## Dependencies

| Import | From | Purpose |
|---|---|---|
| `createWorkspaceWithOwner`, `findWorkspacesByUserId`, `findWorkspaceMember`, `createWorkspaceMember`, `findWorkspaceMembers`, `deleteWorkspaceMember`, `countWorkspaceOwners` | `./workspace.repository` | All persistence primitives |
| `findUserByClerkId`, `findUserById` | `@/lib/user.repository` | Resolve internal `User.id` values |
| `AppError` | `@/middleware/errorHandler` | Structured domain errors with HTTP status codes |
| `Prisma`, `WorkspaceRole` | `@prisma/client` | Prisma error narrowing and the role enum |

> **Known repository bug (Technical-Debt):** `findUserByClerkId` in `apps/api/src/lib/user.repository.ts` currently executes `prisma.user.findUnique({ where: { id: clerkId } })` — it queries by the internal `User.id` column, not `clerkId`. This doc describes what the service does *given* that behavior. Every call to `findUserByClerkId` below is effectively "look up a user whose internal id equals the provided string" until the repository is fixed.

## Types

```ts
type CreateWorkspaceInput = {
  name: string;
  slug: string;
}
```

`WorkspaceRole` (from `@prisma/client`):

```ts
type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
```

## Exports

### `createWorkspace(userId: string, data: CreateWorkspaceInput): Promise<Workspace>`

**Description:** Creates a new workspace and attaches the caller as `OWNER` in a single transaction (handled by `createWorkspaceWithOwner`).

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `userId` | `string` | Clerk user id (from `req.user.userId`). Resolved to an internal `User.id` before the transaction. |
| `data.name` | `string` | Display name of the workspace |
| `data.slug` | `string` | URL-friendly identifier, unique across workspaces |

**Returns:** `Promise<Workspace>` — the newly created workspace row.

**Errors:**

| Condition | Thrown |
|---|---|
| Caller's `User` row not found | `AppError("User not found", 404)` |
| Slug already taken (`P2002`) | `AppError("Workspace slug already exists", 409)` |

---

### `getUserWorkspaces(userId: string): Promise<Array<{ id: string; name: string; slug: string; createdAt: Date; role: WorkspaceRole }>>`

**Description:** Lists every workspace the caller is a member of, flattened so each row includes the caller's role within that workspace.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `userId` | `string` | Clerk user id |

**Returns:** `Promise<Array<{ id, name, slug, createdAt, role }>>` — flattened from `WorkspaceMember[]` joined with `Workspace`.

**Errors:**

| Condition | Thrown |
|---|---|
| Caller's `User` row not found | `AppError("User not found", 404)` |

---

### `addWorkspaceMember(requesterId: string, workspaceId: string, targetUserId: string, role: WorkspaceRole): Promise<WorkspaceMember>`

**Description:** Invites an existing user to a workspace with an explicit role. Requester must be `OWNER` or `ADMIN` of the workspace.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `requesterId` | `string` | Clerk id of the caller |
| `workspaceId` | `string` | Target workspace id |
| `targetUserId` | `string` | Internal `User.id` of the invitee |
| `role` | `WorkspaceRole` | Role to grant |

**Returns:** `Promise<WorkspaceMember>` — the new membership row.

**Errors:**

| Condition | Thrown |
|---|---|
| Requester's `User` row not found | `AppError("User not found", 404)` |
| Requester is not `OWNER` or `ADMIN` (or not a member at all) | `AppError("Forbidden", 403)` |
| Target user does not exist | `AppError("User does not exist", 404)` |
| Target user is already a member | `AppError("User is already a member", 409)` |

---

### `getWorkspaceMembers(requesterId: string, workspaceId: string): Promise<WorkspaceMember[]>`

**Description:** Returns all members of a workspace. Requester must themselves be a member (any role).

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `requesterId` | `string` | Clerk id of the caller |
| `workspaceId` | `string` | Target workspace id |

**Returns:** `Promise<WorkspaceMember[]>` — raw rows from `findWorkspaceMembers`.

**Errors:**

| Condition | Thrown |
|---|---|
| Requester's `User` row not found | `AppError("User not found", 404)` |
| Requester is not a member of the workspace | `AppError("You are not a member of this workspace", 403)` |

---

### `removeWorkspaceMember(requesterId: string, targetUserId: string, workspaceId: string): Promise<void>`

**Description:** Removes a member from a workspace. Supports self-removal and cross-user removal, with a role-based decision matrix and a guarantee that the last `OWNER` can never be removed.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `requesterId` | `string` | Clerk id of the caller |
| `targetUserId` | `string` | Internal `User.id` of the member being removed |
| `workspaceId` | `string` | Target workspace id |

**Returns:** `Promise<void>` — resolves once the membership row is deleted.

**Decision matrix:**

| Scenario | Behavior |
|---|---|
| Self-removal, role is `ADMIN` / `MEMBER` / `VIEWER` | Allowed unconditionally |
| Self-removal, role is `OWNER` | Allowed only if not the last `OWNER` (else `400`) |
| Requester is `MEMBER` or `VIEWER`, target is someone else | `403` Forbidden |
| Requester is `ADMIN`, target is `OWNER` or `ADMIN` | `403` Admin cannot remove owner or admin |
| Requester is `ADMIN`, target is `MEMBER` / `VIEWER` | Allowed |
| Requester is `OWNER`, target is any role | Allowed; if target is `OWNER`, last-owner guard runs |

**Errors:**

| Condition | Thrown |
|---|---|
| Requester's `User` row not found | `AppError("User not found", 404)` |
| Requester is not a member | `AppError("Requester is not part of workspace", 403)` |
| Target is not a member | `AppError("Target user is not member of workspace", 404)` |
| Remove-self-as-last-OWNER, or remove-other-OWNER-as-last-OWNER | `AppError("Cannot remove the last owner", 400)` |
| Requester is `MEMBER`/`VIEWER` removing someone else | `AppError("Not authorized", 403)` |
| Admin attempting to remove `OWNER` or `ADMIN` | `AppError("Admin cannot remove owner or admin", 403)` |

## Private helpers

### `ensureNotLastOwner(workspaceId: string): Promise<void>`

Counts current owners via `countWorkspaceOwners`; throws `AppError("Cannot remove the last owner", 400)` when exactly one remains. Used by `removeWorkspaceMember`.

## Error summary

| Error | Status | Condition |
|---|---|---|
| `User not found` | 404 | Caller's internal `User` row is missing |
| `User does not exist` | 404 | Target user row is missing (add-member) |
| `Target user is not member of workspace` | 404 | Target has no `WorkspaceMember` row |
| `Workspace slug already exists` | 409 | Slug unique-constraint violation on create |
| `User is already a member` | 409 | Duplicate membership on add |
| `Cannot remove the last owner` | 400 | Last-owner safety guard tripped |
| `Forbidden` | 403 | Add-member: requester is not OWNER/ADMIN |
| `You are not a member of this workspace` | 403 | List-members: requester has no membership |
| `Requester is not part of workspace` | 403 | Remove: requester has no membership |
| `Not authorized` | 403 | Remove: MEMBER/VIEWER trying to remove someone else |
| `Admin cannot remove owner or admin` | 403 | Remove: ADMIN targeting OWNER/ADMIN |

## Usage example

```ts
// POST /workspaces
const workspace = await createWorkspace(req.user.userId, {
  name: "Acme HQ",
  slug: "acme-hq",
})

// GET /workspaces
const workspaces = await getUserWorkspaces(req.user.userId)

// POST /workspaces/:workspaceId/members
const membership = await addWorkspaceMember(
  req.user.userId,
  req.params.workspaceId,
  req.body.targetUserId,
  req.body.role,
)
```

## Related documentation

- [`docs/middleware/requireRole`](../middleware/requireRole.md) — the request-level RBAC used upstream.
- [`docs/middleware/errorHandler`](../middleware/errorHandler.md) — how `AppError` is translated to JSON.
- [`docs/architecture/database-er`](../architecture/database-er.md) — `Workspace`, `WorkspaceMember`, and `User` schemas.
