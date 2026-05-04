'use client'

import type { Task } from '@/types'
import { cn } from '@/lib/utils'

const columns = [
  { status: 'BACKLOG',     label: 'Backlog',     dot: 'bg-slate-400',   header: 'text-slate-400',   bg: 'bg-slate-400/5',    border: 'border-slate-400/10',   pill: 'bg-slate-400/10 text-slate-400 border-slate-400/20' },
  { status: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-blue-400',    header: 'text-blue-400',    bg: 'bg-blue-400/5',     border: 'border-blue-400/10',    pill: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
  { status: 'IN_REVIEW',   label: 'In Review',   dot: 'bg-violet-400',  header: 'text-violet-400',  bg: 'bg-violet-400/5',   border: 'border-violet-400/10',  pill: 'bg-violet-400/10 text-violet-400 border-violet-400/20' },
  { status: 'DONE',        label: 'Done',        dot: 'bg-emerald-400', header: 'text-emerald-400', bg: 'bg-emerald-400/5',  border: 'border-emerald-400/10', pill: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  { status: 'CANCELLED',   label: 'Cancelled',   dot: 'bg-rose-400',    header: 'text-rose-400',    bg: 'bg-rose-400/5',     border: 'border-rose-400/10',    pill: 'bg-rose-400/10 text-rose-400 border-rose-400/20' },
] as const

const priorityConfig = {
  URGENT: { label: 'Urgent', bar: 'bg-rose-400',   text: 'text-rose-400' },
  HIGH:   { label: 'High',   bar: 'bg-orange-400', text: 'text-orange-400' },
  MEDIUM: { label: 'Medium', bar: 'bg-sky-400',    text: 'text-sky-400' },
  LOW:    { label: 'Low',    bar: 'bg-slate-400',  text: 'text-slate-400' },
}

function KanbanCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  const priority = priorityConfig[task.priority]

  return (
    <div
      onClick={onClick}
      className="group relative rounded-lg border border-border bg-card px-4 py-3 transition-all duration-200 hover:bg-accent hover:border-primary/20 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.1)] cursor-pointer active:scale-[0.995] overflow-hidden"
    >
      <span
        className={cn(
          'absolute left-0 top-0 h-full w-[3px] rounded-l-lg opacity-50 group-hover:opacity-100 transition-opacity duration-200',
          priority.bar
        )}
      />
      <div className="pl-2 space-y-2">
        <p className="text-sm font-medium text-foreground leading-snug break-words">
          {task.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-xs font-semibold shrink-0', priority.text)}>
            {priority.label}
          </span>
          {task.dueDate && (
            <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
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
    <div
      className="flex gap-3 overflow-x-auto pb-4"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'hsl(var(--border)) transparent',
      }}
    >
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status)

        return (
          <div
            key={col.status}
            className="flex flex-col gap-2 shrink-0 w-[260px]"
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-1 py-1.5">
              <span className={cn('w-2 h-2 rounded-full shrink-0', col.dot)} />
              <span className={cn('text-xs font-semibold flex-1', col.header)}>
                {col.label}
              </span>
              <span className={cn(
                'text-xs font-semibold px-1.5 py-0.5 rounded-full border shrink-0',
                col.pill
              )}>
                {colTasks.length}
              </span>
            </div>

            {/* Column body */}
            <div
              className={cn(
                'flex flex-col gap-2 rounded-xl border p-2.5 min-h-[200px]',
                'overflow-y-auto max-h-[calc(100vh-280px)]',
                '[&::-webkit-scrollbar]:w-[3px]',
                '[&::-webkit-scrollbar-track]:bg-transparent',
                '[&::-webkit-scrollbar-thumb]:rounded-full',
                '[&::-webkit-scrollbar-thumb]:bg-border',
                col.bg,
                col.border
              )}
            >
              {colTasks.length === 0 ? (
                <div className="flex items-center justify-center min-h-[160px]">
                  <p className="text-xs text-muted-foreground">No tasks</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}