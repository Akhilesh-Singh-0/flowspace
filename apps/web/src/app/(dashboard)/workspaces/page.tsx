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
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus size={15} />
            New workspace
          </Button>
        }
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="divide-y divide-border border-y border-border">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3 py-4">
                <Skeleton className="h-9 w-9 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : workspaces?.length ? (
          <div className="divide-y divide-border border-y border-border">
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        ) : (
          <div className="border-y border-border py-14 text-center">
            <p className="text-sm font-medium text-foreground">
              No workspaces yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a workspace to start organizing your team's work.
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