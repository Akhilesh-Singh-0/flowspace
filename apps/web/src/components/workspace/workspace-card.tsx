import type { Workspace } from '@/types'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const roleLabels: Record<string, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
}

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Link
      href={`/workspaces/${workspace.id}`}
      className="group flex h-11 items-center justify-between gap-4 rounded-md px-3 transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-bone-subtle text-small font-semibold text-foreground">
          {workspace.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex min-w-0 items-baseline gap-2">
          <p className="truncate text-medium font-semibold text-foreground">
            {workspace.name}
          </p>
          <p className="truncate text-small text-text-secondary">
            /{workspace.slug}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-small text-text-secondary">
          {roleLabels[workspace.role] ?? workspace.role}
        </span>

        <ArrowUpRight
          size={14}
          className="text-text-secondary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </div>
    </Link>
  )
}