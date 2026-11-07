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
  canManage,
}: {
  project: Project
  workspaceId: string
  canManage: boolean
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
    <Link
      href={`/workspaces/${workspaceId}/projects/${project.id}`}
      className="block rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div className="group flex cursor-pointer items-start justify-between gap-4 rounded-md px-3 py-2.5 transition-colors hover:bg-surface-hover">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-bone-subtle">
            <FolderKanban size={14} className="text-text-secondary" />
          </div>

          {editing ? (
            <div
              className="flex min-w-0 flex-1 items-center gap-2"
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
                className="h-8 flex-1 rounded-md border border-ring bg-surface px-3 text-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={handleEditSave}
                disabled={isUpdating}
                aria-label="Save title"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-bone text-text-inverse transition-colors hover:bg-bone-hover disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleEditCancel}
                aria-label="Cancel editing"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface-raised text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="min-w-0 pt-1">
              <p className="break-words text-medium font-semibold text-foreground">
                {project.title}
              </p>
              {project.description && (
                <p className="mt-0.5 max-w-3xl break-words text-small leading-relaxed text-text-secondary">
                  {project.description}
                </p>
              )}
            </div>
          )}
        </div>

        {!editing && (
          <div className="flex h-7 shrink-0 items-center gap-3">
            {timeAgo !== '' && (
              <span className="text-small tabular-nums text-text-secondary">
                {timeAgo}
              </span>
            )}

            {canManage && (
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <button
                  onClick={handleEditStart}
                  aria-label="Edit project"
                  title="Edit project"
                  className="flex h-6 w-6 items-center justify-center rounded text-text-secondary transition-colors hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Delete project"
                  title="Delete project"
                  className="flex h-6 w-6 items-center justify-center rounded text-text-secondary transition-colors hover:bg-surface-raised hover:text-priority-urgent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}