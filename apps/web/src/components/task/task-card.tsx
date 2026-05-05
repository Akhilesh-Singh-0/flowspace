import type { Task } from '@/types'
import { cn } from '@/lib/utils'
import { useMembers } from '@/hooks/use-members'

const statusConfig = {
  BACKLOG:     { label: 'Backlog',     dot: 'bg-slate-400',   className: 'bg-slate-400/10 text-slate-400' },
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-blue-400',    className: 'bg-blue-400/10 text-blue-400' },
  IN_REVIEW:   { label: 'In Review',   dot: 'bg-violet-400',  className: 'bg-violet-400/10 text-violet-400' },
  DONE:        { label: 'Done',        dot: 'bg-emerald-400', className: 'bg-emerald-400/10 text-emerald-400' },
  CANCELLED:   { label: 'Cancelled',   dot: 'bg-rose-400',    className: 'bg-rose-400/10 text-rose-400' },
}

const priorityConfig = {
  URGENT: { label: 'Urgent', bar: 'bg-rose-400',   text: 'text-rose-400' },
  HIGH:   { label: 'High',   bar: 'bg-orange-400', text: 'text-orange-400' },
  MEDIUM: { label: 'Medium', bar: 'bg-sky-400',    text: 'text-sky-400' },
  LOW:    { label: 'Low',    bar: 'bg-slate-400',  text: 'text-slate-400' },
}

function AssigneeAvatar({ assigneeId, workspaceId }: { assigneeId: string; workspaceId: string }) {
  const { data: members } = useMembers(workspaceId)
  const member = members?.find((m) => m.user.id === assigneeId)
  if (!member) return null

  const name = member.user.name ?? member.user.email ?? ''
  const initials = name.slice(0, 2).toUpperCase()

  if (member.user.avatarUrl) {
    return (
      <img
        src={member.user.avatarUrl}
        alt={name}
        title={name}
        className="w-6 h-6 rounded-full border border-border object-cover shrink-0"
      />
    )
  }

  return (
    <div
      title={name}
      className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-semibold shrink-0 border border-primary/20"
    >
      {initials}
    </div>
  )
}

export function TaskCard({
  task,
  onClick,
  workspaceId,
}: {
  task: Task
  onClick?: () => void
  workspaceId?: string
}) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]

  return (
    <div
      onClick={onClick}
      className="group relative flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 transition-all duration-200 hover:bg-accent hover:border-primary/20 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.1)] cursor-pointer active:scale-[0.995] overflow-hidden"
    >
      <span
        className={cn(
          'absolute left-0 top-0 h-full w-[3px] rounded-l-lg transition-opacity duration-200 opacity-40 group-hover:opacity-80',
          priority.bar
        )}
      />

      <div className="flex items-center gap-3 min-w-0 pl-1 flex-1">
        <span className={cn('shrink-0 text-xs font-medium w-14', priority.text)}>
          {priority.label}
        </span>
        <p className="text-sm text-foreground truncate">{task.title}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        {task.assigneeId && workspaceId && (
          <AssigneeAvatar assigneeId={task.assigneeId} workspaceId={workspaceId} />
        )}
        <span className={cn(
          'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-colors duration-200',
          status.className
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', status.dot)} />
          {status.label}
        </span>
      </div>
    </div>
  )
}