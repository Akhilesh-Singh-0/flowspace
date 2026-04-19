# comment.service

## Overview

The comment service handles comment CRUD on tasks, resolving the Clerk identity of the author to an internal `User.id` at write-time. It is deliberately narrow in scope — no pub/sub, no queues, no RBAC beyond what the route middleware enforces.

**Source:** [`apps/api/src/modules/comments/comment.service.ts`](../../apps/api/src/modules/comments/comment.service.ts)

## Dependencies

| Import | From | Purpose |
|---|---|---|
| `findUserByClerkId` | `@/lib/user.repository` | Resolve Clerk id → internal `User.id` |
| `createComment`, `findTaskById`, `findCommentById`, `viewComment`, `removeComment` | `./comment.repository` | Persistence primitives |
| `AppError` | `@/middleware/errorHandler` | Structured domain errors |

## Exports

### `addComment(clerkId: string, taskId: string, body: string): Promise<Comment>`

**Description:** Creates a comment on a task, attributed to the Clerk user.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `clerkId` | `string` | Clerk id of the author (from `req.user.userId`) |
| `taskId` | `string` | Target task id |
| `body` | `string` | Comment body text |

**Returns:** `Promise<Comment>` — the newly created comment row.

**Errors:**

| Condition | Thrown |
|---|---|
| Clerk user has no corresponding local row | `Error("User not found")` — a raw `Error`, **not** an `AppError` |

> **Inconsistency callout:** Every other service in this codebase throws `AppError` with a status code. `addComment` throws a plain `Error`. The global `errorHandler` treats unrecognized errors as `500 INTERNAL_SERVER_ERROR` rather than the `404` the intent would suggest. Track this alongside the other service-layer inconsistencies in the Technical-Debt backlog.

> **Controller bug (documented — not fixed here):** `createCommentHandler` in [`apps/api/src/modules/comments/comment.controller.ts`](../../apps/api/src/modules/comments/comment.controller.ts) lines 11–12 currently reads `req.params.id` (not `req.params.taskId`) and passes the entire `req.body` object as the `body` argument instead of `req.body.body`. The Zod schema specifies `{ body: string }`, so the intended contract is `addComment(clerkId, taskId, req.body.body)`. Service behavior described in this doc reflects the *intended* contract; until the handler is corrected, runtime behavior will differ.

---

### `getComment(taskId: string): Promise<Comment[]>`

**Description:** Lists every comment on a task.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `taskId` | `string` | Target task id |

**Returns:** `Promise<Comment[]>` — rows from `viewComment`.

**Errors:**

| Condition | Thrown |
|---|---|
| `taskId` does not resolve | `AppError("Task does not exists", 404)` |

---

### `deleteComment(commentId: string): Promise<Comment>`

**Description:** Deletes a comment and returns the removed row.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `commentId` | `string` | Target comment id |

**Returns:** `Promise<Comment>` — the deleted comment row.

**Errors:**

| Condition | Thrown |
|---|---|
| `commentId` does not resolve | `AppError("Comment not found", 404)` |

## Error summary

| Error | Status | Condition |
|---|---|---|
| `Error("User not found")` (raw) | 500 (inadvertent) | `addComment`: Clerk user not mirrored locally |
| `Task does not exists` | 404 | `getComment`: task missing |
| `Comment not found` | 404 | `deleteComment`: comment missing |

## Usage example

```ts
// Intended contract (see controller-bug callout above)
const comment = await addComment(
  req.user.userId,
  req.params.taskId,
  req.body.body,
)

const comments = await getComment(req.params.taskId)
await deleteComment(req.params.commentId)
```

## Related documentation

- [`docs/services/task.service`](./task.service.md) — owns the task entity this service decorates.
- [`docs/middleware/errorHandler`](../middleware/errorHandler.md) — error envelope shape.
