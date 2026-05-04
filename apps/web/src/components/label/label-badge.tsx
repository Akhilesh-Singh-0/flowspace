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
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: `${color}18`,
        borderColor: `${color}50`,
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
          className="ml-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full border transition-all duration-150 hover:brightness-125"
          style={{
            backgroundColor: `${color}25`,
            borderColor: `${color}60`,
            color: color,
          }}
        >
          <X size={9} strokeWidth={3} />
        </button>
      )}
    </span>
  )
}