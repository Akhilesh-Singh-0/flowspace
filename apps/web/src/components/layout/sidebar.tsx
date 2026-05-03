'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, FolderKanban, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { label: 'Workspaces', href: '/workspaces', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Members', href: '/members', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-5">
        <span className="text-[#1D9E75] font-bold text-base tracking-tight">
          FlowSpace
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              pathname.startsWith(href)
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </aside>
  )
}