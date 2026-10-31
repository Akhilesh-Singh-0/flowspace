import Image from 'next/image'
import type { Task } from '@/types'
import { useMembers } from '@/hooks/use-members'

const statuses = {
  BACKLOG: { label: 'Backlog', dot: '#a6a6a1' },
  IN_PROGRESS: { label: 'In Progress', dot: '#5a88b2' },
  IN_REVIEW: { label: 'In Review', dot: '#d09c54' },
  DONE: { label: 'Done', dot: '#3b8d63' },
  CANCELLED: { label: 'Cancelled', dot: '#b46770' },
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
      width={28}
      height={28}
      className="h-7 w-7 rounded-full object-cover"
    />
  ) : (
    <span
      title={name}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#292523] text-xs font-semibold text-[#d8d4ce]"
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
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
  const status = statuses[task.status]

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-[88px_minmax(0,1fr)_120px_132px] items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#b46770]"
    >
      <span className="text-sm text-[#d8d4ce]">
        {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
      </span>

      <span className="truncate text-sm font-semibold text-[#f0eeeb]">
        {task.title}
      </span>

      <span>
        {task.assigneeId && workspaceId ? (
          <Assignee id={task.assigneeId} workspaceId={workspaceId} />
        ) : (
          <span className="text-sm text-[#bdb9b2]">Unassigned</span>
        )}
      </span>

      <span className="flex items-center gap-2 text-sm text-[#d8d4ce]">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.dot }} />
        {status.label}
      </span>
    </button>
  )
}