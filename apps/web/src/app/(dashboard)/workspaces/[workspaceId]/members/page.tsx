'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { MemberList } from '@/components/members/member-list'
import { InviteMemberModal } from '@/components/members/invite-member-modal'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'

export default function MembersPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto max-w-3xl">
      <Header
        title="Members"
        description="Manage who has access to this workspace."
        action={
          <Button
            onClick={() => setOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <UserPlus size={15} />
            Invite member
          </Button>
        }
      />

      <MemberList workspaceId={workspaceId} />

      <InviteMemberModal
        open={open}
        onClose={() => setOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  )
}