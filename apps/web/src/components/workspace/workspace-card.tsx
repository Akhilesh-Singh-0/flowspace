import type { Workspace } from '@/types'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const roleColors: Record<string, string> = {
  OWNER: 'text-[#1D9E75]',
  ADMIN: 'text-blue-400',
  MEMBER: 'text-zinc-400',
  VIEWER: 'text-zinc-500',
}

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Link href={`/workspaces/${workspace.id}`}>
      <div className="group flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4 transition-colors hover:border-zinc-600 hover:bg-zinc-800/50 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-700 text-sm font-semibold text-white">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{workspace.name}</p>
            <p className="text-xs text-muted-foreground">/{workspace.slug}</p>
          </div>
        </div>
        <span className={cn('text-xs font-medium', roleColors[workspace.role])}>
          {workspace.role}
        </span>
      </div>
    </Link>
  )
}