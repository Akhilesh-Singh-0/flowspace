'use client'

import type { Project } from '@/types'
import Link from 'next/link'
import { FolderKanban, Pencil, Trash2, Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useState, useEffect } from 'react'
import { useUpdateProject, useDeleteProject } from '@/hooks/use-projects'

function useTimeAgo(dateString: string) {
  const [timeAgo, setTimeAgo] = useState<string>(() => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return formatDistanceToNow(date, { addSuffix: true })
  })

  useEffect(() => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return
    setTimeAgo(formatDistanceToNow(date, { addSuffix: true }))
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(date, { addSuffix: true }))
    }, 60000)
    return () => clearInterval(interval)
  }, [dateString])

  return timeAgo
}

export function ProjectCard({
  project,
  workspaceId,
}: {
  project: Project
  workspaceId: string
}) {
  const timeAgo = useTimeAgo(project.createdAt)
  const [editing, setEditing] = useState(false)
  const [titleValue, setTitleValue] = useState(project.title)

  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject(workspaceId)
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject(workspaceId)

  function handleEditSave(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!titleValue.trim() || titleValue.trim() === project.title) {
      setEditing(false)
      return
    }
    updateProject(
      { projectId: project.id, data: { title: titleValue.trim() } },
      { onSuccess: () => setEditing(false) }
    )
  }

  function handleEditCancel(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault()
    e.stopPropagation()
    setTitleValue(project.title)
    setEditing(false)
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    deleteProject(project.id)
  }

  function handleEditStart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setTitleValue(project.title)
    setEditing(true)
  }

  return (
    <Link href={`/workspaces/${workspaceId}/projects/${project.id}`}>
      <div className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 transition-all duration-200 hover:bg-accent hover:border-primary/30 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.15)] cursor-pointer active:scale-[0.995]">

        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary transition-colors duration-200 group-hover:bg-primary/20 shrink-0">
            <FolderKanban
              size={15}
              className="text-muted-foreground transition-colors duration-200 group-hover:text-primary"
            />
          </div>

          {editing ? (
            <div
              className="flex items-center gap-2 flex-1 min-w-0"
              onClick={(e) => e.preventDefault()}
            >
              <input
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave(e)
                  if (e.key === 'Escape') handleEditCancel(e)
                }}
                onClick={(e) => e.preventDefault()}
                className="flex-1 bg-secondary border border-primary/40 rounded-md px-3 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={handleEditSave}
                disabled={isUpdating}
                className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40 transition-all duration-150 shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleEditCancel}
                className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{project.title}</p>
              {project.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {project.description}
                </p>
              )}
            </div>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-3 shrink-0 ml-4">
            {timeAgo !== '' && (
              <span className="text-xs text-muted-foreground/50 tabular-nums">
                {timeAgo}
              </span>
            )}

            <div className="flex items-center gap-0.5 rounded-md border border-border bg-secondary px-0.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={handleEditStart}
                title="Edit project"
                className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete project"
                className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-150"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}