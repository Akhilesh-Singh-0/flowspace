<div align="center">

<svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#818cf8" />
      <stop offset="100%" stopColor="#6366f1" />
    </linearGradient>
    <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#6366f1" />
      <stop offset="100%" stopColor="#4f46e5" />
    </linearGradient>
    <linearGradient id="logoGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#4f46e5" />
      <stop offset="100%" stopColor="#3730a3" />
    </linearGradient>
  </defs>
  <rect x="6" y="4" width="20" height="7" rx="2.5" fill="url(#logoGrad1)" opacity="0.95"/>
  <rect x="3" y="13" width="20" height="7" rx="2.5" fill="url(#logoGrad2)" opacity="0.90"/>
  <rect x="8" y="22" width="18" height="6" rx="2.5" fill="url(#logoGrad3)" opacity="0.85"/>
  <circle cx="26" cy="7.5" r="1.5" fill="#a5b4fc" opacity="0.9"/>
  <circle cx="23" cy="16.5" r="1.5" fill="#818cf8" opacity="0.9"/>
  <circle cx="26" cy="25" r="1.5" fill="#6366f1" opacity="0.9"/>
  <line x1="26" y1="9" x2="23" y2="15" stroke="#818cf8" stroke-width="1" stroke-dasharray="2 2" opacity="0.5"/>
  <line x1="23" y1="18" x2="26" y2="23.5" stroke="#6366f1" stroke-width="1" stroke-dasharray="2 2" opacity="0.5"/>
</svg>

<h1>FlowSpace — Web</h1>

<p>project management UI — built from scratch</p>

<p><em>A frontend application built to understand how real-time, role-based, multi-tenant UIs work in practice.</em></p>

<p>
  <img src="https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white" alt="Clerk"/>
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white" alt="TanStack Query"/>
</p>

<p>
  <a href="https://your-live-url.com"><strong>Live Demo</strong></a> ·
  <a href="../api/README.md"><strong>Backend Repo</strong></a> ·
  <a href="https://twitter.com/singh_akhil2272"><strong>Building in Public</strong></a>
</p>

</div>

---

---

## What is FlowSpace?

FlowSpace is a **project management platform** built from the ground up — workspaces, roles, projects, tasks, real-time updates, and background notifications. No shortcuts or heavy abstractions hiding what's going on.

This is the frontend application. It talks to the [FlowSpace API](../api/README.md) over REST and WebSocket.

Most architectural decisions are deliberate:

- **App Router** — file-based routing with server and client component separation
- **TanStack Query** — server state managed with direct cache updates on mutations
- **Role-based UI** — action buttons gated by workspace role, resolved client-side
- **Real-time** — WebSocket singleton with auto-reconnect, cache updates on task events
- **Kanban + List views** — toggle between views, preference stored in localStorage
- **Toast notifications** — every mutation shows success/error feedback via Sonner

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Clerk |
| Server State | TanStack Query v5 |
| HTTP Client | Axios |
| Forms | React Hook Form + Zod |
| Real-time | Native WebSocket API |
| Notifications | Sonner |
| Icons | Lucide React |
| Date Utilities | date-fns |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                      # Root layout — dark mode, ClerkProvider
│   ├── (auth)/                         # Sign in, sign up, SSO callback
│   └── (dashboard)/                    # Authenticated app shell
│       ├── layout.tsx                  # Sidebar + QueryProvider + Toaster
│       ├── workspaces/
│       │   ├── page.tsx                # Workspace list
│       │   └── [workspaceId]/
│       │       ├── page.tsx            # Project list
│       │       ├── members/page.tsx    # Member management
│       │       └── projects/
│       │           └── [projectId]/
│       │               └── page.tsx    # Task list + Kanban board
├── components/
│   ├── layout/                         # Sidebar, Header
│   ├── workspace/                      # WorkspaceCard, CreateWorkspaceModal
│   ├── project/                        # ProjectCard, CreateProjectModal
│   ├── task/                           # TaskCard, KanbanBoard, TaskDetail, CreateTaskModal
│   ├── comment/                        # CommentList, CommentInput
│   ├── label/                          # LabelBadge, AssignLabelModal
│   ├── members/                        # MemberList, InviteMemberModal
│   └── ui/                             # shadcn/ui primitives + Logo SVG
├── hooks/
│   ├── use-workspaces.ts               # useWorkspaces, useCreateWorkspace
│   ├── use-projects.ts                 # useProjects, useCreateProject, useUpdateProject, useDeleteProject
│   ├── use-tasks.ts                    # useTasks, useCreateTask, useUpdateTask, useDeleteTask
│   ├── use-members.ts                  # useMembers, useInviteMember, useRemoveMember
│   ├── use-comments.ts                 # useComments, useCreateComment, useDeleteComment
│   ├── use-labels.ts                   # useTaskLabels, useCreateLabel, useAssignLabel, useRemoveLabel
│   └── use-websocket.ts                # Singleton WS client with workspace room joining
├── lib/
│   ├── api.ts                          # Axios instance + setAuthToken()
│   ├── websocket.ts                    # Singleton WS client with auto-reconnect
│   └── utils.ts                        # cn() utility
├── providers/
│   └── query-provider.tsx              # TanStack Query client wrapper
└── types/
    └── index.ts                        # All shared types and enums
```

---

## Features

### Workspaces
- Create and manage multiple workspaces
- Role-based access per workspace — `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`
- UI adapts based on role — actions hidden if not permitted

### Projects
- Create, edit, and delete projects within a workspace
- Inline title editing on the project card
- Live relative timestamps via `useTimeAgo` — updates every 60 seconds without refresh

### Tasks
- **List view** — cards with priority accents and status badges
- **Kanban board** — 5-column board (Backlog → Cancelled), click a task to open details
- View preference stored in `localStorage`
- Client-side filtering by title, status, and priority
- Real-time updates via WebSocket — changes sync across clients instantly

### Task Detail Panel
- Slide-in panel from the right — stays on the same page
- Inline title editing
- Dropdowns for status, priority, assignee, and due date — each triggers an immediate PATCH
- Label management — create, assign, remove
- Comment thread with avatar initials, delete own comments, `Cmd+Enter` to submit
- Escape key closes panel (unless a modal is open)

### Members
- Invite members by email with role selection
- Remove members — OWNER/ADMIN only
- Role badges with color indicators
- Current user resolved by matching against member list

### Real-time
- WebSocket client with automatic reconnection
- Joins workspace room on connect
- TanStack Query cache updated directly on task events — no full refetch

### Toast Notifications
- Every mutation shows success/error feedback
- Powered by Sonner — bottom-right, dark themed

---

## Architecture Decisions

- **Direct cache updates on mutations** — avoids unnecessary refetching and keeps UI responsive
- **Native WebSocket over socket.io** — simpler setup, fewer dependencies
- **shadcn Select avoided inside Dialogs** — replaced with native `<select>` due to focus issues
- **No drag-and-drop on Kanban** — keeps interaction simple and avoids complex state handling
- **Role resolution via member list** — handled client-side without a separate `/me` endpoint
- **Eager timestamp initialization** — prevents stale relative times after updates

---

## Design System

FlowSpace uses a deep dark theme with an indigo/violet primary accent.

### Color Tokens

```
bg-background          # Main page background
bg-card                # Surface/card background
bg-secondary           # Input backgrounds
bg-accent              # Hover states
text-foreground        # Primary text
text-muted-foreground  # Secondary/meta text
border-border          # All borders
text-primary           # Indigo accent text
bg-primary             # Indigo buttons/fills
text-destructive       # Error states
```

### Status Colors

```
BACKLOG      dot=bg-slate-400    badge=bg-slate-400/10   text-slate-400
IN_PROGRESS  dot=bg-blue-400     badge=bg-blue-400/10    text-blue-400
IN_REVIEW    dot=bg-violet-400   badge=bg-violet-400/10  text-violet-400
DONE         dot=bg-emerald-400  badge=bg-emerald-400/10 text-emerald-400
CANCELLED    dot=bg-rose-400     badge=bg-rose-400/10    text-rose-400
```

### Priority Colors

```
URGENT  bar=bg-rose-400    text=text-rose-400
HIGH    bar=bg-orange-400  text=text-orange-400
MEDIUM  bar=bg-sky-400     text=text-sky-400
LOW     bar=bg-slate-400   text=text-slate-400
```

### Sidebar

The sidebar uses a custom indigo gradient — `linear-gradient(160deg, hsl(250 60% 14%), hsl(240 50% 10%), hsl(230 45% 8%))` — with two blur glow layers for depth. Active nav items use `bg-white/15` with a subtle white inset shadow.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:3000`
- A [Clerk](https://clerk.com) account (free tier works)

### Environment Variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/workspaces
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/workspaces
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Install and Run

```bash
# From the monorepo root
npm install

# Run the frontend
cd apps/web
npm run dev
```

Frontend runs on `http://localhost:3001`.

---

## API

The frontend talks to the backend REST API at `http://localhost:3000`. Every request is authenticated via a Clerk JWT passed as a `Bearer` token.

### WebSocket

```
URL:   ws://localhost:3000
Join:  { "type": "join", "workspaceId": "..." }

Events received:
  { "type": "task.created", "workspaceId": "...", "task": { ... } }
  { "type": "task.updated", "workspaceId": "...", "task": { ... } }
  { "type": "task.deleted", "workspaceId": "...", "taskId": "..." }
```

---

## Ports

| Service | Port |
|---|---|
| Frontend | 3001 |
| Backend API | 3000 |

---

## Known Limitations

- Clerk webhooks require a publicly accessible URL in development. Use [ngrok](https://ngrok.com) to expose the backend and register the endpoint in the Clerk dashboard.
- New users must sign up through the app to be synced to the database via Clerk webhook before they can be invited to a workspace.

---
## Why I Built This

I wanted to build something that forced me to think beyond CRUD.

FlowSpace started as a question — what does it actually take to build a collaborative tool that feels fast, stays consistent across clients, and respects permissions at every layer?

The answers weren't obvious. How do you keep a Kanban board in sync across multiple browser tabs without hammering the API on every change? How do you resolve a user's role client-side without a dedicated `/me` endpoint? What happens to the UI when a WebSocket drops mid-session and reconnects?

These are the kinds of problems that don't show up in tutorials but come up immediately when you try to build something real. So I built FlowSpace to work through them — and to have something concrete to show for it.

Every decision in this codebase has a reason. Direct cache updates instead of refetching. A hand-rolled WebSocket singleton instead of a library. Native selects instead of shadcn inside dialogs. None of it is arbitrary — it's the result of hitting a wall and figuring out why.

---

## Building in Public

Follow the journey on Twitter/X: [@singh_akhil2272](https://twitter.com/singh_akhil2272)

---

## License

MIT — do whatever you want with it.

---

<div align="center">
  <sub>If this project helped you or you find it interesting — a ⭐ means a lot.</sub>
</div>