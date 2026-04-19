# task.service

## Overview

The task service is the business-logic + side-effects orchestrator for task CRUD. Alongside persistence, every write broadcasts a workspace event through Redis pub/sub (consumed by the WebSocket layer) and, when a task is assigned, enqueues a `TASK_ASSIGNED` notification job on BullMQ. It is the most integrated service in the API.

**Source:** [`apps/api/src/modules/tasks/task.service.ts`](../../apps/api/src/modules/tasks/task.service.ts)

## Dependencies

| Import | From | Purpose |
|---|---|---|
| `findProjectById`, `createTask`, `viewTask`, `findTaskById`, `editTask`, `removeTask` | `./task.repository` | Task persistence primitives |
| `findUserByClerkId` | `@/lib/user.repository` | Resolve Clerk id → internal `User.id` for `creatorId` |
| `publish` | `@/lib/pubsub` | Broadcast events to the `workspace-events` Redis channel |
| `addNotificationJob` | `@/lib/queue` | Enqueue `TASK_ASSIGNED` jobs on BullMQ |
| `AppError` | `@/middleware/errorHandler` | Structured domain errors |
| `TaskStatus`, `TaskPriority` | `@prisma/client` | Prisma enums |

## Types

```ts
type TaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assigneeId?: string;
}
```

Relevant Prisma enums (from `schema.prisma`):

```ts
type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
```

## Exports

### `addTask(creatorId: string, projectId: string, data: TaskInput): Promise<Task>`

**Description:** Creates a task inside a project, publishes a `task.created` pub/sub event, and optionally enqueues a `TASK_ASSIGNED` notification job.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `creatorId` | `string` | Clerk id of the creator (from `req.user.userId`) |
| `projectId` | `string` | Parent project id |
| `data` | `TaskInput` | Task fields |

**Returns:** `Promise<Task>` — the newly created task row.

**Side effects (in order):**

1. `publish("workspace-events", { type: "task.created", workspaceId, task })`.
2. If `data.assigneeId` is set: `addNotificationJob({ type: "TASK_ASSIGNED", taskId, userId: assigneeId, workspaceId })`.

**Errors:**

| Condition | Thrown |
|---|---|
| `projectId` does not resolve | `AppError("Project does not exist", 404)` |
| Creator's `User` row not found | `AppError("User not found", 404)` |

---

### `getTask(projectId: string): Promise<Task[]>`

**Description:** Returns every task within a project.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `projectId` | `string` | Parent project id |

**Returns:** `Promise<Task[]>` — rows returned by `viewTask`.

**Errors:**

| Condition | Thrown |
|---|---|
| `projectId` does not resolve | `AppError("Project does not exist", 404)` |

---

### `updateTask(taskId: string, data: Partial<TaskInput>): Promise<Task>`

**Description:** Partially updates a task, publishes a `task.updated` event, and enqueues a `TASK_ASSIGNED` job when the assignee actually changes.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `taskId` | `string` | Target task id |
| `data` | `Partial<TaskInput>` | Fields to update (any subset of `TaskInput`) |

**Returns:** `Promise<Task>` — updated task row.

**Side effects (in order):**

1. `publish("workspace-events", { type: "task.updated", workspaceId, task: updatedTask })`.
2. If `data.assigneeId` is set **and** differs from the previous `task.assigneeId`: `addNotificationJob({ type: "TASK_ASSIGNED", taskId, userId: assigneeId, workspaceId })`.

**Errors:**

| Condition | Thrown |
|---|---|
| `data` has zero keys | `AppError("No fields provided for update", 400)` |
| `taskId` does not resolve | `AppError("Task not found", 404)` |

---

### `deleteTask(taskId: string): Promise<void>`

**Description:** Deletes a task and broadcasts a `task.deleted` event.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `taskId` | `string` | Target task id |

**Returns:** `Promise<void>`.

**Side effects:**

1. `publish("workspace-events", { type: "task.deleted", workspaceId, taskId })`.

The delete payload carries **only** `taskId` (not the full task), because the row has already been removed before publish. Subscribers must treat `task.deleted` differently from `task.updated`.

**Errors:**

| Condition | Thrown |
|---|---|
| `taskId` does not resolve | `AppError("Task not found", 404)` |

## Side-effect summary

| Service method | Pub/sub event | Queue job |
|---|---|---|
| `addTask` | `task.created` with `{ workspaceId, task }` | `TASK_ASSIGNED` when `assigneeId` present |
| `updateTask` | `task.updated` with `{ workspaceId, task: updatedTask }` | `TASK_ASSIGNED` when `assigneeId` changed |
| `deleteTask` | `task.deleted` with `{ workspaceId, taskId }` | — |
| `getTask` | — | — |

All pub/sub traffic flows through the single `workspace-events` Redis channel; the WebSocket layer fans it out per-workspace. All notification jobs use the `addNotificationJob` entrypoint on the shared BullMQ queue.

## Error handling

The service emits `AppError` instances for expected domain failures. Unexpected Prisma or runtime errors propagate to `errorHandler`, which emits the standard JSON envelope with a `500` / `409` / matching status code.

## Usage example

```ts
// POST /workspaces/:workspaceId/projects/:projectId/tasks
const task = await addTask(req.user.userId, req.params.projectId, {
  title: "Ship onboarding flow",
  priority: "HIGH",
  assigneeId: req.body.assigneeId,  // triggers TASK_ASSIGNED job
})

// PATCH /workspaces/:workspaceId/tasks/:taskId
const updated = await updateTask(req.params.taskId, { status: "IN_REVIEW" })
// → publishes task.updated; no job unless assigneeId also changes
```

## Related documentation

- [`docs/services/project.service`](./project.service.md) — the project lookup the service depends on.
- [`docs/middleware/errorHandler`](../middleware/errorHandler.md) — `AppError` → HTTP translation.
- [`docs/api/README`](../api/README.md) — HTTP surface for tasks.
