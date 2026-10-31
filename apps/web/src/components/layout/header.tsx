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
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#2a2d2f] pb-5">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[#f0efec]">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-sm leading-relaxed text-[#d8d4ce]">
            {description}
          </p>
        )}
      </div>

      {action && <div className="flex shrink-0 items-center">{action}</div>}
    </header>
  );
}