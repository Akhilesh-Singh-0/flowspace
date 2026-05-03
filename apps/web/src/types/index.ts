export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'

export type User = {
  id: string
  email: string
  name: string | null
  clerkId: string
  avatarUrl: string | null
  createdAt: string
}

export type Workspace = {
  id: string
  name: string
  slug: string
  createdAt: string
  role: WorkspaceRole
}

export type WorkspaceMember = {
  role: WorkspaceRole
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
}

export type Project = {
  id: string
  title: string
  description: string | null
  createdAt: string
}

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  projectId: string
  workspaceId: string
  creatorId: string
  assigneeId: string | null
  createdAt: string
  updatedAt: string
}

export type Comment = {
  id: string
  body: string
  taskId: string
  authorId: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string | null
    avatarUrl: string | null
  }
}

export type Label = {
  id: string
  name: string
  color: string
  workspaceId: string
}

export type TaskLabel = {
  taskId: string
  labelId: string
  label: {
    id: string
    name: string
    color: string
  }
}
