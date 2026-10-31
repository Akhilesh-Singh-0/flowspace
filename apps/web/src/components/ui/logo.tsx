export function Logo({
  size = 24,
  className = "text-bone",
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect x="6" y="4" width="20" height="7" rx="2.5" fill="currentColor" />
      <rect
        x="3"
        y="13"
        width="20"
        height="7"
        rx="2.5"
        fill="currentColor"
        opacity="0.7"
      />
      <rect
        x="8"
        y="22"
        width="18"
        height="6"
        rx="2.5"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  )
}