import type { ReactNode } from "react";

export function Header({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <div className="min-w-0">
        <h1 className="text-large font-semibold text-foreground">{title}</h1>

        {description && (
          <p className="mt-1 text-medium text-text-secondary">{description}</p>
        )}
      </div>

      {action && <div className="flex shrink-0 items-center">{action}</div>}
    </header>
  );
}