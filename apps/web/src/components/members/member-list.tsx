'use client'

import { useMembers, useRemoveMember } from '@/hooks/use-members'
import { useUser } from '@clerk/nextjs'
import type { WorkspaceMember } from '@/types'
import { cn } from '@/lib/utils'
import { UserMinus } from 'lucide-react'

const roleConfig = {
  OWNER:  { label: 'Owner',  className: 'bg-primary/10 text-primary' },
  ADMIN:  { label: 'Admin',  className: 'bg-violet-400/10 text-violet-400' },
  MEMBER: { label: 'Member', className: 'bg-blue-400/10 text-blue-400' },
  VIEWER: { label: 'Viewer', className: 'bg-slate-400/10 text-slate-400' },
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
  const role = roleConfig[member.role]

  const initials = member.user.name
    ? member.user.name.slice(0, 2).toUpperCase()
    : member.user.email
    ? member.user.email.slice(0, 2).toUpperCase()
    : '??'

  const isSelf = currentDbUserId === member.user.id
  const canRemove = canManageMembers && !isSelf && member.role !== 'OWNER'

  return (
    <div className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 transition-all duration-200 hover:bg-accent hover:border-primary/20 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0 transition-colors duration-200 group-hover:bg-primary/20">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {member.user.name ?? 'Unknown'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {member.user.email || 'No email'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', role.className)}>
          {role.label}
        </span>
        {canRemove && (
          <div className="flex items-center rounded-md border border-border bg-secondary px-0.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => removeMember(member.user.id)}
              disabled={isPending}
              title="Remove member"
              className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-150 disabled:opacity-50"
            >
              <UserMinus className="w-3 h-3" />
            </button>
          </div>
        )}
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
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg border border-border bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load members. Please try again.</p>
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">No members yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Invite someone to collaborate</p>
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
          currentDbUserId={currentDbUserId}
          canManageMembers={canManageMembers}
        />
      ))}
    </div>
  )
}