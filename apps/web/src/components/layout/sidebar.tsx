'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, FolderKanban, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const params = useParams<{ workspaceId?: string }>()
  const workspaceId = params?.workspaceId

  const nav = [
    {
      label: 'Workspaces',
      href: '/workspaces',
      icon: LayoutDashboard,
      disabled: false,
    },
    {
      label: 'Projects',
      href: workspaceId ? `/workspaces/${workspaceId}` : null,
      icon: FolderKanban,
      disabled: !workspaceId,
    },
    {
      label: 'Members',
      href: workspaceId ? `/workspaces/${workspaceId}/members` : null,
      icon: Users,
      disabled: !workspaceId,
    },
  ]

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-[52px] items-center px-4 border-b border-border">
        <span className="text-primary font-semibold text-sm tracking-tight">
          FlowSpace
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ label, href, icon: Icon, disabled }) => {
          const isActive = href
            ? pathname === href || pathname.startsWith(`${href}/`)
            : false

          if (disabled) {
            return (
              <div
                key={label}
                title="Select a workspace first"
                className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground/40 cursor-not-allowed select-none"
              >
                <Icon size={14} strokeWidth={1.75} />
                {label}
              </div>
            )
          }

          return (
            <Link
              key={label}
              href={href!}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </Link>
          )
        })}

        {!workspaceId && (
          <p className="px-2.5 pt-2 text-[11px] text-muted-foreground/50">
            Select a workspace to access Projects and Members
          </p>
        )}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </aside>
  )
}