'use client'

import { useEffect, useState } from 'react'
import { PanelRightClose, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import { useTaskLabels, useRemoveLabel } from '@/hooks/use-labels'
import { useUpdateTask, useDeleteTask } from '@/hooks/use-tasks'
import { useMembers } from '@/hooks/use-members'
import { CommentList } from '@/components/comment/comment-list'
import { CommentInput } from '@/components/comment/comment-input'
import { LabelBadge } from '@/components/label/label-badge'
import { AssignLabelModal } from '@/components/label/assign-label-modal'

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
]

type TaskUpdate = {
  title?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  assigneeId?: string | null
}

const iconButton =
  'flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50'

const iconButtonDanger =
  'flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-priority-urgent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50'

const fieldClass =
  'h-8 w-full rounded-md border border-transparent bg-transparent px-2 text-medium text-foreground outline-none transition-colors hover:bg-surface-hover focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50 [color-scheme:dark]'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-small font-semibold text-text-secondary">{children}</p>
  )
}

function Property({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-2">
      <span className="text-small font-semibold text-text-secondary">
        {label}
      </span>
      {children}
    </div>
  )
}

export function TaskDetail({
  task,
  projectId,
  workspaceId,
  canDelete = true,
  onClose,
  onDeleted,
}: {
  task: Task | null
  projectId: string
  workspaceId: string
  canDelete?: boolean
  onClose: () => void
  onDeleted?: () => void
}) {
  const [labelModalOpen, setLabelModalOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')

  const { data: taskLabels } = useTaskLabels(workspaceId, task?.id ?? '')
  const { mutate: removeLabel } = useRemoveLabel(workspaceId, task?.id ?? '')
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(workspaceId, projectId)
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(workspaceId, projectId)
  const { data: members } = useMembers(workspaceId)

  useEffect(() => {
    setTitleValue(task?.title ?? '')
  }, [task?.id, task?.title])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !labelModalOpen && !editingTitle) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, labelModalOpen, editingTitle])

  function update(data: TaskUpdate) {
    if (task) updateTask({ taskId: task.id, data })
  }

  function saveTitle() {
    const title = titleValue.trim()

    if (!task || !title || title === task.title) {
      setEditingTitle(false)
      return
    }

    updateTask(
      { taskId: task.id, data: { title } },
      { onSuccess: () => setEditingTitle(false) }
    )
  }

  function handleDelete() {
    if (!task) return

    deleteTask(task.id, {
      onSuccess: () => {
        onClose()
        onDeleted?.()
      },
    })
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${
          task ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed bottom-4 right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden rounded-lg border border-line bg-surface-raised transition-transform duration-300 ${
          task
            ? 'translate-x-0 shadow-[0_8px_24px_rgba(0,0,0,0.35)]'
            : 'translate-x-[calc(100%+2rem)]'
        }`}
      >
        {task && (
          <>
            <header className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
              <button
                onClick={onClose}
                aria-label="Close task"
                className={iconButton}
              >
                <PanelRightClose size={16} />
              </button>

              {!editingTitle && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingTitle(true)}
                    aria-label="Edit title"
                    className={iconButton}
                  >
                    <Pencil size={15} />
                  </button>
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      aria-label="Delete task"
                      className={iconButtonDanger}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              )}
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              {editingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTitle()
                      if (e.key === 'Escape') {
                        setTitleValue(task.title)
                        setEditingTitle(false)
                      }
                    }}
                    className="h-9 min-w-0 flex-1 rounded-md border border-ring bg-surface px-3 text-medium font-semibold text-foreground outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    onClick={saveTitle}
                    disabled={isUpdating}
                    aria-label="Save title"
                    className={iconButton}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setTitleValue(task.title)
                      setEditingTitle(false)
                    }}
                    aria-label="Cancel editing"
                    className={iconButton}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <h2 className="break-words text-large font-semibold text-foreground">
                  {task.title}
                </h2>
              )}

              <div className="space-y-1">
                <Property label="Status">
                  <select
                    value={task.status}
                    onChange={(e) => update({ status: e.target.value as TaskStatus })}
                    disabled={isUpdating}
                    aria-label="Status"
                    className={`${fieldClass} native-select`}
                  >
                    {statuses.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </Property>

                <Property label="Priority">
                  <select
                    value={task.priority}
                    onChange={(e) => update({ priority: e.target.value as TaskPriority })}
                    disabled={isUpdating}
                    aria-label="Priority"
                    className={`${fieldClass} native-select`}
                  >
                    {priorities.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </Property>

                <Property label="Due date">
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                    onChange={(e) => update({ dueDate: e.target.value || null })}
                    disabled={isUpdating}
                    aria-label="Due date"
                    className={fieldClass}
                  />
                </Property>

                <Property label="Assignee">
                  <select
                    value={task.assigneeId ?? ''}
                    onChange={(e) => update({ assigneeId: e.target.value || null })}
                    disabled={isUpdating}
                    aria-label="Assignee"
                    className={`${fieldClass} native-select`}
                  >
                    <option value="">Unassigned</option>
                    {members?.map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name ?? member.user.email}
                      </option>
                    ))}
                  </select>
                </Property>
              </div>

              {task.description && (
                <section className="space-y-2">
                  <SectionLabel>Description</SectionLabel>
                  <p className="whitespace-pre-wrap text-medium text-foreground">
                    {task.description}
                  </p>
                </section>
              )}

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <SectionLabel>Labels</SectionLabel>
                  <button
                    onClick={() => setLabelModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <Plus size={14} />
                    Add label
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {taskLabels?.length ? (
                    taskLabels.map((item) => (
                      <LabelBadge
                        key={item.labelId}
                        name={item.label.name}
                        color={item.label.color}
                        onRemove={() => removeLabel(item.labelId)}
                      />
                    ))
                  ) : (
                    <p className="text-medium text-text-secondary">
                      No labels assigned.
                    </p>
                  )}
                </div>
              </section>

              <section className="space-y-4 border-t border-line pt-5">
                <SectionLabel>Comments</SectionLabel>
                <CommentList workspaceId={workspaceId} taskId={task.id} />
                <CommentInput workspaceId={workspaceId} taskId={task.id} />
              </section>
            </div>

            <AssignLabelModal
              open={labelModalOpen}
              onClose={() => setLabelModalOpen(false)}
              workspaceId={workspaceId}
              taskId={task.id}
            />
          </>
        )}
      </aside>
    </>
  )
}