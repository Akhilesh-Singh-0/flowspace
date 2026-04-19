# label.service

## Overview

The label service owns label creation for a workspace plus the task ↔ label assignment surface. It is the most validation-heavy service in the codebase: every assignment operation walks a cascade of existence / ownership / uniqueness checks before writing.

**Source:** [`apps/api/src/modules/labels/label.service.ts`](../../apps/api/src/modules/labels/label.service.ts)

## Dependencies

| Import | From | Purpose |
|---|---|---|
| `findLabelByName`, `createLabel`, `findLabelById`, `findTaskLabelById`, `assignLabel`, `fetchTaskLabels`, `removeTaskLabel` | `./label.repository` | Label persistence primitives |
| `findTaskById` | `../tasks/task.repository` | Verify task existence and workspace ownership |
| `AppError` | `@/middleware/errorHandler` | Structured domain errors |

## Exports

### `addLabel(workspaceId: string, data: { name: string; color: string }): Promise<Label>`

**Description:** Creates a new label scoped to a workspace.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `workspaceId` | `string` | Parent workspace id |
| `data.name` | `string` | Label name — unique per workspace |
| `data.color` | `string` | Hex color (`#RRGGBB`, enforced by the Zod schema) |

**Returns:** `Promise<Label>` — the newly created label row.

**Errors:**

| Condition | Thrown |
|---|---|
| A label with the same `name` already exists in the workspace | `AppError("Label already exists in this workspace", 409)` |

---

### `assignLabelToTask(workspaceId: string, taskId: string, labelId: string): Promise<TaskLabel>`

**Description:** Attaches an existing label to an existing task. Both the label and the task must belong to the same workspace, and the pairing must not already exist.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `workspaceId` | `string` | Workspace context (both label and task must belong here) |
| `taskId` | `string` | Target task id |
| `labelId` | `string` | Label to assign |

**Returns:** `Promise<TaskLabel>` — the newly created join row.

**Validation cascade (in order):**

1. `findLabelById(labelId)` → must exist.
2. `label.workspaceId === workspaceId` → must match.
3. `findTaskById(taskId)` → must exist.
4. `task.workspaceId === workspaceId` → must match.
5. `findTaskLabelById(taskId, labelId)` → must NOT already exist.
6. `assignLabel(taskId, labelId)` → writes the join row.

**Errors:**

| Condition | Thrown |
|---|---|
| Label does not exist | `AppError("Label does not exist", 404)` |
| Label belongs to a different workspace | `AppError("Label does not belong to this workspace", 400)` |
| Task does not exist | `AppError("Task does not exist", 404)` |
| Task belongs to a different workspace | `AppError("Task does not belong to this workspace", 400)` |
| Task already has this label | `AppError("Label already assigned to task", 409)` |

---

### `getTaskLabels(taskId: string): Promise<TaskLabel[]>`

**Description:** Lists every label currently assigned to a task, with the related `label` row included by the repository.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `taskId` | `string` | Target task id |

**Returns:** `Promise<TaskLabel[]>` — rows from `fetchTaskLabels` (each row includes the nested `label` relation).

**Errors:** None thrown by the service. Prisma errors propagate.

---

### `removeLabelFromTask(taskId: string, labelId: string): Promise<TaskLabel>`

**Description:** Removes a label from a task, returning the deleted join row.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `taskId` | `string` | Target task id |
| `labelId` | `string` | Label to detach |

**Returns:** `Promise<TaskLabel>` — the deleted join row.

**Errors:**

| Condition | Thrown |
|---|---|
| No matching `TaskLabel` row exists | `AppError("Lable doesnt exist", 404)` |

> **Typo callout (source-level):** The error message literally reads `"Lable doesnt exist"` in [`label.service.ts:51`](../../apps/api/src/modules/labels/label.service.ts). The spelling should be corrected to `"Label does not exist"` in a future PR (tracked as a backlog item so doc and code stay aligned). This document preserves the literal message so automated string-matching stays accurate.

## Error summary

| Error | Status | Condition |
|---|---|---|
| `Label already exists in this workspace` | 409 | `addLabel`: duplicate name in workspace |
| `Label does not exist` | 404 | `assignLabelToTask`: `labelId` unknown |
| `Label does not belong to this workspace` | 400 | `assignLabelToTask`: cross-workspace label |
| `Task does not exist` | 404 | `assignLabelToTask`: `taskId` unknown |
| `Task does not belong to this workspace` | 400 | `assignLabelToTask`: cross-workspace task |
| `Label already assigned to task` | 409 | `assignLabelToTask`: duplicate pairing |
| `Lable doesnt exist` (sic) | 404 | `removeLabelFromTask`: pairing not found |

## Usage example

```ts
// POST /workspaces/:workspaceId/labels
const label = await addLabel(req.params.workspaceId, {
  name: "blocker",
  color: "#FF0000",
})

// POST /workspaces/:workspaceId/tasks/:taskId/labels/:labelId
const assignment = await assignLabelToTask(
  req.params.workspaceId,
  req.params.taskId,
  req.params.labelId,
)

// GET /workspaces/:workspaceId/tasks/:taskId/labels
const labels = await getTaskLabels(req.params.taskId)

// DELETE /workspaces/:workspaceId/tasks/:taskId/labels/:labelId
const removed = await removeLabelFromTask(req.params.taskId, req.params.labelId)
```

## Related documentation

- [`docs/services/task.service`](./task.service.md) — task entity this service decorates.
- [`docs/middleware/errorHandler`](../middleware/errorHandler.md) — `AppError` envelope translation.
- [`docs/architecture/database-er`](../architecture/database-er.md) — `Label` and `TaskLabel` tables.
