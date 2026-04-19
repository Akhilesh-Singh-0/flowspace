# `task.repository`

## Overview

Prisma data-access layer for the `Task` model. Tasks live inside projects (which live inside workspaces). This repository exposes the primitives needed by `task.service` — project validation, task CRUD, and lookups — but deliberately keeps each function narrow. Selects project only the minimal fields each call-site needs.

**Source:** [`apps/api/src/modules/tasks/task.repository.ts`](../../apps/api/src/modules/tasks/task.repository.ts)

## Internal Types

```ts
type TaskInput = {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: Date
}
```

Note that `TaskInput` **does not include** `assigneeId` or `creatorId`. Those are passed as separate positional parameters to `createTask` and are resolved upstream (typically from the authenticated user's Clerk ID). Validation lives in `task.schema.ts`.

## Exports

### `findProjectById(projectId)`

Used by the service layer to verify that a project exists and to derive its `workspaceId` before creating a task. The projection is intentionally minimal.

```ts
export const findProjectById = async (
  projectId: string,
) => Promise<{ id: string; workspaceId: string } | null>
```

**Returns** — `{ id, workspaceId }` or `null`.

### `createTask(projectId, workspaceId, creatorId, data)`

Creates a task with a mandatory creator.

```ts
export const createTask = async (
  projectId: string,
  workspaceId: string,
  creatorId: string,
  data: TaskInput,
) => Promise<Task>
```

**Parameters**

| Name          | Type         | Description                                                                          |
| ------------- | ------------ | ------------------------------------------------------------------------------------ |
| `projectId`   | `string`     | Parent project id.                                                                   |
| `workspaceId` | `string`     | Parent workspace id (denormalised for index efficiency — see `schema.prisma`).       |
| `creatorId`   | `string`     | **Required.** Internal `User.id` of the user creating the task. Resolved upstream from `findUserByClerkId`. |
| `data`        | `TaskInput`  | Title + optional status/priority/description/dueDate. Does not include assignee.     |

**Returns** — `Promise<Task>`: the newly-created task row.

**Throws** — Prisma foreign-key errors if `projectId`, `workspaceId`, or `creatorId` do not exist. `Task.creator` uses `onDelete: Restrict`, so creators cannot be removed until their tasks are reassigned.

### `viewTask(projectId)`

Lists tasks in a project with a 6-field projection.

```ts
export const viewTask = async (
  projectId: string,
) => Promise<Array<{
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
}>>
```

**Known limitation.** `assigneeId` and `creatorId` are **not in the select list**. That means the client UI cannot identify who a task is assigned to or who created it directly from the list endpoint — the single-task fetch is required. This is tracked in `Technical-Debt.md`.

### `findTaskById(taskId)`

Minimal projection used by the service layer when checking authorization or resolving a task's context.

```ts
export const findTaskById = async (
  taskId: string,
) => Promise<{
  id: string
  workspaceId: string
  projectId: string
  assigneeId: string | null
} | null>
```

**Returns** — `{ id, workspaceId, projectId, assigneeId }` or `null`.

### `editTask(taskId, data)`

Partial update of a task's core fields.

```ts
export const editTask = async (
  taskId: string,
  data: {
    title?: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    dueDate?: Date
  },
) => Promise<Task>
```

**Known gap.** The `data` argument type **omits `assigneeId`**, and the destructured `data: { ... }` object passed to `prisma.task.update` does **not forward `assigneeId`** even though the Zod schema (`UpdateTaskSchema`) accepts it. Net effect: the `PATCH /workspaces/:workspaceId/tasks/:taskId` endpoint **cannot actually reassign a task today** — the field is silently dropped. Documented only — do not fix here. Tracked in `Technical-Debt.md`.

**Returns** — `Promise<Task>`: the updated task row.

### `removeTask(taskId)`

Deletes a task. Cascades apply: deleting a task cascades to `Comment` and `TaskLabel` rows per the schema.

```ts
export const removeTask = async (
  taskId: string,
) => Promise<Task>
```

**Returns** — `Promise<Task>`: the deleted task row.

**Throws** — Prisma record-not-found error if `taskId` does not exist.

## Related Files

- **Service:** [`apps/api/src/modules/tasks/task.service.ts`](../../apps/api/src/modules/tasks/task.service.ts) — performs RBAC + publishes `task.created/updated/deleted` pubsub events and enqueues `TASK_ASSIGNED` notifications.
- **Controller:** [`apps/api/src/modules/tasks/task.controller.ts`](../../apps/api/src/modules/tasks/task.controller.ts)
- **Schema (Zod):** [`apps/api/src/modules/tasks/task.schema.ts`](../../apps/api/src/modules/tasks/task.schema.ts)
- **Schema (Prisma):** [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma) — `Task`, `TaskStatus`, `TaskPriority`.

## Cross-References

- [`docs/api/README.md`](../api/README.md) — task endpoints.
- [`docs/lib/pubsub-and-queue.md`](../lib/pubsub-and-queue.md) — real-time events published from the service layer.
- [`docs/modules-overview.md`](../modules-overview.md)
