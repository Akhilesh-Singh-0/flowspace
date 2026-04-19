# `workspace.repository`

## Overview

Prisma data-access layer for the workspace module. This repository covers:

- Atomic creation of a workspace plus its owner membership (via `prisma.$transaction`).
- Listing workspaces a user belongs to (with their role).
- Member lookup, creation, deletion, and enumeration.
- Owner-count utility used by RBAC checks to prevent the last owner from being removed.

All reads use `select` projections (not full models) so responses stay compact; consumers should treat the returned shapes as opaque — do not expect every Prisma field to be present.

**Source:** [`apps/api/src/modules/workspaces/workspace.repository.ts`](../../apps/api/src/modules/workspaces/workspace.repository.ts)

## Internal Types

### `CreateWorkspaceInput`

```ts
type CreateWorkspaceInput = {
  name: string
  slug: string
}
```

Used by `createWorkspaceWithOwner`. `slug` uniqueness is enforced at the DB level (`@unique` on `Workspace.slug`).

### `TransactionClient`

```ts
type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>
```

This alias exists to give the `tx` parameter inside `prisma.$transaction(async (tx) => { ... })` a concrete type. Prisma's interactive-transaction callback receives a `PrismaClient` with lifecycle/transaction methods stripped; the omitted members are the ones that would be invalid inside a transaction scope. Exporting the alias keeps the function signature readable and re-usable if other repositories need the same transactional callback shape.

## Exports

### `createWorkspaceWithOwner(userId, data)`

Creates a workspace and attaches the caller as its `OWNER` inside a single Prisma transaction.

```ts
export const createWorkspaceWithOwner = async (
  userId: string,
  data: CreateWorkspaceInput,
) => Promise<Workspace>
```

**Parameters**

| Name       | Type                    | Description                                 |
| ---------- | ----------------------- | ------------------------------------------- |
| `userId`   | `string`                | Internal `User.id` of the creator.          |
| `data`     | `CreateWorkspaceInput`  | `{ name, slug }` — slug must be globally unique. |

**Returns** — `Promise<Workspace>`: the newly created workspace row. The owner-member row is created but not returned.

**Throws**

- `PrismaClientKnownRequestError` with code `P2002` if `slug` collides.
- Any error thrown inside the transaction rolls back both inserts atomically.

**Example**

```ts
const ws = await createWorkspaceWithOwner('user_123', {
  name: 'Acme',
  slug: 'acme',
})
```

### `findWorkspacesByUserId(userId)`

Lists every workspace a user is a member of along with their role.

```ts
export const findWorkspacesByUserId = async (
  userId: string,
) => Promise<Array<{
  role: WorkspaceRole
  workspace: { id: string; name: string; slug: string; createdAt: Date }
}>>
```

**Parameters** — `userId`: internal `User.id`.

**Returns** — array of `WorkspaceMember` rows projected to `role` + a nested workspace projection (`id, name, slug, createdAt` — no description, no member count).

**Example**

```ts
const memberships = await findWorkspacesByUserId('user_123')
memberships.forEach((m) => console.log(m.role, m.workspace.slug))
```

### `findWorkspaceMember(userId, workspaceId)`

Looks up a single membership by the composite unique key `userId_workspaceId`.

```ts
export const findWorkspaceMember = async (
  userId: string,
  workspaceId: string,
) => Promise<{ userId: string; workspaceId: string; role: WorkspaceRole } | null>
```

**Returns** — the membership with `userId`, `workspaceId`, and `role` projected, or `null` if the user is not a member.

Used by `requireRole` / `requireMembership` to gate access to workspace-scoped routes.

### `createWorkspaceMember(userId, workspaceId, role)`

Adds a member row with the specified role.

```ts
export const createWorkspaceMember = async (
  userId: string,
  workspaceId: string,
  role: WorkspaceRole,
) => Promise<WorkspaceMember>
```

**Parameters**

| Name          | Type             | Description                                      |
| ------------- | ---------------- | ------------------------------------------------ |
| `userId`      | `string`         | Internal `User.id` of the member being added.    |
| `workspaceId` | `string`         | Target workspace.                                |
| `role`        | `WorkspaceRole`  | `OWNER \| ADMIN \| MEMBER \| VIEWER`.            |

**Returns** — `Promise<WorkspaceMember>` — the full member row including `id`, `joinedAt`.

**Throws** — `P2002` if the user is already a member (`@@unique([userId, workspaceId])`).

### `deleteWorkspaceMember(workspaceId, userId)`

Removes a membership by composite unique key.

```ts
export const deleteWorkspaceMember = async (
  workspaceId: string,
  userId: string,
) => Promise<WorkspaceMember>
```

**Returns** — the deleted row.

**Throws** — Prisma record-not-found error if the membership does not exist. Callers should pre-check with `findWorkspaceMember` or handle the error explicitly.

### `findWorkspaceMembers(workspaceId)`

Lists all members of a workspace with a user-profile projection.

```ts
export const findWorkspaceMembers = async (
  workspaceId: string,
) => Promise<Array<{
  role: WorkspaceRole
  user: { id: string; name: string | null; email: string; avatarUrl: string | null }
}>>
```

Returns `role` + nested `user` (`id, name, email, avatarUrl`). No `joinedAt`, no `userId`/`workspaceId` on the top level.

### `countWorkspaceOwners(workspaceId)`

Returns the number of members with `role = OWNER`.

```ts
export const countWorkspaceOwners = async (
  workspaceId: string,
) => Promise<number>
```

Used by the workspace service to enforce the "at least one owner" invariant when removing or downgrading a member.

**Example**

```ts
if ((await countWorkspaceOwners(workspaceId)) <= 1) {
  throw new AppError('Workspace must have at least one owner', 400)
}
```

## Related Files

- **Service:** [`apps/api/src/modules/workspaces/workspace.service.ts`](../../apps/api/src/modules/workspaces/workspace.service.ts)
- **Controller:** [`apps/api/src/modules/workspaces/workspace.controller.ts`](../../apps/api/src/modules/workspaces/workspace.controller.ts)
- **Schema:** [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma) — `Workspace`, `WorkspaceMember`, `WorkspaceRole`.

## Cross-References

- [`docs/api/README.md`](../api/README.md) — workspace endpoints.
- [`docs/architecture/database-er.md`](../architecture/database-er.md)
- [`docs/modules-overview.md`](../modules-overview.md)
