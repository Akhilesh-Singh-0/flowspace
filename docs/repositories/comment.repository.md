# `comment.repository`

## Overview

Prisma data-access layer for the `Comment` model. Comments belong to a `Task` and have a single `author` (a `User`). Creation and list queries eagerly include a minimal author projection so the API can render comment threads in one round-trip.

**Source:** [`apps/api/src/modules/comments/comment.repository.ts`](../../apps/api/src/modules/comments/comment.repository.ts)

## Duplication Note

This file redefines `findTaskById` with a different projection than the one in `task.repository` (here it selects `{ id, projectId }`; the task repo selects `{ id, workspaceId, projectId, assigneeId }`). Having two nearly-identical helpers in two modules is a mild duplication; a future refactor should centralise the helper (for example, into a shared `@/lib/task.repository`) and parameterise the projection. Tracked in `Technical-Debt.md`.

## Exports

### `findTaskById(taskId)`

Minimal task lookup used by the comment service to verify the target task exists and to derive the project id for RBAC.

```ts
export const findTaskById = async (
  taskId: string,
) => Promise<{ id: string; projectId: string } | null>
```

**Returns** — `{ id, projectId }` or `null`. Only 2 fields are selected — this is deliberate: the comment module does not need `workspaceId` (it derives it from the project) or `assigneeId`.

### `createComment(taskId, authorId, body)`

Creates a comment with the author embedded in the response.

```ts
export const createComment = async (
  taskId: string,
  authorId: string,
  body: string,
) => Promise<Comment & {
  author: { id: string; name: string | null; avatarUrl: string | null }
}>
```

**Parameters**

| Name       | Type     | Description                                         |
| ---------- | -------- | --------------------------------------------------- |
| `taskId`   | `string` | The task being commented on.                        |
| `authorId` | `string` | Internal `User.id` of the comment author.           |
| `body`     | `string` | Comment body (validation enforced upstream by `CreateCommentSchema`). |

**Returns** — the full `Comment` row with an `author` relation included (`id`, `name`, `avatarUrl` — note: no email, consistent with public-profile exposure).

**Throws** — Prisma foreign-key errors if `taskId` or `authorId` do not exist. Both FKs cascade on delete per `schema.prisma`.

### `viewComment(taskId)`

Lists all comments on a task with author included.

```ts
export const viewComment = async (
  taskId: string,
) => Promise<Array<Comment & {
  author: { id: string; name: string | null; avatarUrl: string | null }
}>>
```

**Returns** — full `Comment` rows (including `id`, `body`, `createdAt`, `updatedAt`, `taskId`, `authorId`) each with nested `author`. No pagination is applied — all comments on the task are returned.

### `findCommentById(commentId)`

Minimal comment lookup used to confirm a comment exists and to derive its `taskId` for RBAC (the service walks `comment → task → project → workspace` to verify membership).

```ts
export const findCommentById = async (
  commentId: string,
) => Promise<{ id: string; taskId: string } | null>
```

**Returns** — `{ id, taskId }` or `null`.

### `removeComment(commentId)`

Deletes a comment. Authorization (author-only, or workspace admin/owner) is enforced by the service layer, not this repository.

```ts
export const removeComment = async (
  commentId: string,
) => Promise<Comment>
```

**Returns** — the deleted `Comment` row (without the author include).

**Throws** — Prisma record-not-found error if `commentId` does not exist.

## Related Files

- **Service:** [`apps/api/src/modules/comments/comment.service.ts`](../../apps/api/src/modules/comments/comment.service.ts)
- **Controller:** [`apps/api/src/modules/comments/comment.controller.ts`](../../apps/api/src/modules/comments/comment.controller.ts)
- **Schema (Zod):** [`apps/api/src/modules/comments/comment.schema.ts`](../../apps/api/src/modules/comments/comment.schema.ts)
- **Schema (Prisma):** [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma) — `Comment` model.

## Cross-References

- [`docs/api/README.md`](../api/README.md) — comment endpoints.
- [`docs/repositories/task.repository.md`](./task.repository.md) — contains a differently-projected `findTaskById`.
- [`docs/modules-overview.md`](../modules-overview.md)
