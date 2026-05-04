import type { Workspace } from '@/types'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const roleColors: Record<string, string> = {
  OWNER: 'text-primary',
  ADMIN: 'text-blue-400',
  MEMBER: 'text-muted-foreground',
  VIEWER: 'text-muted-foreground',
}

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Link href={`/workspaces/${workspace.id}`}>
      <div className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 transition-all duration-150 hover:bg-accent hover:border-border/80 cursor-pointer active:scale-[0.995]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-[13px] font-semibold text-foreground">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{workspace.name}</p>
            <p className="text-xs text-muted-foreground">/{workspace.slug}</p>
          </div>
        </div>
        <span className={cn('text-xs font-medium tracking-wide', roleColors[workspace.role])}>
          {workspace.role}
        </span>
      </div>
    </Link>
  )
}