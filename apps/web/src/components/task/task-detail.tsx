'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Task } from '@/types'
import { cn } from '@/lib/utils'
import { useTaskLabels, useRemoveLabel } from '@/hooks/use-labels'
import { CommentList } from '@/components/comment/comment-list'
import { CommentInput } from '@/components/comment/comment-input'
import { LabelBadge } from '@/components/label/label-badge'
import { Button } from '@/components/ui/button'

const statusConfig = {
  BACKLOG:     { label: 'Backlog',     className: 'bg-slate-400/10 text-slate-400' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-400/10 text-blue-400' },
  IN_REVIEW:   { label: 'In Review',   className: 'bg-violet-400/10 text-violet-400' },
  DONE:        { label: 'Done',        className: 'bg-emerald-400/10 text-emerald-400' },
  CANCELLED:   { label: 'Cancelled',   className: 'bg-rose-400/10 text-rose-400' },
}

const priorityConfig = {
  URGENT: { label: 'Urgent', className: 'text-rose-400' },
  HIGH:   { label: 'High',   className: 'text-orange-400' },
  MEDIUM: { label: 'Medium', className: 'text-sky-400' },
  LOW:    { label: 'Low',    className: 'text-slate-400' },
}

export function TaskDetail({
  task,
  workspaceId,
  onClose,
}: {
  task: Task | null
  workspaceId: string
  onClose: () => void
}) {
  const { data: taskLabels } = useTaskLabels(workspaceId, task?.id ?? '')
  const { mutate: removeLabel } = useRemoveLabel(workspaceId, task?.id ?? '')

  // close on escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const status = task ? statusConfig[task.status] : null
  const priority = task ? priorityConfig[task.priority] : null

  return (
    <>
      {/* backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-200',
          task ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out flex flex-col',
          task ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {task && (
          <>
            {/* header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border shrink-0">
              <h2 className="text-base font-semibold text-foreground leading-snug">
                {task.title}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* meta row */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', status?.className)}>
                  {status?.label}
                </span>
                <span className={cn('text-xs font-medium', priority?.className)}>
                  {priority?.label}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* description */}
              {task.description && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Description
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {task.description}
                  </p>
                </div>
              )}

              {/* labels */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Labels
                </p>
                <div className="flex flex-wrap gap-2">
                  {taskLabels && taskLabels.length > 0 ? (
                    taskLabels.map((tl) => (
                      <LabelBadge
                        key={tl.labelId}
                        name={tl.label.name}
                        color={tl.label.color}
                        onRemove={() => removeLabel(tl.labelId)}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No labels assigned.</p>
                  )}
                </div>
              </div>

              {/* divider */}
              <div className="border-t border-border" />

              {/* comments */}
              <div className="space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Comments
                </p>
                <CommentList workspaceId={workspaceId} taskId={task.id} />
                <CommentInput workspaceId={workspaceId} taskId={task.id} />
              </div>

            </div>
          </>
        )}
      </div>
    </>
  )
}