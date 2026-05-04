import type { Project } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { FolderKanban } from 'lucide-react'

export function ProjectCard({
  project,
  workspaceId,
}: {
  project: Project
  workspaceId: string
}) {
  return (
    <Link href={`/workspaces/${workspaceId}/projects/${project.id}`}>
      <div className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 transition-all duration-150 hover:bg-accent hover:border-border/80 cursor-pointer active:scale-[0.995]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
            <FolderKanban size={14} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{project.title}</p>
            {project.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
        </span>
      </div>
    </Link>
  )
}