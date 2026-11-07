'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { MemberList } from '@/components/members/member-list'
import { InviteMemberModal } from '@/components/members/invite-member-modal'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { useCurrentRole } from '@/hooks/use-members'

export default function MembersPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [open, setOpen] = useState(false)
  const role = useCurrentRole(workspaceId)

  const canManageMembers = role === 'OWNER' || role === 'ADMIN'

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Header
        title="Members"
        description="Manage who has access to this workspace."
        action={
          canManageMembers ? (
            <Button onClick={() => setOpen(true)}>
              <UserPlus size={16} />
              Invite member
            </Button>
          ) : null
        }
      />
      <MemberList workspaceId={workspaceId} canManageMembers={canManageMembers} />
      <InviteMemberModal
        open={open}
        onClose={() => setOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  )
}