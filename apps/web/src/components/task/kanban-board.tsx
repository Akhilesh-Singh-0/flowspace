'use client'

import type { Task } from '@/types'
import { PriorityGlyph } from '@/components/task/task-card'

const columns = [
  { status: 'BACKLOG', label: 'Backlog', color: 'var(--status-backlog)', hollow: true },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'var(--status-progress)', hollow: false },
  { status: 'IN_REVIEW', label: 'In Review', color: 'var(--status-review)', hollow: false },
  { status: 'DONE', label: 'Done', color: 'var(--status-done)', hollow: false },
  { status: 'CANCELLED', label: 'Cancelled', color: 'var(--status-cancelled)', hollow: false },
] as const

function KanbanCard({
  task,
  onClick,
}: {
  task: Task
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md bg-surface-raised px-3 py-2.5 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <p className="break-words text-medium font-semibold text-foreground">
        {task.title}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2 text-small text-text-secondary">
        <span className="flex items-center gap-1.5">
          <PriorityGlyph priority={task.priority} />
          {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
        </span>
        {task.dueDate && (
          <time dateTime={new Date(task.dueDate).toISOString()}>
            {new Date(task.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </time>
        )}
      </div>
    </button>
  )
}

export function KanbanBoard({
  tasks,
  onTaskClick,
}: {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}) {
  return (
    <div className="overflow-x-auto pb-2 [color-scheme:dark]">
      <div className="grid min-w-[880px] grid-cols-5 gap-4">
        {columns.map(({ status, label, color, hollow }) => {
          const items = tasks.filter((task) => task.status === status)

          return (
            <section key={status} className="min-w-0">
              <header className="mb-2 flex h-8 items-center gap-2 px-1">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    hollow ? 'border-[1.5px]' : ''
                  }`}
                  style={
                    hollow
                      ? { borderColor: color }
                      : { backgroundColor: color }
                  }
                />
                <h2 className="flex-1 truncate text-medium font-semibold text-foreground">
                  {label}
                </h2>
                <span className="text-small tabular-nums text-text-secondary">
                  {items.length}
                </span>
              </header>

              <div className="space-y-2">
                {items.length ? (
                  items.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick(task)}
                    />
                  ))
                ) : (
                  <p className="px-1 py-2 text-medium text-text-secondary">
                    No tasks
                  </p>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}