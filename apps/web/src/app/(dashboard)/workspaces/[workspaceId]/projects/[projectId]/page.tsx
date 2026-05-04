'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTasks } from '@/hooks/use-tasks'
import { useWebSocket } from '@/hooks/use-websocket'
import { TaskCard } from '@/components/task/task-card'
import { CreateTaskModal } from '@/components/task/create-task-modal'
import { TaskDetail } from '@/components/task/task-detail'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import type { Task } from '@/types'

export default function ProjectPage() {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string
    projectId: string
  }>()

  const [open, setOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const { data: tasks, isLoading, isError } = useTasks(workspaceId, projectId)
  useWebSocket(workspaceId, projectId)

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

        {tasks?.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => setSelectedTask(task)}
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
        workspaceId={workspaceId}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  )
}