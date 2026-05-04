'use client'

import { useState } from 'react'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { WorkspaceCard } from '@/components/workspace/workspace-card'
import { CreateWorkspaceModal } from '@/components/workspace/create-workspace-modal'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function WorkspacesPage() {
  const [open, setOpen] = useState(false)
  const { data: workspaces, isLoading, isError } = useWorkspaces()

  return (
    <div className="mx-auto max-w-2xl">
      <Header
        title="Your Workspaces"
        description="Pick up where you left off, or start something new."
        action={
          <Button
            onClick={() => setOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus size={15} />
            New workspace
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Failed to load workspaces. Please try again.
          </p>
        )}

        {!isLoading && !isError && workspaces?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-sm font-medium text-foreground">No workspaces yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a workspace to start organizing your projects and team.
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus size={15} />
              New workspace
            </Button>
          </div>
        )}

        {workspaces?.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </div>

      <CreateWorkspaceModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}