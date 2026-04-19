# flowspace API Documentation

Complete REST API reference for **flowspace** — a project management backend covering workspaces, role-based access control, projects, tasks, comments, labels, and a Clerk-powered auth webhook.

**Base URL:** `http://localhost:3000`
**API Version:** `0.0.1` (tracked via `apps/api/package.json`)
**Total Endpoints:** 21
**Resources:** 6 (auth, workspaces, projects, tasks, comments, labels)

---

## Authentication

Clerk JWT Bearer tokens are verified via `@clerk/backend`'s `verifyToken` function inside the `authMiddleware` exported from `apps/api/src/middleware/requireAuth.ts`. Every protected route is gated by that middleware, and the authenticated identity is attached to the request as `req.user = { userId: string }` (the `userId` value is `verified.sub` from the decoded JWT). User identity is synced from Clerk via a Svix-verified webhook at `POST /auth/webhook`, so the first time a user signs up in Clerk they are provisioned in the flowspace database automatically.

Send your Clerk session JWT on every protected request:

```
Authorization: Bearer <CLERK_JWT>
```

**Curl example:**

```bash
curl -H "Authorization: Bearer $CLERK_JWT" http://localhost:3000/workspaces
```

**Python example:**

```python
import requests
requests.get(
    'http://localhost:3000/workspaces',
    headers={'Authorization': f'Bearer {clerk_jwt}'}
)
```

Example authorization header:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

> **Development-mode short-circuit:** When `NODE_ENV=development`, `authMiddleware` (in `apps/api/src/middleware/requireAuth.ts`) bypasses Clerk JWT verification entirely and injects `req.user = { userId: "test-user-1" }` on every request. This exists to simplify local development. **Never** run the API with `NODE_ENV=development` in production.

---

## Authorization (RBAC)

Membership in a workspace carries one of four roles:

| Role | Can read? | Can create tasks/comments? | Can manage projects/labels? | Can manage members? |
|---|---|---|---|---|
| `OWNER` | Yes | Yes | Yes | Yes |
| `ADMIN` | Yes | Yes | Yes | Yes |
| `MEMBER` | Yes | Yes | No | No |
| `VIEWER` | Yes | No | No | No |

Role is enforced in the service layer via the `requireRole(...)` middleware. Failed checks return `403`.

---

## Rate Limiting

A stub file exists at `apps/api/src/middleware/rateLimiter.ts` but it is currently empty — rate limiting is NOT implemented. Tracked in Technical-Debt.md.

---

## Pagination, Filtering, and Sorting

A file exists at `apps/api/src/utils/pagination.ts` but it is currently empty — pagination is NOT implemented. No endpoints accept `?page=` / `?pageSize=` query parameters today. Tracked in Technical-Debt.md.

---

## Response Envelope

All successful responses are wrapped in a universal envelope produced by the controller layer (`apps/api/src/modules/*/*.controller.ts`). There are two shapes:

```json
{
  "success": true,
  "data": <payload>
}
```

```json
{
  "success": true,
  "message": "..."
}
```

The `message`-only variant is used by `removeWorkspaceMemberHandler` (endpoint §6). Every other endpoint returns `{ success, data }`.

---

## Common Response Codes

| Status | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created |
| `400 Bad Request` | Zod validation failure (emitted by `errorHandler` as `VALIDATION_ERROR`) |
| `401 Unauthorized` | Clerk JWT missing or invalid (emitted by `authMiddleware` as `UNAUTHORIZED` or `TOKEN_EXPIRED`) |
| `403 Forbidden` | RBAC check failed via `requireRole` |
| `404 Not Found` | Resource does not exist or caller has no access |
| `409 Conflict` | Unique constraint violation (emitted as `CONFLICT`, e.g. duplicate workspace slug, duplicate label name per workspace) |
| `500 Internal Server Error` | Unhandled server error (emitted as `INTERNAL_SERVER_ERROR` by `errorHandler` middleware) |

All errors return JSON using the envelope produced by `apps/api/src/middleware/errorHandler.ts`:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "fields": { "title": "Required" }
  },
  "requestId": "uuid-v4"
}
```

Error `code` values currently emitted:

| Code | HTTP Status | Source |
|---|---|---|
| `VALIDATION_ERROR` | `400` | `errorHandler` — any `ZodError` |
| `CONFLICT` | `409` | `errorHandler` — Prisma `P2002` unique constraint violation |
| `APP_ERROR` | (varies per `AppError.statusCode`) | `errorHandler` — thrown `AppError` instances |
| `INTERNAL_SERVER_ERROR` | `500` | `errorHandler` — catch-all |
| `UNAUTHORIZED` | `401` | `authMiddleware` — missing / invalid JWT |
| `TOKEN_EXPIRED` | `401` | `authMiddleware` — expired Clerk JWT |

The `fields` property is only populated for `VALIDATION_ERROR` responses and contains a `{ "path.to.field": "message" }` map derived from the Zod issue list.

---

## Endpoint Summary

| # | Method | Path | Auth | Role |
|---|---|---|---|---|
| 1 | POST | `/auth/webhook` | Svix signature | — |
| 2 | POST | `/workspaces` | JWT | Any authenticated user |
| 3 | GET | `/workspaces` | JWT | Any authenticated user |
| 4 | POST | `/workspaces/:workspaceId/members` | JWT | OWNER/ADMIN |
| 5 | GET | `/workspaces/:workspaceId/members` | JWT | All roles |
| 6 | DELETE | `/workspaces/:workspaceId/members/:userId` | JWT | OWNER/ADMIN |
| 7 | POST | `/workspaces/:id/projects` | JWT | OWNER/ADMIN |
| 8 | GET | `/workspaces/:id/projects` | JWT | All roles |
| 9 | PATCH | `/workspaces/:id/projects/:projectId` | JWT | OWNER/ADMIN |
| 10 | DELETE | `/workspaces/:id/projects/:projectId` | JWT | OWNER/ADMIN |
| 11 | POST | `/workspaces/:workspaceId/projects/:projectId/tasks` | JWT | OWNER/ADMIN/MEMBER |
| 12 | GET | `/workspaces/:workspaceId/projects/:projectId/tasks` | JWT | All roles |
| 13 | PATCH | `/workspaces/:workspaceId/tasks/:taskId` | JWT | OWNER/ADMIN/MEMBER |
| 14 | DELETE | `/workspaces/:workspaceId/tasks/:taskId` | JWT | OWNER/ADMIN/MEMBER |
| 15 | POST | `/workspaces/:workspaceId/tasks/:taskId/comments` | JWT | All roles |
| 16 | GET | `/workspaces/:workspaceId/tasks/:taskId/comments` | JWT | All roles |
| 17 | DELETE | `/workspaces/:workspaceId/tasks/:taskId/comments/:commentId` | JWT | Author or OWNER/ADMIN |
| 18 | POST | `/workspaces/:workspaceId/labels` | JWT | OWNER/ADMIN |
| 19 | POST | `/workspaces/:workspaceId/tasks/:taskId/labels` | JWT | OWNER/ADMIN |
| 20 | GET | `/workspaces/:workspaceId/tasks/:taskId/labels` | JWT | All roles |
| 21 | DELETE | `/workspaces/:workspaceId/tasks/:taskId/labels/:labelId` | JWT | OWNER/ADMIN |

---

## Auth

### 1. POST /auth/webhook

Clerk user sync endpoint. Currently handles only `user.created` (syncs the new user into PostgreSQL via `syncClerkUser`). `user.updated` and `user.deleted` events are accepted with `200 OK` but the controller performs no action — tracked in Technical-Debt.md. See `apps/api/src/modules/auth/auth.controller.ts`. Payloads are verified using Svix with the `CLERK_WEBHOOK_SECRET`. Must be mounted with the `express.raw` body parser (already configured in `apps/api/src/app.ts`).

- **Auth:** Svix signature headers (`svix-id`, `svix-timestamp`, `svix-signature`)
- **Request body:** Clerk webhook event payload (raw bytes verified by Svix)
- **Response:** `200 OK` on successful sync; `400` on signature failure.

```bash
curl -X POST http://localhost:3000/auth/webhook \
  -H "svix-id: msg_..." \
  -H "svix-timestamp: 1713441600" \
  -H "svix-signature: v1,..." \
  --data-raw '{"type":"user.created","data":{...}}'
```

---

## Workspaces

### 2. POST /workspaces

Create a new workspace. The caller becomes `OWNER` automatically.

- **Auth:** Clerk JWT
- **Role:** Any authenticated user
- **Schema:** `WorkspaceInput` (Zod) — `{ name: string, slug: string }`
- **Response:** `201 Created` with `{ success: true, data: <Workspace> }`.

```bash
curl -X POST http://localhost:3000/workspaces \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme","slug":"acme"}'
```

### 3. GET /workspaces

List workspaces the authenticated user belongs to.

- **Auth:** Clerk JWT
- **Role:** Any authenticated user
- **Response:** `200 OK` with `{ success: true, data: Workspace[] }`.

### 4. POST /workspaces/:workspaceId/members

Add a member to a workspace.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Schema:** `AddMemberSchema` — `{ targetUserId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER' }` (the `role` field defaults to `MEMBER` when omitted)
- **Response:** `201 Created` with `{ success: true, data: <WorkspaceMember> }`.

### 5. GET /workspaces/:workspaceId/members

List all members of a workspace.

- **Auth:** Clerk JWT
- **Role:** All roles
- **Response:** `200 OK` with `{ success: true, data: WorkspaceMember[] }` (each includes the nested `User`).

### 6. DELETE /workspaces/:workspaceId/members/:userId

Remove a member from a workspace.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Response:** `200 OK` with `{ success: true, message: "Member removed successfully" }`.

---

## Projects

### 7. POST /workspaces/:id/projects

Create a project inside a workspace.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Schema:** `ProjectInput` — `{ title: string, description?: string }`. The `title` is trimmed and lowercased by the Zod schema (`.trim().toLowerCase()`), so project titles are persisted in lowercase.
- **Response:** `201 Created` with `{ success: true, data: <Project> }`.

```bash
curl -X POST http://localhost:3000/workspaces/ws_1/projects \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{"title":"Mobile App","description":"iOS + Android rewrite"}'
```

### 8. GET /workspaces/:id/projects

List all projects in a workspace.

- **Auth:** Clerk JWT
- **Role:** All roles
- **Response:** `200 OK` with `{ success: true, data: Project[] }`.

### 9. PATCH /workspaces/:id/projects/:projectId

Update a project.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Schema:** `UpdateProject` — `{ title?: string, description?: string }`. When `title` is provided it is trimmed and lowercased.
- **Response:** `200 OK` with `{ success: true, data: <Project> }`.

### 10. DELETE /workspaces/:id/projects/:projectId

Delete a project (cascades to its tasks).

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Response:** `200 OK` with `{ success: true, data: <Project> }` (the removed project row).

---

## Tasks

### 11. POST /workspaces/:workspaceId/projects/:projectId/tasks

Create a task. Emits a real-time pubsub event and enqueues a BullMQ notification.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN` / `MEMBER`
- **Schema:** `TaskInput` — `{ title: string, description?: string, status?: TaskStatus, priority?: TaskPriority, assigneeId?: string, dueDate?: string }`
- **Response:** `201 Created` with `{ success: true, data: <Task> }`.

```bash
curl -X POST http://localhost:3000/workspaces/ws_1/projects/proj_1/tasks \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship MVP","priority":"HIGH"}'
```

Task payload shape (inside `data`):

```json
{
  "id": "ckxyz...",
  "title": "Ship MVP",
  "status": "BACKLOG",
  "priority": "HIGH",
  "workspaceId": "ws_1",
  "projectId": "proj_1",
  "creatorId": "user_123",
  "assigneeId": null,
  "dueDate": null,
  "createdAt": "2026-04-18T12:00:00.000Z",
  "updatedAt": "2026-04-18T12:00:00.000Z"
}
```

### 12. GET /workspaces/:workspaceId/projects/:projectId/tasks

List tasks in a project.

- **Auth:** Clerk JWT
- **Role:** All roles
- **Response:** `200 OK` with `{ success: true, data: Task[] }`.

### 13. PATCH /workspaces/:workspaceId/tasks/:taskId

Update a task (title, description, status, priority, assignee, due date).

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN` / `MEMBER`
- **Schema:** `UpdateTaskInput`
- **Response:** `200 OK` with `{ success: true, data: <Task> }`.

### 14. DELETE /workspaces/:workspaceId/tasks/:taskId

Delete a task (cascades to its comments and label links).

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN` / `MEMBER`
- **Response:** `200 OK` with `{ success: true, data: { "id": "TASK_ID" } }`.

> **Known stub:** the handler (`apps/api/src/modules/tasks/task.controller.ts:deleteTaskHandler`) currently returns a hard-coded `{ "id": "TASK_ID" }` string; the real deleted task id is not yet wired through — tracked in Technical-Debt.md.

---

## Comments

### 15. POST /workspaces/:workspaceId/tasks/:taskId/comments

Add a comment to a task.

- **Auth:** Clerk JWT
- **Role:** All roles (any workspace member may comment)
- **Schema:** `CommentInput` — `{ body: string }`
- **Response:** `201 Created` with `{ success: true, data: <Comment> }`.

### 16. GET /workspaces/:workspaceId/tasks/:taskId/comments

List comments on a task (oldest first).

- **Auth:** Clerk JWT
- **Role:** All roles
- **Response:** `200 OK` with `{ success: true, data: Comment[] }` (each includes the nested author `User`).

### 17. DELETE /workspaces/:workspaceId/tasks/:taskId/comments/:commentId

Delete a comment.

- **Auth:** Clerk JWT
- **Role:** Author of the comment, or `OWNER` / `ADMIN`
- **Response:** `200 OK` with `{ success: true, data: <Comment> }` (the removed comment row).

---

## Labels

### 18. POST /workspaces/:workspaceId/labels

Create a workspace-scoped label.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Schema:** `CreateLabelSchema` (Zod `LabelInput`) — `{ name: string, color: string }`. Both fields are required. `color` **must** match the pattern `^#[0-9A-Fa-f]{6}$` (a 6-digit hex color with a leading `#`, e.g. `#1D9E75`).
- **Response:** `201 Created` with `{ success: true, data: <Label> }`. Returns `409 Conflict` (`CONFLICT` code) if the label name already exists in the workspace.

```bash
curl -X POST http://localhost:3000/workspaces/ws_1/labels \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"bug","color":"#1D9E75"}'
```

### 19. POST /workspaces/:workspaceId/tasks/:taskId/labels

Assign a label to a task (writes to the `TaskLabel` join table).

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Schema:** `AssignLabelInput` — `{ labelId: string }`
- **Response:** `201 Created` with `{ success: true, data: <TaskLabel> }` (the raw `TaskLabel` join row).

### 20. GET /workspaces/:workspaceId/tasks/:taskId/labels

List labels currently assigned to a task.

- **Auth:** Clerk JWT
- **Role:** All roles
- **Response:** `200 OK` with `{ success: true, data: Label[] }`.

### 21. DELETE /workspaces/:workspaceId/tasks/:taskId/labels/:labelId

Unassign a label from a task.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Response:** `201 Created` with `{ success: true, data: <TaskLabel> }`.

> **Known oversight:** the handler (`apps/api/src/modules/labels/label.controller.ts:deleteLabelFromTask`) returns `201 Created` instead of `200 OK` — tracked in Technical-Debt.md.

---

## Webhooks

`POST /auth/webhook` is the only incoming webhook. Currently handles `user.created` only (creates or updates the User row via `syncClerkUser`); `user.updated` and `user.deleted` events are acknowledged with `200 OK` but the controller performs no action — tracked in Technical-Debt.md. Payloads are verified using Svix with the `CLERK_WEBHOOK_SECRET`. The route must be mounted with `express.raw` body parsing (already configured in `app.ts`). Configure the webhook endpoint in your Clerk dashboard to point at `https://<your-domain>/auth/webhook`.

---

## API Versioning

No URL-based versioning is in place yet. The API version is tracked via `apps/api/package.json` (currently `0.0.1`). Breaking changes will introduce a `/v2` prefix when they ship (see [API Development Guide](../guides/api-development.md) §8).

---

## Changelog

See git history. Recent Prisma migrations:

- `add_label_model` (2026-04-18)
- `add_comment_model` (2026-04-16)
- `add_task_model` (2026-04-13)
- `add_project_model` (2026-04-13)
- `init` (2026-04-04)

Recent feature commits:

- `feat(jobs): trigger task assignment notification and start worker`
- `feat(jobs): add notification worker with retry logic`
- `feat(jobs): add BullMQ notification queue`

---

## Related Documentation

- [Getting Started Guide](../guides/getting-started.md)
- [API Development Guide](../guides/api-development.md)
- [Deployment Guide](../guides/deployment.md)
- [Contributing Guide](../guides/contributing.md)

---
