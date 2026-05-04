'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useTasks } from '@/hooks/use-tasks'
import { useWebSocket } from '@/hooks/use-websocket'
import { TaskCard } from '@/components/task/task-card'
import { CreateTaskModal } from '@/components/task/create-task-modal'
import { TaskDetail } from '@/components/task/task-detail'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, X } from 'lucide-react'
import type { TaskStatus, TaskPriority } from '@/types'

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

  const { data: tasks, isLoading, isError } = useTasks(workspaceId, projectId)
  useWebSocket(workspaceId, projectId)

  const selectedTask = tasks?.find((t) => t.id === selectedTaskId) ?? null

  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter ? task.status === statusFilter : true
      const matchesPriority = priorityFilter ? task.priority === priorityFilter : true
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, search, statusFilter, priorityFilter])

  const hasFilters = search || statusFilter || priorityFilter

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setPriorityFilter('')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Header
        title="Tasks"
        description="All tasks in this project."
        action={
          <Button
            onClick={() => setOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus size={15} />
            New task
          </Button>
        }
      />

      {!isLoading && !isError && tasks && tasks.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-secondary text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {isLoading && (
          <>
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Failed to load tasks. Please try again.
          </p>
        )}

        {!isLoading && !isError && tasks?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-sm font-medium text-foreground">No tasks yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first task to get started
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus size={15} />
              New task
            </Button>
          </div>
        )}

        {!isLoading && !isError && tasks && tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-sm font-medium text-foreground">No tasks match your filters</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or filters
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => setSelectedTaskId(task.id)}
          />
        ))}
      </div>

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
        onClose={() => setSelectedTaskId(null)}
        onDeleted={() => setSelectedTaskId(null)}
      />
    </div>
  )
}