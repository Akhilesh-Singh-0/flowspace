import type { Task } from '@/types'
import { cn } from '@/lib/utils'

const statusConfig = {
  BACKLOG:     { label: 'Backlog',     dot: 'bg-slate-400',        className: 'bg-slate-400/10 text-slate-400' },
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-blue-400',         className: 'bg-blue-400/10 text-blue-400' },
  IN_REVIEW:   { label: 'In Review',   dot: 'bg-violet-400',       className: 'bg-violet-400/10 text-violet-400' },
  DONE:        { label: 'Done',        dot: 'bg-emerald-400',      className: 'bg-emerald-400/10 text-emerald-400' },
  CANCELLED:   { label: 'Cancelled',   dot: 'bg-rose-400',         className: 'bg-rose-400/10 text-rose-400' },
}

const priorityConfig = {
  URGENT: { label: 'Urgent', className: 'text-rose-400' },
  HIGH:   { label: 'High',   className: 'text-orange-400' },
  MEDIUM: { label: 'Medium', className: 'text-sky-400' },
  LOW:    { label: 'Low',    className: 'text-slate-400' },
}

export function TaskCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 transition-all duration-150 hover:bg-accent hover:border-border/80 cursor-pointer active:scale-[0.995]"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={cn('shrink-0 text-xs font-medium w-14', priority.className)}>
          {priority.label}
        </span>
        <p className="text-sm text-foreground truncate">{task.title}</p>
      </div>

      <div className="shrink-0 ml-4">
        <span className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium', status.className)}>
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', status.dot)} />
          {status.label}
        </span>
      </div>
    </div>
  )
}