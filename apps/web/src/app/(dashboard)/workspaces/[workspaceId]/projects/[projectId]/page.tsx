'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTasks } from '@/hooks/use-tasks'
import { useWebSocket } from '@/hooks/use-websocket'
import { useCurrentRole } from '@/hooks/use-members'
import { TaskCard } from '@/components/task/task-card'
import { KanbanBoard } from '@/components/task/kanban-board'
import { CreateTaskModal } from '@/components/task/create-task-modal'
import { TaskDetail } from '@/components/task/task-detail'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, X, List, LayoutDashboard } from 'lucide-react'
import type { TaskStatus, TaskPriority, Task } from '@/types'

const VIEW_KEY = 'flowspace:task-view'
const columns = 'grid-cols-[96px_minmax(0,1fr)_120px_132px]'
const controlClass =
  'h-8 rounded-md border border-input bg-surface px-3 text-medium text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring [color-scheme:dark]'

export default function ProjectPage() {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string
    projectId: string
  }>()

  const [open, setOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [view, setView] = useState<'list' | 'board'>('list')

  const { data: tasks, isLoading, isError } = useTasks(workspaceId, projectId)
  const role = useCurrentRole(workspaceId)

  useWebSocket(workspaceId, projectId)

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY)
    if (saved === 'list' || saved === 'board') setView(saved)
  }, [])

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase()

    return (tasks ?? []).filter((task) =>
      task.title.toLowerCase().includes(query) &&
      (!statusFilter || task.status === statusFilter) &&
      (!priorityFilter || task.priority === priorityFilter)
    )
  }, [tasks, search, statusFilter, priorityFilter])

  const selectedTask = tasks?.find(({ id }) => id === selectedTaskId) ?? null
  const canManageTasks = role !== 'VIEWER'
  const hasTasks = !isLoading && !isError && Boolean(tasks?.length)
  const hasFilters = Boolean(search || statusFilter || priorityFilter)

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setPriorityFilter('')
  }

  function switchView(next: 'list' | 'board') {
    setView(next)
    localStorage.setItem(VIEW_KEY, next)
  }

  return (
    <div className={view === 'board' ? 'w-full' : 'mx-auto w-full max-w-5xl'}>
      <Header
        title="Tasks"
        description="All tasks in this project."
        action={
          <div className="flex items-center gap-3">
            <div className="flex h-8 gap-0.5 rounded-md border border-line p-0.5">
              {(['list', 'board'] as const).map((item) => {
                const active = view === item
                const Icon = item === 'list' ? List : LayoutDashboard

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => switchView(item)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 rounded px-2.5 text-medium font-semibold transition-colors ${
                      active
                        ? 'bg-surface-raised text-foreground'
                        : 'text-text-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon size={16} />
                    {item === 'list' ? 'List' : 'Board'}
                  </button>
                )
              })}
            </div>

            {canManageTasks && (
              <Button onClick={() => setOpen(true)}>
                <Plus size={16} />
                New task
              </Button>
            )}
          </div>
        }
      />

      {hasTasks && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks"
              className={`${controlClass} w-full pl-9 pr-8 placeholder:text-text-placeholder`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            aria-label="Filter by status"
            className={`${controlClass} min-w-[140px] native-select`}
          >
            <option value="">All statuses</option>
            <option value="BACKLOG">Backlog</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
            aria-label="Filter by priority"
            className={`${controlClass} min-w-[140px] native-select`}
          >
            <option value="">All priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-8 items-center gap-1.5 rounded-md px-2 text-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      )}

      {isLoading && (
        <div className="space-y-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      )}

      {isError && (
        <p className="py-5 text-medium text-destructive">
          Failed to load tasks. Please try again.
        </p>
      )}

      {!isLoading && !isError && tasks?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-medium font-semibold text-foreground">No tasks yet</p>
          <p className="mt-1 text-medium text-text-secondary">
            Create your first task to get started.
          </p>
          {canManageTasks && (
            <Button onClick={() => setOpen(true)} className="mt-4">
              <Plus size={16} />
              New task
            </Button>
          )}
        </div>
      )}

      {hasTasks && !filteredTasks.length && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-medium font-semibold text-foreground">
            No matching tasks
          </p>
          <p className="mt-1 text-medium text-text-secondary">
            Try changing your search or filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 text-medium font-semibold text-foreground underline underline-offset-4 hover:text-bone"
          >
            Clear filters
          </button>
        </div>
      )}

      {hasTasks && filteredTasks.length > 0 && (
        view === 'list' ? (
          <div className="-mx-3 overflow-x-auto">
            <div className="min-w-[680px]">
              <div
                className={`grid ${columns} items-center gap-4 px-3 pb-2 text-small font-semibold text-text-secondary`}
              >
                <span>Priority</span>
                <span>Task</span>
                <span>Assignee</span>
                <span>Status</span>
              </div>
              <div className="space-y-0.5">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    workspaceId={workspaceId}
                    selected={task.id === selectedTaskId}
                    onClick={() => setSelectedTaskId(task.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onTaskClick={(task: Task) => setSelectedTaskId(task.id)}
          />
        )
      )}

      <CreateTaskModal
        open={open}
        onClose={() => setOpen(false)}
        workspaceId={workspaceId}
        projectId={projectId}
      />

      <TaskDetail
        task={selectedTask}
        projectId={projectId}
        workspaceId={workspaceId}
        canDelete={canManageTasks}
        onClose={() => setSelectedTaskId(null)}
        onDeleted={() => setSelectedTaskId(null)}
      />
    </div>
  )
}