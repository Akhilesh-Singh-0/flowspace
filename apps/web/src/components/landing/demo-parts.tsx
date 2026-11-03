export const STATUSES = {
  BACKLOG: { label: "Backlog", color: "var(--status-backlog)", hollow: true },
  IN_PROGRESS: {
    label: "In Progress",
    color: "var(--status-progress)",
    hollow: false,
  },
  IN_REVIEW: {
    label: "In Review",
    color: "var(--status-review)",
    hollow: false,
  },
  DONE: { label: "Done", color: "var(--status-done)", hollow: false },
  CANCELLED: {
    label: "Cancelled",
    color: "var(--status-cancelled)",
    hollow: false,
  },
} as const;

export type StatusKey = keyof typeof STATUSES;

export function StatusDot({ status }: { status: StatusKey }) {
  const { color, hollow } = STATUSES[status];

  return (
    <span
      className={`lp-dot${hollow ? " lp-dot-hollow" : ""}`}
      style={hollow ? { borderColor: color } : { backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

export function Bars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="lp-bars" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= level ? "is-on" : undefined} />
      ))}
    </span>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <span className="lp-avatar" aria-hidden="true">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
