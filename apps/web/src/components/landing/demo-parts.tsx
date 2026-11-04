import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

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

export function Head({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="lp-app-head">
      <div>
        <p className="lp-app-title">{title}</p>
        <p className="lp-app-sub">{text}</p>
      </div>
      {children}
    </div>
  );
}

export function Btn({
  children,
  pressed,
  ghost,
}: {
  children: ReactNode;
  pressed?: boolean;
  ghost?: boolean;
}) {
  return (
    <span
      className={`lp-app-btn${ghost ? " lp-app-btn-ghost" : ""}${
        pressed ? " is-pressed" : ""
      }`}
    >
      {children}
    </span>
  );
}

export function Empty({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="lp-app-empty">
      <p className="lp-app-empty-title">{title}</p>
      <p className="lp-app-empty-text">{text}</p>
      {children}
    </div>
  );
}

export function Field({
  label,
  value,
  placeholder,
  focus,
  tall,
  select,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  focus?: boolean;
  tall?: boolean;
  select?: boolean;
}) {
  return (
    <div className="lp-fld">
      <span className="lp-fld-label">{label}</span>
      <div
        className={`lp-fld-box${tall ? " is-tall" : ""}${
          focus ? " is-focus" : ""
        }`}
      >
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="lp-fld-ph">{placeholder}</span>
        )}
        {focus && !select && <span className="lp-caret" />}
        {select && <ChevronDown className="lp-fld-chev" size={16} />}
      </div>
    </div>
  );
}
