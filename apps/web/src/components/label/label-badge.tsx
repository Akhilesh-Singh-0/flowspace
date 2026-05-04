import { cn } from '@/lib/utils'

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
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
        >
          x
        </button>
      )}
    </span>
  )
}