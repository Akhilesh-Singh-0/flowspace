'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useProjects } from '@/hooks/use-projects'
import { useCurrentRole } from '@/hooks/use-members'
import { ProjectCard } from '@/components/project/project-card'
import { CreateProjectModal } from '@/components/project/create-project-modal'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [open, setOpen] = useState(false)
  const { data: projects, isLoading, isError } = useProjects(workspaceId)
  const role = useCurrentRole(workspaceId)

  const canCreateProject = role === 'OWNER' || role === 'ADMIN'
  const hasProjects = !isLoading && !isError && projects && projects.length > 0

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Header
        title="Projects"
        description="Everything your team is working on, in one place."
        action={
          canCreateProject && hasProjects ? (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} />
              New project
            </Button>
          ) : null
        }
      />

      <div className="-mx-3 space-y-0.5">
        {isLoading &&
          [1, 2, 3].map((item) => (
            <div key={item} className="flex h-11 items-center gap-3 px-3">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}

        {isError && (
          <p className="px-3 text-medium text-destructive">
            Failed to load projects. Please try again.
          </p>
        )}

        {!isLoading && !isError && projects?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-medium font-semibold text-foreground">
              No projects yet
            </p>
            <p className="mt-1 text-medium text-text-secondary">
              Create your first project and start tracking work.
            </p>
            {canCreateProject && (
              <Button onClick={() => setOpen(true)} className="mt-4">
                <Plus size={16} />
                New project
              </Button>
            )}
          </div>
        )}

        {projects?.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            workspaceId={workspaceId}
            canManage={canCreateProject}
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