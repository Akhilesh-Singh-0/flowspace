# Database Entity-Relationship Diagram

**Project:** flowspace
**Database:** PostgreSQL 15
**ORM:** Prisma 5.22.0
**Schema File:** `apps/api/prisma/schema.prisma`
**Generated:** 2026-04-18

---

## Overview

The flowspace schema is organized around **Workspaces** as the top-level tenant boundary. Users
join workspaces through the `WorkspaceMember` join table (which carries a role), and workspaces
own projects, tasks, and labels. Tasks support collaboration via comments and categorization via
the `TaskLabel` many-to-many join table.

All relations use **cascading deletes** when the parent is a containing resource (workspace, project,
task), with two exceptions: a task's `creator` uses `onDelete: Restrict` (users who created tasks
cannot be deleted while those tasks exist), and a task's `assignee` uses `onDelete: SetNull`.

---

## ER Diagram

```mermaid
erDiagram
    User ||--o{ WorkspaceMember : "joins via"
    Workspace ||--o{ WorkspaceMember : "has members"
    Workspace ||--o{ Project : "contains"
    Workspace ||--o{ Task : "contains"
    Workspace ||--o{ Label : "defines"
    Project ||--o{ Task : "groups"
    User ||--o{ Task : "creates (Creator)"
    User |o--o{ Task : "assigned (Assignee, optional)"
    Task ||--o{ Comment : "has"
    User ||--o{ Comment : "authors (Author)"
    Task ||--o{ TaskLabel : "tagged with"
    Label ||--o{ TaskLabel : "tags"

    User {
        string id PK "cuid"
        string email UK "unique"
        string name "nullable"
        string clerkId UK "unique, indexed"
        string avatarUrl "nullable"
        datetime createdAt
        datetime updatedAt
    }

    Workspace {
        string id PK "cuid"
        string name
        string slug UK "unique, indexed"
        datetime createdAt
        datetime updatedAt
    }

    WorkspaceMember {
        string id PK "cuid"
        string workspaceId FK "Workspace.id, onDelete Cascade"
        string userId FK "User.id, onDelete Cascade"
        enum role "WorkspaceRole: OWNER/ADMIN/MEMBER/VIEWER, default MEMBER"
        datetime joinedAt
    }

    Project {
        string id PK "cuid"
        string workspaceId FK "Workspace.id, onDelete Cascade"
        string title
        string description "nullable"
        datetime createdAt
        datetime updatedAt
    }

    Task {
        string id PK "cuid"
        string projectId FK "Project.id, onDelete Cascade"
        string workspaceId FK "Workspace.id, onDelete Cascade"
        string title
        string description "nullable"
        enum status "TaskStatus: BACKLOG/IN_PROGRESS/IN_REVIEW/DONE/CANCELLED"
        enum priority "TaskPriority: URGENT/HIGH/MEDIUM/LOW, default MEDIUM"
        string assigneeId FK "User.id, nullable, onDelete SetNull"
        string creatorId FK "User.id, onDelete Restrict"
        datetime dueDate "nullable"
        datetime createdAt
        datetime updatedAt
    }

    Comment {
        string id PK "cuid"
        string taskId FK "Task.id, onDelete Cascade"
        string authorId FK "User.id, onDelete Cascade"
        string body
        datetime createdAt
        datetime updatedAt
    }

    Label {
        string id PK "cuid"
        string workspaceId FK "Workspace.id, onDelete Cascade"
        string name "unique per workspace"
        string color
        datetime createdAt
        datetime updatedAt
    }

    TaskLabel {
        string taskId PK_FK "Task.id, onDelete Cascade"
        string labelId PK_FK "Label.id, onDelete Cascade"
    }
```

---

## Enums

| Enum | Values |
|------|--------|
| `WorkspaceRole` | `OWNER`, `ADMIN`, `MEMBER`, `VIEWER` |
| `TaskStatus` | `BACKLOG`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `CANCELLED` |
| `TaskPriority` | `URGENT`, `HIGH`, `MEDIUM`, `LOW` |

---

## Unique Constraints and Indexes

| Model | Constraint / Index | Purpose |
|-------|--------------------|---------|
| `User` | `@unique email`, `@unique clerkId`, `@@index([clerkId])` | Fast Clerk-to-internal-user lookup |
| `Workspace` | `@unique slug`, `@@index([slug])` | Slug-based workspace routing |
| `WorkspaceMember` | `@@unique([userId, workspaceId])` | One membership per user per workspace |
| `WorkspaceMember` | `@@index([userId])`, `@@index([workspaceId, role])`, `@@index([workspaceId, joinedAt])` | RBAC and member listing performance |
| `Project` | `@@index([workspaceId])` | List projects for a workspace |
| `Task` | `@@index([workspaceId, status])`, `@@index([workspaceId, assigneeId])`, `@@index([workspaceId, createdAt Desc])`, `@@index([projectId, status])`, `@@index([projectId])` | Task board filtering and sorting |
| `Comment` | `@@index([taskId])` | Load comments for a task |
| `Label` | `@@unique([workspaceId, name])` | Label names unique within a workspace |
| `TaskLabel` | `@@id([taskId, labelId])` | Composite PK (many-to-many join) |

---

## Cascading Delete Behavior

- **Workspace deletion** cascades to: `WorkspaceMember`, `Project`, `Task`, `Label`.
- **Project deletion** cascades to: `Task` (and transitively to `Comment`, `TaskLabel`).
- **Task deletion** cascades to: `Comment`, `TaskLabel`.
- **Label deletion** cascades to: `TaskLabel` (tasks remain untouched).
- **User deletion** cascades to: `WorkspaceMember`, `Comment`. It is **restricted** while the
  user has `createdTasks`, and sets `assigneeId = NULL` on their assigned tasks.

---

**Generated by:** APO-1 (Documentation Specialist)
**Source Report:** `.claude/trinity/reports/DOCS-AUDIT-2026-04-18-1430.md`
**Source Schema:** `apps/api/prisma/schema.prisma`
