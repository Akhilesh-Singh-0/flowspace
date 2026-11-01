'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LabelBadge } from '@/components/label/label-badge'
import { useCreateLabel } from '@/hooks/use-labels'

const PRESET_COLORS = [
  '#5fa8a0', '#6baa7f', '#a9b04f',
  '#d4a24c', '#d08a4a', '#c9625d',
  '#b8737c', '#8b84b8', '#6f8fb5',
  '#a58b6f', '#8a8982', '#e8e3d6',
]

export function AssignLabelModal({
  open,
  onClose,
  workspaceId,
  taskId,
}: {
  open: boolean
  onClose: () => void
  workspaceId: string
  taskId: string
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const { mutate: createLabel, isPending } = useCreateLabel(workspaceId, taskId)

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) return

    createLabel(
      { name: trimmed, color },
      {
        onSuccess: () => {
          setName('')
          setColor(PRESET_COLORS[0])
          onClose()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add label</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="label-name">Label name</Label>
            <Input
              id="label-name"
              placeholder="e.g. Bug, Feature, Design…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div
              role="group"
              aria-label="Label color"
              className="flex flex-wrap gap-2.5"
            >
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  aria-pressed={color === c}
                  className={`h-6 w-6 rounded-full transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover ${
                    color === c
                      ? 'ring-2 ring-foreground ring-offset-2 ring-offset-popover'
                      : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-small text-text-secondary">Preview</span>
              <LabelBadge name={name.trim() || 'Label'} color={color} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || isPending}
            >
              {isPending ? 'Adding…' : 'Add label'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
