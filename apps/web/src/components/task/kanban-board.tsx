'use client'

import type { Task } from '@/types'

const columns = [
  { status: 'BACKLOG', label: 'Backlog', color: '#a6a6a1' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: '#5a88b2' },
  { status: 'IN_REVIEW', label: 'In Review', color: '#d09c54' },
  { status: 'DONE', label: 'Done', color: '#3b8d63' },
  { status: 'CANCELLED', label: 'Cancelled', color: '#b46770' },
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
      className="w-full border-b border-border px-3 py-3 text-left transition-colors hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#b46770]"
    >
      <p className="break-words text-sm font-semibold text-[#f0eeeb]">
        {task.title}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2 text-sm text-[#c5c1ba]">
        <span>
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
    <div className="flex gap-5 overflow-x-auto pb-4">
      {columns.map(({ status, label, color }) => {
        const items = tasks.filter((task) => task.status === status)

        return (
          <section key={status} className="w-[260px] shrink-0">
            <header className="mb-3 flex items-center gap-2 border-b border-border px-1 pb-3">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h2 className="flex-1 text-sm font-semibold text-[#e5e1da]">
                {label}
              </h2>
              <span className="text-sm text-[#bdb9b2]">
                {items.length}
              </span>
            </header>

            <div className="divide-y divide-border">
              {items.length ? (
                items.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                  />
                ))
              ) : (
                <p className="px-3 py-5 text-sm text-[#bdb9b2]">
                  No tasks
                </p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}