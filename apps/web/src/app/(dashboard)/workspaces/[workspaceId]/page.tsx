'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useProjects } from '@/hooks/use-projects'
import { ProjectCard } from '@/components/project/project-card'
import { CreateProjectModal } from '@/components/project/create-project-modal'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [open, setOpen] = useState(false)
  const { data: projects, isLoading, isError } = useProjects(workspaceId)

  return (
    <div className="mx-auto max-w-2xl">
      <Header
        title="Projects"
        description="Everything your team is working on, in one place."
        action={
          <Button
            onClick={() => setOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus size={15} />
            New project
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
            Failed to load projects. Please try again.
          </p>
        )}

        {!isLoading && !isError && projects?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-sm font-medium text-foreground">No projects yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first project and start tracking work.
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus size={15} />
              New project
            </Button>
          </div>
        )}

        {projects?.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            workspaceId={workspaceId}
          />
        ))}
      </div>

      <CreateProjectModal
        open={open}
        onClose={() => setOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  )
}