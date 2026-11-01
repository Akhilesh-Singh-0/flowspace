'use client'

import { useMembers, useRemoveMember } from '@/hooks/use-members'
import { useUser } from '@clerk/nextjs'
import type { WorkspaceMember } from '@/types'
import { UserMinus } from 'lucide-react'

const roleLabels: Record<string, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
}

function MemberItem({
  member,
  workspaceId,
  currentDbUserId,
  canManageMembers,
}: {
  member: WorkspaceMember
  workspaceId: string
  currentDbUserId: string | null
  canManageMembers: boolean
}) {
  const { mutate: removeMember, isPending } = useRemoveMember(workspaceId)
  const roleLabel = roleLabels[member.role] ?? member.role

  const initials = member.user.name
    ? member.user.name.slice(0, 2).toUpperCase()
    : member.user.email
    ? member.user.email.slice(0, 2).toUpperCase()
    : '??'

  const isSelf = currentDbUserId === member.user.id
  const canRemove = canManageMembers && !isSelf && member.role !== 'OWNER'

  return (
    <div className="group flex h-11 items-center justify-between gap-4 rounded-md px-3 transition-colors hover:bg-surface-hover">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bone-subtle text-small font-semibold text-foreground">
          {initials}
        </div>
        <div className="flex min-w-0 items-baseline gap-2">
          <p className="truncate text-medium font-semibold text-foreground">
            {member.user.name ?? 'Unknown'}
          </p>
          <p className="truncate text-small text-text-secondary">
            {member.user.email || 'No email'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="w-16 text-right text-small text-text-secondary">
          {roleLabel}
        </span>
        <div className="flex h-7 w-7 items-center justify-center">
          {canRemove && (
            <button
              onClick={() => removeMember(member.user.id)}
              disabled={isPending}
              aria-label="Remove member"
              title="Remove member"
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary opacity-0 transition-[color,opacity] hover:bg-surface-raised hover:text-priority-urgent focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group-hover:opacity-100 disabled:opacity-50"
            >
              <UserMinus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function MemberList({
  workspaceId,
  canManageMembers,
}: {
  workspaceId: string
  canManageMembers: boolean
}) {
  const { data: members, isLoading, isError } = useMembers(workspaceId)
  const { user } = useUser()

  const currentEmail = user?.primaryEmailAddress?.emailAddress ?? ''
  const currentName = (user?.fullName ?? '').toLowerCase().replace(/\s/g, '')
  const firstName = (user?.firstName ?? '').toLowerCase()

  const currentDbUserId =
    members?.find((m) => {
      const dbEmail = (m.user.email ?? '').toLowerCase()
      const dbName = (m.user.name ?? '').toLowerCase().replace(/\s/g, '')
      return (
        (dbEmail && dbEmail === currentEmail.toLowerCase()) ||
        dbName === currentName ||
        currentName.includes(dbName) ||
        dbName.includes(firstName)
      )
    })?.user.id ?? null

  if (isLoading) {
    return (
      <div className="-mx-3 space-y-0.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex h-11 animate-pulse items-center gap-3 px-3">
            <div className="h-7 w-7 rounded-full bg-surface-hover" />
            <div className="h-4 w-40 rounded-md bg-surface-hover" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-medium text-destructive">
        Failed to load members. Please try again.
      </p>
    )
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-medium font-semibold text-foreground">No members yet</p>
        <p className="mt-1 text-medium text-text-secondary">
          Invite someone to collaborate
        </p>
      </div>
    )
  }

  return (
    <div className="-mx-3 space-y-0.5">
      {members.map((member) => (
        <MemberItem
          key={member.user.id}
          member={member}
          workspaceId={workspaceId}
          currentDbUserId={currentDbUserId}
          canManageMembers={canManageMembers}
        />
      ))}
    </div>
  )
}