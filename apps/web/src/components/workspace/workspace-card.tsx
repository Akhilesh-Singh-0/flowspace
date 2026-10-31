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
      className="group flex items-center justify-between gap-4 px-3 py-4 transition-colors hover:bg-accent/50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-sm font-medium text-foreground">
          {workspace.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {workspace.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            /{workspace.slug}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="text-xs text-secondary-foreground">
          {roleLabels[workspace.role] ?? workspace.role}
        </span>

        <ArrowUpRight
          size={15}
          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </Link>
  )
}