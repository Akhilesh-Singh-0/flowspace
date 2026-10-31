
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-[#bdb9b2]">{children}</p>
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
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
          task ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border bg-card transition-transform duration-300 ${
          task ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {task && (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-4">
              {editingTitle ? (
                <>
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
                    className="h-9 min-w-0 flex-1 border border-border bg-transparent px-2 text-sm text-foreground outline-none focus:border-[#b46770]"
                  />
                  <button onClick={saveTitle} disabled={isUpdating} aria-label="Save title">
                    <Check size={17} />
                  </button>
                  <button
                    onClick={() => {
                      setTitleValue(task.title)
                      setEditingTitle(false)
                    }}
                    aria-label="Cancel editing"
                  >
                    <X size={17} />
                  </button>
                </>
              ) : (
                <>
                  <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
                    {task.title}
                  </h2>
                  <button onClick={() => setEditingTitle(true)} aria-label="Edit title">
                    <Pencil size={15} />
                  </button>
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      aria-label="Delete task"
                      className="text-[#d08b91] hover:text-[#e5a0a6]"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button onClick={onClose} aria-label="Close task">
                    <PanelRightClose size={18} />
                  </button>
                </>
              )}
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <div className="space-y-2">
                  <SectionLabel>Status</SectionLabel>
                  <select
                    value={task.status}
                    onChange={(e) => update({ status: e.target.value as TaskStatus })}
                    disabled={isUpdating}
                    className="h-9 w-full border-b border-border bg-transparent text-sm text-foreground outline-none focus:border-[#b46770]"
                  >
                    {statuses.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <SectionLabel>Priority</SectionLabel>
                  <select
                    value={task.priority}
                    onChange={(e) => update({ priority: e.target.value as TaskPriority })}
                    disabled={isUpdating}
                    className="h-9 w-full border-b border-border bg-transparent text-sm text-foreground outline-none focus:border-[#b46770]"
                  >
                    {priorities.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <SectionLabel>Due date</SectionLabel>
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                    onChange={(e) => update({ dueDate: e.target.value || null })}
                    disabled={isUpdating}
                    className="h-9 w-full border-b border-border bg-transparent text-sm text-foreground outline-none focus:border-[#b46770]"
                  />
                </div>

                <div className="space-y-2">
                  <SectionLabel>Assignee</SectionLabel>
                  <select
                    value={task.assigneeId ?? ''}
                    onChange={(e) => update({ assigneeId: e.target.value || null })}
                    disabled={isUpdating}
                    className="h-9 w-full border-b border-border bg-transparent text-sm text-foreground outline-none focus:border-[#b46770]"
                  >
                    <option value="">Unassigned</option>
                    {members?.map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name ?? member.user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {task.description && (
                <section className="space-y-2">
                  <SectionLabel>Description</SectionLabel>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#e5e1da]">
                    {task.description}
                  </p>
                </section>
              )}

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <SectionLabel>Labels</SectionLabel>
                  <button
                    onClick={() => setLabelModalOpen(true)}
                    className="flex items-center gap-1.5 text-sm text-[#d8a0a6] hover:text-[#e5b5ba]"
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
                    <p className="text-sm text-[#bdb9b2]">No labels assigned.</p>
                  )}
                </div>
              </section>

              <section className="space-y-4 border-t border-border pt-5">
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