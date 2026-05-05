'use client'

import { useState } from 'react'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { WorkspaceCard } from '@/components/workspace/workspace-card'
import { CreateWorkspaceModal } from '@/components/workspace/create-workspace-modal'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Layers, Users, Zap } from 'lucide-react'

export default function WorkspacesPage() {
  const [open, setOpen] = useState(false)
  const { data: workspaces, isLoading } = useWorkspaces()

  const isEmpty = !isLoading && (!workspaces || workspaces.length === 0)
  const hasWorkspaces = !isLoading && workspaces && workspaces.length > 0

  return (
    <div className="mx-auto max-w-2xl">
      <Header
        title="Your Workspaces"
        description="Pick up where you left off, or start something new."
        action={
          hasWorkspaces ? (
            <Button
              onClick={() => setOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus size={15} />
              New workspace
            </Button>
          ) : null
        }
      />

      {hasWorkspaces && (
        <div className="mb-6 rounded-xl border border-primary/10 bg-primary/5 px-5 py-4">
          <p className="text-sm font-semibold text-foreground mb-1">Welcome to FlowSpace</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            FlowSpace helps your team stay aligned — organize work into projects, track tasks across kanban boards, assign owners, and collaborate in real time.
          </p>
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Layers size={12} className="text-primary/60" />
              Projects & tasks
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users size={12} className="text-primary/60" />
              Team collaboration
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap size={12} className="text-primary/60" />
              Real-time updates
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers size={14} className="text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground">Projects</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users size={14} className="text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground">Team</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap size={14} className="text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground">Real-time</span>
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">No workspaces yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              A workspace is your team's home. Create one to start organizing projects, tracking tasks, and collaborating in real time.
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