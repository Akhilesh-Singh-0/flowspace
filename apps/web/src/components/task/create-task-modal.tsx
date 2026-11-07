'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTask } from '@/hooks/use-tasks'
import { useMembers } from '@/hooks/use-members'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/native-select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']),
  priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']),
  assigneeId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CreateTaskModal({
  open,
  onClose,
  workspaceId,
  projectId,
}: {
  open: boolean
  onClose: () => void
  workspaceId: string
  projectId: string
}) {
  const { mutate, isPending } = useCreateTask(workspaceId, projectId)
  const { data: members } = useMembers(workspaceId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'BACKLOG',
      priority: 'MEDIUM',
      assigneeId: '',
    },
  })

  function onSubmit(data: FormData) {
    mutate(
      {
        ...data,
        assigneeId: data.assigneeId || null,
      },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-small text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description <span className="font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="What needs to be done?"
              className="resize-none"
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <NativeSelect id="status" {...register('status')}>
                <option value="BACKLOG">Backlog</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
                <option value="CANCELLED">Cancelled</option>
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <NativeSelect id="priority" {...register('priority')}>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assigneeId">
              Assignee <span className="font-normal">(optional)</span>
            </Label>
            <NativeSelect id="assigneeId" {...register('assigneeId')}>
              <option value="">Unassigned</option>
              {members?.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name ?? m.user.email}
                </option>
              ))}
            </NativeSelect>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
