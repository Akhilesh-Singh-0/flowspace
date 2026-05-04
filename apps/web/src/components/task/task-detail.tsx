'use client'

import { useEffect, useState } from 'react'
import { PanelRightClose, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import { cn } from '@/lib/utils'
import { useTaskLabels, useRemoveLabel } from '@/hooks/use-labels'
import { useUpdateTask, useDeleteTask } from '@/hooks/use-tasks'
import { useMembers } from '@/hooks/use-members'
import { CommentList } from '@/components/comment/comment-list'
import { CommentInput } from '@/components/comment/comment-input'
import { LabelBadge } from '@/components/label/label-badge'
import { AssignLabelModal } from '@/components/label/assign-label-modal'

const statusOptions: { value: TaskStatus; label: string; className: string }[] = [
  { value: 'BACKLOG',     label: 'Backlog',     className: 'bg-slate-400/10 text-slate-300 border-slate-400/30' },
  { value: 'IN_PROGRESS', label: 'In Progress', className: 'bg-blue-400/10 text-blue-300 border-blue-400/30' },
  { value: 'IN_REVIEW',   label: 'In Review',   className: 'bg-violet-400/10 text-violet-300 border-violet-400/30' },
  { value: 'DONE',        label: 'Done',        className: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30' },
  { value: 'CANCELLED',   label: 'Cancelled',   className: 'bg-rose-400/10 text-rose-300 border-rose-400/30' },
]

const priorityOptions: { value: TaskPriority; label: string; className: string }[] = [
  { value: 'URGENT', label: 'Urgent', className: 'bg-rose-400/10 text-rose-300 border-rose-400/30' },
  { value: 'HIGH',   label: 'High',   className: 'bg-orange-400/10 text-orange-300 border-orange-400/30' },
  { value: 'MEDIUM', label: 'Medium', className: 'bg-sky-400/10 text-sky-300 border-sky-400/30' },
  { value: 'LOW',    label: 'Low',    className: 'bg-slate-400/10 text-slate-300 border-slate-400/30' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
      {children}
    </p>
  )
}

export function TaskDetail({
  task,
  projectId,
  workspaceId,
  onClose,
  onDeleted,
}: {
  task: Task | null
  projectId: string
  workspaceId: string
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
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !labelModalOpen && !editingTitle) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, labelModalOpen, editingTitle])

  useEffect(() => {
    if (task) setTitleValue(task.title)
  }, [task?.id])

  function handleTitleSave() {
    if (!task || !titleValue.trim() || titleValue.trim() === task.title) {
      setEditingTitle(false)
      return
    }
    updateTask(
      { taskId: task.id, data: { title: titleValue.trim() } },
      { onSuccess: () => setEditingTitle(false) }
    )
  }

  function handleStatusChange(status: TaskStatus) {
    if (!task) return
    updateTask({ taskId: task.id, data: { status } })
  }

  function handlePriorityChange(priority: TaskPriority) {
    if (!task) return
    updateTask({ taskId: task.id, data: { priority } })
  }

  function handleDueDateChange(dueDate: string) {
    if (!task) return
    updateTask({ taskId: task.id, data: { dueDate: dueDate || null } })
  }

  function handleAssigneeChange(assigneeId: string) {
    if (!task) return
    console.log('assignee change:', assigneeId, 'task:', task.id)
    updateTask({ taskId: task.id, data: { assigneeId: assigneeId || null } })
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

  const currentStatus = statusOptions.find((s) => s.value === task?.status)
  const currentPriority = priorityOptions.find((p) => p.value === task?.priority)

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-200',
          task ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out flex flex-col',
          task ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {task && (
          <>

            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border shrink-0 bg-card">
              {editingTitle ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    autoFocus
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave()
                      if (e.key === 'Escape') {
                        setTitleValue(task.title)
                        setEditingTitle(false)
                      }
                    }}
                    className="flex-1 bg-secondary border border-primary/40 rounded-md px-3 py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    onClick={handleTitleSave}
                    disabled={isUpdating}
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-all duration-150"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setTitleValue(task.title); setEditingTitle(false) }}
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary border border-border text-foreground hover:bg-accent transition-all duration-150"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1 min-w-0 group/title">
                  <h2 className="text-base font-semibold text-foreground leading-snug truncate">
                    {task.title}
                  </h2>
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="opacity-0 group-hover/title:opacity-100 flex items-center justify-center w-6 h-6 rounded-md text-foreground/60 hover:text-foreground hover:bg-accent transition-all duration-150 shrink-0"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}

              {!editingTitle && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-secondary text-foreground/70 hover:text-rose-400 hover:bg-rose-400/10 hover:border-rose-400/30 transition-all duration-150"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-secondary text-foreground/70 hover:text-foreground hover:bg-accent transition-all duration-150"
                  >
                    <PanelRightClose className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <SectionLabel>Status</SectionLabel>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    disabled={isUpdating}
                    className={cn(
                      'w-full rounded-md border px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer transition-all duration-150',
                      currentStatus?.className
                    )}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <SectionLabel>Priority</SectionLabel>
                  <select
                    value={task.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                    disabled={isUpdating}
                    className={cn(
                      'w-full rounded-md border px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer transition-all duration-150',
                      currentPriority?.className
                    )}
                  >
                    {priorityOptions.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <SectionLabel>Due Date</SectionLabel>
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    disabled={isUpdating}
                    className="w-full rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer transition-all duration-150"
                  />
                </div>

                <div className="space-y-1.5">
                  <SectionLabel>Assignee</SectionLabel>
                  <select
                    value={task.assigneeId ?? ''}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    disabled={isUpdating}
                    className="w-full rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer transition-all duration-150"
                  >
                    <option value="">Unassigned</option>
                    {members?.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name ?? m.user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {task.description && (
                <div className="space-y-1.5">
                  <SectionLabel>Description</SectionLabel>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <SectionLabel>Labels</SectionLabel>
                  <button
                    onClick={() => setLabelModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-primary/40 bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 hover:border-primary/60 transition-all duration-150"
                  >
                    <Plus className="w-3 h-3" />
                    Add Label
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {taskLabels && taskLabels.length > 0 ? (
                    taskLabels.map((tl) => (
                      <LabelBadge
                        key={tl.labelId}
                        name={tl.label.name}
                        color={tl.label.color}
                        onRemove={() => removeLabel(tl.labelId)}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No labels assigned.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border" />

              <div className="space-y-4">
                <SectionLabel>Comments</SectionLabel>
                <CommentList workspaceId={workspaceId} taskId={task.id} />
                <CommentInput workspaceId={workspaceId} taskId={task.id} />
              </div>
            </div>

            <AssignLabelModal
              open={labelModalOpen}
              onClose={() => setLabelModalOpen(false)}
              workspaceId={workspaceId}
              taskId={task.id}
            />
          </>
        )}
      </div>
    </>
  )
}