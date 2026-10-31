
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
const columns = 'grid-cols-[88px_minmax(0,1fr)_120px_132px]'

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
    <div className="w-full">
      <Header
        title="Tasks"
        description="All tasks in this project."
        action={
          <div className="flex items-center gap-3">
            <div className="flex h-9 border border-border">
              {(['list', 'board'] as const).map((item) => {
                const active = view === item
                const Icon = item === 'list' ? List : LayoutDashboard

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => switchView(item)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 px-3 text-sm transition-colors ${
                      active
                        ? 'bg-[#292321] text-[#f0eeeb]'
                        : 'text-[#c5c1ba] hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={15} />
                    {item === 'list' ? 'List' : 'Board'}
                  </button>
                )
              })}
            </div>

            {canManageTasks && (
              <Button onClick={() => setOpen(true)}>
                <Plus size={15} />
                New task
              </Button>
            )}
          </div>
        }
      />

      {hasTasks && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bdb9b2]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks"
              className="h-9 w-full border border-border bg-transparent pl-10 pr-9 text-sm text-[#f0eeeb] outline-none placeholder:text-[#bdb9b2] focus:border-[#b46770]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bdb9b2] hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            aria-label="Filter by status"
            className="h-9 min-w-[145px] border border-border bg-transparent px-3 text-sm text-[#e5e1da] outline-none focus:border-[#b46770]"
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
            className="h-9 min-w-[145px] border border-border bg-transparent px-3 text-sm text-[#e5e1da] outline-none focus:border-[#b46770]"
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
              className="flex h-9 items-center gap-1.5 px-2 text-sm text-[#d8d4ce] hover:text-white"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      )}

      {isLoading && (
        <div className="divide-y divide-border border-y border-border">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-none" />
          ))}
        </div>
      )}

      {isError && (
        <p className="border-y border-border py-5 text-sm text-[#e5e1da]">
          Failed to load tasks. Please try again.
        </p>
      )}

      {!isLoading && !isError && tasks?.length === 0 && (
        <div className="border-y border-border py-14 text-center">
          <p className="font-semibold text-[#f0eeeb]">No tasks yet</p>
          <p className="mt-2 text-sm text-[#c5c1ba]">
            Create your first task to get started.
          </p>
          {canManageTasks && (
            <Button onClick={() => setOpen(true)} className="mt-5">
              <Plus size={15} />
              New task
            </Button>
          )}
        </div>
      )}

      {hasTasks && !filteredTasks.length && (
        <div className="border-y border-border py-14 text-center">
          <p className="font-semibold text-[#f0eeeb]">No matching tasks</p>
          <p className="mt-2 text-sm text-[#c5c1ba]">
            Try changing your search or filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 text-sm font-semibold text-[#d8a0a6] hover:text-[#e5b5ba]"
          >
            Clear filters
          </button>
        </div>
      )}

      {hasTasks && filteredTasks.length > 0 && (
        view === 'list' ? (
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className={`grid ${columns} items-center gap-4 border-y border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#bdb9b2]`}>
                <span>Priority</span>
                <span>Task</span>
                <span>Assignee</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-border">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    workspaceId={workspaceId}
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