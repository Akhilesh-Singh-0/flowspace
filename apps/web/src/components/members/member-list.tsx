'use client'

import { useMembers, useRemoveMember } from '@/hooks/use-members'
import { useAuth } from '@clerk/nextjs'
import type { WorkspaceMember } from '@/types'
import { cn } from '@/lib/utils'

const roleConfig = {
  OWNER:  { label: 'Owner',  className: 'bg-primary/10 text-primary' },
  ADMIN:  { label: 'Admin',  className: 'bg-violet-400/10 text-violet-400' },
  MEMBER: { label: 'Member', className: 'bg-blue-400/10 text-blue-400' },
  VIEWER: { label: 'Viewer', className: 'bg-slate-400/10 text-slate-400' },
}

function MemberItem({
  member,
  workspaceId,
  currentUserId,
  isOwner,
}: {
  member: WorkspaceMember
  workspaceId: string
  currentUserId: string | null | undefined
  isOwner: boolean
}) {
  const { mutate: removeMember, isPending } = useRemoveMember(workspaceId)
  const role = roleConfig[member.role]
  const initials = member.user.name
    ? member.user.name.slice(0, 2).toUpperCase()
    : member.user.email.slice(0, 2).toUpperCase()

  const isSelf = currentUserId === member.user.id
  const canRemove = isOwner && !isSelf && member.role !== 'OWNER'

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {member.user.name ?? 'Unknown'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {member.user.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', role.className)}>
          {role.label}
        </span>
        {canRemove && (
          <button
            onClick={() => removeMember(member.user.id)}
            disabled={isPending}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

export function MemberList({ workspaceId }: { workspaceId: string }) {
  const { data: members, isLoading, isError } = useMembers(workspaceId)
  const { userId } = useAuth()

  const currentMember = members?.find((m) => m.user.id === userId)
  const isOwner = currentMember?.role === 'OWNER'

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-lg border border-border bg-card animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Failed to load members. Please try again.
      </p>
    )
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">No members yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Invite someone to collaborate
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => (
        <MemberItem
          key={member.user.id}
          member={member}
          workspaceId={workspaceId}
          currentUserId={userId}
          isOwner={isOwner ?? false}
        />
      ))}
    </div>
  )
}