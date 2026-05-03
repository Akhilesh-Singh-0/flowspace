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
      <div className="group flex items-center justify-between rounded-lg border border-zinc-700/50 bg-zinc-800/60 px-5 py-4 transition-colors hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-700">
            <FolderKanban size={16} className="text-zinc-300" />
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