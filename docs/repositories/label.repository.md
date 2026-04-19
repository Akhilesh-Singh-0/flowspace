# `label.repository`

## Overview

Prisma data-access layer for `Label` (workspace-scoped) and `TaskLabel` (the join table connecting tasks to labels). Labels are reusable within a workspace; the same label (by name) cannot be created twice in the same workspace.

**Source:** [`apps/api/src/modules/labels/label.repository.ts`](../../apps/api/src/modules/labels/label.repository.ts)

## Schema Recap

- `Label` has a composite unique `@@unique([workspaceId, name])` exposed by Prisma as the composite unique key `workspaceId_name`.
- `TaskLabel` has a composite primary key `@@id([taskId, labelId])` exposed by Prisma as `taskId_labelId`.
- Both `Task` and `Label` cascade-delete into `TaskLabel`, so removing a task or label automatically removes its join rows.

## Exports

### `findLabelByName(workspaceId, name)`

Lookup by the composite unique `(workspaceId, name)` — used when deciding whether to reuse an existing label or create a new one.

```ts
export const findLabelByName = async (
  workspaceId: string,
  name: string,
) => Promise<Label | null>
```

**Returns** — the full `Label` row (`id, workspaceId, name, color, createdAt, updatedAt`) or `null`.

### `createLabel(workspaceId, name, color)`

Creates a workspace label.

```ts
export const createLabel = async (
  workspaceId: string,
  name: string,
  color: string,
) => Promise<Label>
```

**Parameters**

| Name          | Type     | Description                                          |
| ------------- | -------- | ---------------------------------------------------- |
| `workspaceId` | `string` | Parent workspace id.                                 |
| `name`        | `string` | Unique within the workspace (1–50 chars upstream).   |
| `color`       | `string` | Hex colour `#RRGGBB` — required, validated upstream. |

**Returns** — `Promise<Label>`: the newly created label row.

**Throws** — `P2002` if `(workspaceId, name)` already exists.

### `findLabelById(labelId)`

Minimal lookup used to confirm a label exists and derive its `workspaceId` for RBAC checks.

```ts
export const findLabelById = async (
  labelId: string,
) => Promise<{ id: string; workspaceId: string } | null>
```

**Returns** — `{ id, workspaceId }` or `null`.

### `findTaskLabelById(taskId, labelId)`

Checks whether a specific task-label link exists (using the `taskId_labelId` composite unique).

```ts
export const findTaskLabelById = async (
  taskId: string,
  labelId: string,
) => Promise<TaskLabel | null>
```

**Returns** — the `TaskLabel` row (`taskId, labelId, assignedAt`) or `null`. Used to make `assignLabel` idempotent from the service layer.

### `assignLabel(taskId, labelId)`

Links a label to a task by inserting a `TaskLabel` row.

```ts
export const assignLabel = async (
  taskId: string,
  labelId: string,
) => Promise<TaskLabel>
```

**Returns** — `Promise<TaskLabel>`: the newly created join row.

**Throws** — Prisma unique violation if the link already exists (`@@id([taskId, labelId])` is the PK and enforces uniqueness). Callers should either pre-check with `findTaskLabelById` or handle the error.

### `fetchTaskLabels(taskId)`

Lists all labels attached to a task with a 3-field projection on the label relation.

```ts
export const fetchTaskLabels = async (
  taskId: string,
) => Promise<Array<TaskLabel & {
  label: { id: string; name: string; color: string }
}>>
```

**Returns** — `TaskLabel` rows each including a nested `label` projection (`id, name, color`). `workspaceId` is not included on the nested label — consumers who need it can derive it via the parent task's workspace.

### `removeTaskLabel(taskId, labelId)`

Removes a task-label link by composite PK.

```ts
export const removeTaskLabel = async (
  taskId: string,
  labelId: string,
) => Promise<TaskLabel>
```

**Returns** — the deleted `TaskLabel` row.

**Throws** — Prisma record-not-found error if the link does not exist.

## Related Files

- **Service:** [`apps/api/src/modules/labels/label.service.ts`](../../apps/api/src/modules/labels/label.service.ts)
- **Controller:** [`apps/api/src/modules/labels/label.controller.ts`](../../apps/api/src/modules/labels/label.controller.ts)
- **Schema (Zod):** [`apps/api/src/modules/labels/label.schema.ts`](../../apps/api/src/modules/labels/label.schema.ts)
- **Schema (Prisma):** [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma) — `Label`, `TaskLabel`.

## Cross-References

- [`docs/api/README.md`](../api/README.md) — label endpoints.
- [`docs/modules-overview.md`](../modules-overview.md)
