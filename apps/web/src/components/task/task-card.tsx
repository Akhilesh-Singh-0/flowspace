import Image from 'next/image'
import type { Task } from '@/types'
import { useMembers } from '@/hooks/use-members'

const statuses = {
  BACKLOG: { label: 'Backlog', color: 'var(--status-backlog)', hollow: true },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--status-progress)', hollow: false },
  IN_REVIEW: { label: 'In Review', color: 'var(--status-review)', hollow: false },
  DONE: { label: 'Done', color: 'var(--status-done)', hollow: false },
  CANCELLED: { label: 'Cancelled', color: 'var(--status-cancelled)', hollow: false },
}

const priorityLevels: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 3,
}

function PriorityGlyph({ priority }: { priority: string }) {
  const level = priorityLevels[priority] ?? 1
  const urgent = priority === 'URGENT'

  return (
    <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
      {[1, 2, 3].map((bar) => (
        <span
          key={bar}
          className={`w-[3px] rounded-[1px] ${
            bar <= level
              ? urgent
                ? 'bg-priority-urgent'
                : 'bg-text-secondary'
              : 'bg-line-strong'
          }`}
          style={{ height: `${bar * 4}px` }}
        />
      ))}
    </span>
  )
}

function Assignee({ id, workspaceId }: { id: string; workspaceId: string }) {
  const { data: members } = useMembers(workspaceId)
  const member = members?.find(({ user }) => user.id === id)

  if (!member) return null

  const name = member.user.name ?? member.user.email ?? ''

  return member.user.avatarUrl ? (
    <Image
      src={member.user.avatarUrl}
      alt={name}
      title={name}
      width={24}
      height={24}
      className="h-6 w-6 rounded-full object-cover"
    />
  ) : (
    <span
      title={name}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-hover text-small font-semibold text-foreground"
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}

export function TaskCard({
  task,
  onClick,
  workspaceId,
  selected = false,
}: {
  task: Task
  onClick?: () => void
  workspaceId?: string
  selected?: boolean
}) {
  const status = statuses[task.status]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative grid h-10 w-full grid-cols-[96px_minmax(0,1fr)_120px_132px] items-center gap-4 rounded-md px-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring ${
        selected
          ? 'bg-surface-hover before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-bone'
          : ''
      }`}
    >
      <span className="flex items-center gap-2 text-medium text-text-secondary">
        <PriorityGlyph priority={task.priority} />
        {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
      </span>

      <span className="truncate text-medium font-semibold text-foreground">
        {task.title}
      </span>

      <span>
        {task.assigneeId && workspaceId ? (
          <Assignee id={task.assigneeId} workspaceId={workspaceId} />
        ) : (
          <span className="text-medium text-text-placeholder">Unassigned</span>
        )}
      </span>

      <span className="flex items-center gap-2 text-medium text-text-secondary">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            status.hollow ? 'border-[1.5px]' : ''
          }`}
          style={
            status.hollow
              ? { borderColor: status.color }
              : { backgroundColor: status.color }
          }
        />
        {status.label}
      </span>
    </button>
  )
}