import { X } from 'lucide-react'

export function LabelBadge({
  name,
  color,
  onRemove,
}: {
  name: string
  color: string
  onRemove?: () => void
}) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-surface-hover px-2 text-small font-semibold text-foreground">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Remove label ${name}`}
          className="-mr-0.5 flex h-4 w-4 items-center justify-center rounded text-text-secondary transition-colors hover:text-foreground"
        >
          <X size={10} strokeWidth={2.5} />
        </button>
      )}
    </span>
  )
}