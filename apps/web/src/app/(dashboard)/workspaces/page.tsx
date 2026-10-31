'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { WorkspaceCard } from '@/components/workspace/workspace-card'
import { CreateWorkspaceModal } from '@/components/workspace/create-workspace-modal'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function WorkspacesPage() {
  const [open, setOpen] = useState(false)
  const { data: workspaces, isLoading } = useWorkspaces()

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Header
        title="Workspaces"
        description="Manage your teams and their projects."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} />
            New workspace
          </Button>
        }
      />

      <div className="-mx-3 mt-4">
        {isLoading ? (
          <div className="space-y-0.5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex h-11 items-center gap-3 px-3">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        ) : workspaces?.length ? (
          <div className="space-y-0.5">
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-medium font-semibold text-foreground">
              No workspaces yet
            </p>
            <p className="mt-1 text-medium text-text-secondary">
              Create a workspace to start organizing your team&apos;s work.
            </p>
          </div>
        )}
      </div>

      <CreateWorkspaceModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}