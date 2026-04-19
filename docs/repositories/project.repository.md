# `project.repository`

## Overview

Prisma data-access layer for the `Project` model. A project belongs to a single workspace; all queries here are scoped by `workspaceId` or `projectId` and do not fan out into tasks, comments, or labels.

**Source:** [`apps/api/src/modules/projects/project.repository.ts`](../../apps/api/src/modules/projects/project.repository.ts)

## Internal Types

```ts
type ProjectInput = {
  title: string
  description?: string
}
```

Used as the creation payload. Validation (1–200 chars on `title`, etc.) is enforced by `project.schema.ts` upstream — the repository trusts its caller.

## Naming Convention Note

Exports in this file use the verbs `view`, `edit`, and `remove`:

- `viewProject` (list)
- `editProject` (update)
- `removeProject` (delete)

Every other repository in the codebase uses `find`/`findMany` for reads, `update` for writes, and `delete` for removals (e.g. `workspace.repository`, `task.repository`). This inconsistency is cosmetic and has no behavioural impact; a future PR may rename the exports for consistency. Tracked in `Technical-Debt.md`.

## Exports

### `createProject(workspaceId, data)`

Creates a project inside a workspace.

```ts
export const createProject = async (
  workspaceId: string,
  data: ProjectInput,
) => Promise<Project>
```

**Parameters**

| Name               | Type           | Description                                 |
| ------------------ | -------------- | ------------------------------------------- |
| `workspaceId`      | `string`       | Parent workspace id.                        |
| `data.title`       | `string`       | Project title (validated upstream).         |
| `data.description` | `string \| undefined` | Optional long-form description.     |

**Returns** — `Promise<Project>`: the full Prisma `Project` model.

**Throws** — Prisma foreign-key error if `workspaceId` does not exist.

### `viewProject(workspaceId)`

Lists all projects in a workspace.

```ts
export const viewProject = async (
  workspaceId: string,
) => Promise<Array<{
  id: string
  title: string
  description: string | null
  createdAt: Date
}>>
```

**Returns** — an array of projects projected to 4 fields only: `id`, `title`, `description`, `createdAt`. `updatedAt` and `workspaceId` are **intentionally not selected**. Consumers needing richer data should fetch individual projects separately.

### `editProject(projectId, data)`

Partial update of a project's `title` and/or `description`.

```ts
export const editProject = async (
  projectId: string,
  data: { title?: string; description?: string },
) => Promise<Project>
```

**Parameters**

| Name    | Type                                         | Description                      |
| ------- | -------------------------------------------- | -------------------------------- |
| `projectId` | `string`                                 | Target project id.               |
| `data`  | `{ title?: string; description?: string }`   | Only provided fields are updated; `undefined` fields are passed through to Prisma and become no-ops on that column. |

**Returns** — `Promise<Project>`: the updated full Prisma `Project` model.

**Throws** — Prisma record-not-found error if `projectId` does not exist.

### `removeProject(projectId)`

Deletes a project. Cascades apply per the schema (`Project → Task` uses `onDelete: Cascade` in `Task`, so deleting a project also deletes its tasks).

```ts
export const removeProject = async (
  projectId: string,
) => Promise<Project>
```

**Returns** — `Promise<Project>`: the deleted row.

**Throws** — Prisma record-not-found error if `projectId` does not exist.

## Related Files

- **Service:** [`apps/api/src/modules/projects/project.service.ts`](../../apps/api/src/modules/projects/project.service.ts) — performs membership/role checks before hitting this repo.
- **Controller:** [`apps/api/src/modules/projects/project.controller.ts`](../../apps/api/src/modules/projects/project.controller.ts)
- **Schema (Zod):** [`apps/api/src/modules/projects/project.schema.ts`](../../apps/api/src/modules/projects/project.schema.ts)
- **Schema (Prisma):** [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma) — `Project` model.

## Cross-References

- [`docs/api/README.md`](../api/README.md) — project endpoints.
- [`docs/modules-overview.md`](../modules-overview.md)
