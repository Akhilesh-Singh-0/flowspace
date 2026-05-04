'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateLabel } from '@/hooks/use-labels'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#64748b',
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
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">
            Add Label
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">

          {/* Label name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Label name
            </label>
            <Input
              placeholder="e.g. Bug, Feature, Design…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50"
              autoFocus
            />
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-transform duration-150 hover:scale-110 focus:outline-none"
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <span className="flex items-center justify-center w-full h-full text-white text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">Preview:</span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                style={{
                  backgroundColor: `${color}18`,
                  borderColor: `${color}40`,
                  color: color,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                {name.trim() || 'Label'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? 'Adding…' : 'Add Label'}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}