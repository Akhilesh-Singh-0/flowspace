# flowspace API Documentation

Complete REST API reference for **flowspace** — a project management backend covering workspaces, role-based access control, projects, tasks, comments, labels, and a Clerk-powered auth webhook.

**Base URL:** `http://localhost:3000`
**API Version:** `0.0.1` (tracked via `apps/api/package.json`)
**Total Endpoints:** 21
**Resources:** 6 (auth, workspaces, projects, tasks, comments, labels)
**Generated:** 2026-04-18

---

## Authentication

Clerk JWT Bearer tokens are verified via the `@clerk/express` middleware. Every protected route is gated by `authMiddleware` from `apps/api/src/middleware/requireAuth.ts`. User identity is synced from Clerk via a Svix-verified webhook at `POST /auth/webhook`, so the first time a user signs up in Clerk they are provisioned in the flowspace database automatically.

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

A `rateLimiter` middleware module exists in `apps/api/src/middleware/rateLimiter.ts` (implementation-defined; not globally mounted in `app.ts`). You can opt individual routers into it as needed.

---

## Pagination, Filtering, and Sorting

A pagination utility is available at `apps/api/src/utils/pagination.ts`. Resource-specific filtering is not currently exposed via query parameters; when routes adopt pagination they accept `?page=` and `?pageSize=` query params.

---

## Common Response Codes

| Status | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created |
| `400 Bad Request` | Zod validation failure |
| `401 Unauthorized` | Clerk JWT missing or invalid |
| `403 Forbidden` | RBAC check failed via `requireRole` |
| `404 Not Found` | Resource does not exist or caller has no access |
| `409 Conflict` | Unique constraint violation (e.g. duplicate workspace slug, duplicate label name per workspace) |
| `500 Internal Server Error` | Unhandled server error, mapped by `errorHandler` middleware |

All errors return JSON:

```json
{
  "error": "ValidationError",
  "message": "title is required",
  "details": [ ... ]
}
```

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

Clerk user sync endpoint. Receives `user.created`, `user.updated`, and `user.deleted` events. Payloads are verified using Svix with the `CLERK_WEBHOOK_SECRET`. Must be mounted with the `express.raw` body parser (already configured in `apps/api/src/app.ts`).

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
- **Schema:** `CreateWorkspaceSchema` (Zod) — `{ name: string, slug: string }`
- **Response:** `201 Created` with the new `Workspace`.

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
- **Response:** `200 OK` with `Workspace[]`.

### 4. POST /workspaces/:workspaceId/members

Add a member to a workspace.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Schema:** `AddMemberSchema` — `{ userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER' }`
- **Response:** `201 Created` with the new `WorkspaceMember`.

### 5. GET /workspaces/:workspaceId/members

List all members of a workspace.

- **Auth:** Clerk JWT
- **Role:** All roles
- **Response:** `200 OK` with `WorkspaceMember[]` (each includes the nested `User`).

### 6. DELETE /workspaces/:workspaceId/members/:userId

Remove a member from a workspace.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Response:** `204 No Content`.

---

## Projects

### 7. POST /workspaces/:id/projects

Create a project inside a workspace.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Schema:** `CreateProjectSchema` — `{ name: string, description?: string }`
- **Response:** `201 Created` with the new `Project`.

```bash
curl -X POST http://localhost:3000/workspaces/ws_1/projects \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mobile App","description":"iOS + Android rewrite"}'
```

### 8. GET /workspaces/:id/projects

List all projects in a workspace.

- **Auth:** Clerk JWT
- **Role:** All roles
- **Response:** `200 OK` with `Project[]`.

### 9. PATCH /workspaces/:id/projects/:projectId

Update a project.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Schema:** `UpdateProjectSchema` — `{ name?: string, description?: string }`
- **Response:** `200 OK` with the updated `Project`.

### 10. DELETE /workspaces/:id/projects/:projectId

Delete a project (cascades to its tasks).

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Response:** `204 No Content`.

---

## Tasks

### 11. POST /workspaces/:workspaceId/projects/:projectId/tasks

Create a task. Emits a real-time pubsub event and enqueues a BullMQ notification.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN` / `MEMBER`
- **Schema:** `CreateTaskSchema` — `{ title: string, description?: string, status?: TaskStatus, priority?: TaskPriority, assigneeId?: string, dueDate?: string }`
- **Response:** `201 Created` with the new `Task`.

```bash
curl -X POST http://localhost:3000/workspaces/ws_1/projects/proj_1/tasks \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship MVP","priority":"HIGH"}'
```

Response shape:

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
- **Response:** `200 OK` with `Task[]`.

### 13. PATCH /workspaces/:workspaceId/tasks/:taskId

Update a task (title, description, status, priority, assignee, due date).

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN` / `MEMBER`
- **Schema:** `UpdateTaskSchema`
- **Response:** `200 OK` with the updated `Task`.

### 14. DELETE /workspaces/:workspaceId/tasks/:taskId

Delete a task (cascades to its comments and label links).

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN` / `MEMBER`
- **Response:** `204 No Content`.

---

## Comments

### 15. POST /workspaces/:workspaceId/tasks/:taskId/comments

Add a comment to a task.

- **Auth:** Clerk JWT
- **Role:** All roles (any workspace member may comment)
- **Schema:** `CreateCommentSchema` — `{ body: string }`
- **Response:** `201 Created` with the new `Comment`.

### 16. GET /workspaces/:workspaceId/tasks/:taskId/comments

List comments on a task (oldest first).

- **Auth:** Clerk JWT
- **Role:** All roles
- **Response:** `200 OK` with `Comment[]` (each includes the nested author `User`).

### 17. DELETE /workspaces/:workspaceId/tasks/:taskId/comments/:commentId

Delete a comment.

- **Auth:** Clerk JWT
- **Role:** Author of the comment, or `OWNER` / `ADMIN`
- **Response:** `204 No Content`.

---

## Labels

### 18. POST /workspaces/:workspaceId/labels

Create a workspace-scoped label.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Schema:** `CreateLabelSchema` — `{ name: string, color?: string }`
- **Response:** `201 Created` with the new `Label`. Returns `409 Conflict` if the label name already exists in the workspace.

### 19. POST /workspaces/:workspaceId/tasks/:taskId/labels

Assign a label to a task (writes to the `TaskLabel` join table).

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Schema:** `AssignLabelSchema` — `{ labelId: string }`
- **Response:** `201 Created` with the `TaskLabel` row.

### 20. GET /workspaces/:workspaceId/tasks/:taskId/labels

List labels currently assigned to a task.

- **Auth:** Clerk JWT
- **Role:** All roles
- **Response:** `200 OK` with `Label[]`.

### 21. DELETE /workspaces/:workspaceId/tasks/:taskId/labels/:labelId

Unassign a label from a task.

- **Auth:** Clerk JWT
- **Role:** `OWNER` / `ADMIN`
- **Response:** `204 No Content`.

---

## Webhooks

`POST /auth/webhook` receives Clerk `user.created` / `user.updated` / `user.deleted` events. Payloads are verified using Svix with the `CLERK_WEBHOOK_SECRET`. The route must be mounted with `express.raw` body parsing (already configured in `app.ts`). Configure the webhook endpoint in your Clerk dashboard to point at `https://<your-domain>/auth/webhook`.

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

**Document generated:** 2026-04-18
