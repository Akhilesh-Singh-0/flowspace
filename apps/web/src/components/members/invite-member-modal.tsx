'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useInviteMember } from '@/hooks/use-members'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const schema = z.object({
  targetUserId: z.string().email('Must be a valid email'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
})

type FormData = z.infer<typeof schema>

export function InviteMemberModal({
  open,
  onClose,
  workspaceId,
}: {
  open: boolean
  onClose: () => void
  workspaceId: string
}) {
  const { mutate, isPending } = useInviteMember(workspaceId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'MEMBER' },
  })

  function onSubmit(data: FormData) {
    mutate(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Invite member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="targetUserId">Email address</Label>
            <Input
              id="targetUserId"
              type="email"
              placeholder="colleague@company.com"
              className="bg-secondary border-border"
              {...register('targetUserId')}
            />
            {errors.targetUserId && (
              <p className="text-xs text-destructive">
                {errors.targetUserId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              {...register('role')}
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? 'Inviting...' : 'Invite member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}