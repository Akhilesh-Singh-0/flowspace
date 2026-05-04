import type { Workspace } from '@/types'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

const roleConfig: Record<string, { label: string; className: string }> = {
  OWNER:  { label: 'Owner',  className: 'bg-primary/15 text-primary' },
  ADMIN:  { label: 'Admin',  className: 'bg-violet-400/15 text-violet-400' },
  MEMBER: { label: 'Member', className: 'bg-blue-400/15 text-blue-400' },
  VIEWER: { label: 'Viewer', className: 'bg-slate-400/15 text-slate-400' },
}

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const role = roleConfig[workspace.role]

  return (
    <Link href={`/workspaces/${workspace.id}`}>
      <div className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 transition-all duration-200 hover:bg-accent hover:border-primary/30 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.15)] cursor-pointer active:scale-[0.995]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/20 text-primary text-[13px] font-bold transition-colors duration-200 group-hover:bg-primary/30">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{workspace.name}</p>
            <p className="text-xs text-muted-foreground">/{workspace.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', role.className)}>
            {role.label}
          </span>
          <ArrowRight
            size={14}
            className="text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
          />
        </div>
      </div>
    </Link>
  )
}