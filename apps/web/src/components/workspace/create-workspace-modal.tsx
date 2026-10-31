'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateWorkspace } from '@/hooks/use-workspaces'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
})

type FormData = z.infer<typeof schema>

export function CreateWorkspaceModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { mutate, isPending } = useCreateWorkspace()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const nameField = register('name')

  function onSubmit(data: FormData) {
    mutate(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
      onError: (error: unknown) => {
        const err = error as {
          response?: { data?: { error?: { message?: string } } }
        }

        if (err?.response?.data?.error?.message === 'Workspace slug already exists') {
          toast.error('This slug is already taken. Try another one.')
        } else {
          toast.error('Failed to create workspace. Please try again.')
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace name</Label>
            <Input
              id="name"
              placeholder="My Workspace"
              {...nameField}
              onChange={(event) => {
                nameField.onChange(event)

                const slug = event.target.value
                  .toLowerCase()
                  .trim()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, '')

                setValue('slug', slug, { shouldValidate: true })
              }}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Workspace URL</Label>
            <Input
              id="slug"
              placeholder="my-workspace"
              {...register('slug')}
            />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create workspace'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}