# project.service

## Overview

The project service is a thin wrapper around the project repository. It performs no role checks, no side-effects, and no custom error-mapping — all of that lives either at the route layer (via `requireRole`) or in the repository / `errorHandler` layer. Validation of the incoming body is handled upstream by the `validate(ProjectInput)` middleware.

**Source:** [`apps/api/src/modules/projects/project.service.ts`](../../apps/api/src/modules/projects/project.service.ts)

## Dependencies

| Import | From | Purpose |
|---|---|---|
| `createProject`, `viewProject`, `editProject`, `removeProject` | `./project.repository` | Persistence primitives |
| `AppError` | `@/middleware/errorHandler` | Imported but currently unused — minor unused import noted in source |

## Types

```ts
type ProjectInput = {
  title: string;
  description?: string;
}
```

**Note on title normalization:** The Zod schema `ProjectInput` in `apps/api/src/modules/projects/project.schema.ts` applies `.trim().toLowerCase().min(1).max(100)` to `title`. Because `validate` middleware re-assigns `req.body = schema.parse(req.body)`, titles are already trimmed and lowercased by the time they reach this service.

## Exports

### `addProject(workspaceId: string, data: ProjectInput): Promise<Project>`

**Description:** Creates a project inside a workspace.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `workspaceId` | `string` | Parent workspace id |
| `data.title` | `string` | Project title (trimmed, lowercased, 1–100 chars by the schema) |
| `data.description` | `string \| undefined` | Optional free-text description |

**Returns:** `Promise<Project>` — the newly created project row from `createProject`.

**Errors:** The service throws nothing directly. Any Prisma error propagates to `errorHandler`.

---

### `getProjects(workspaceId: string): Promise<Array<{ id: string; title: string; description: string | null; createdAt: Date }>>`

**Description:** Returns every project in a workspace via `viewProject`.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `workspaceId` | `string` | Parent workspace id |

**Returns:** `Promise<Project[]>` — rows as returned by `viewProject`.

**Errors:** None thrown by the service. Prisma errors propagate.

---

### `updateProject(projectId: string, data: { title?: string; description?: string }): Promise<Project>`

**Description:** Partial update for a project. Any combination of `title` and `description` may be supplied; both optional.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `projectId` | `string` | Target project id |
| `data.title` | `string \| undefined` | New title (lowercased / trimmed by `UpdateProject` schema) |
| `data.description` | `string \| undefined` | New description |

**Returns:** `Promise<Project>` — updated row.

**Errors:** None thrown by the service. If `projectId` is unknown, `editProject` / Prisma will raise the error (typically `P2025`) and `errorHandler` will convert it.

---

### `deleteProject(projectId: string): Promise<Project>`

**Description:** Deletes a project and returns the row that was removed.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `projectId` | `string` | Target project id |

**Returns:** `Promise<Project>` — the deleted project row. `removeProject` returns the row (not a status) so downstream controllers expose it in the `data` field of the response envelope.

**Errors:** None thrown by the service. Prisma errors propagate.

## Validation

Incoming request bodies are validated *before* the service runs:

- `POST /workspaces/:id/projects` → `validate(ProjectInput)` — requires `title`, rejects missing/empty.
- `PATCH /workspaces/:id/projects/:projectId` → `validate(UpdateProject)` — all fields optional.

If validation fails, Zod throws a `ZodError` which `errorHandler` converts to a `400` response with a `fields` map. The service never sees the request.

## Error handling

Because the service performs no explicit throws, error behavior is driven entirely by:

1. Upstream Zod validation (→ `400 VALIDATION_ERROR`).
2. Upstream `requireRole` / `authMiddleware` (→ `401`/`403`/`404` as applicable).
3. Prisma runtime errors (→ `500` for unhandled codes; `409` for `P2002`).

All of these are handled centrally by [`errorHandler`](../middleware/errorHandler.md).

## Usage example

```ts
// POST /workspaces/:id/projects
const project = await addProject(req.params.id, {
  title: req.body.title,          // already lowercased by the schema
  description: req.body.description,
})

// PATCH /workspaces/:id/projects/:projectId
const updated = await updateProject(req.params.projectId, req.body)

// DELETE /workspaces/:id/projects/:projectId
const removed = await deleteProject(req.params.projectId)
```

## Related documentation

- [`docs/middleware/validate`](../middleware/validate.md) — the Zod body validator.
- [`docs/middleware/requireRole`](../middleware/requireRole.md) — RBAC applied at the route layer.
- [`docs/api/README`](../api/README.md) — HTTP endpoint reference.
