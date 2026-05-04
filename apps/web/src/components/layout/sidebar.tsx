'use client'

import { Logo } from '@/components/ui/logo'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, FolderKanban, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const params = useParams<{ workspaceId?: string }>()
  const workspaceId = params?.workspaceId

  const topNav = [
    {
      label: 'Workspaces',
      href: '/workspaces',
      icon: LayoutDashboard,
      isActive: pathname === '/workspaces',
    },
  ]

  const workspaceNav = workspaceId ? [
    {
      label: 'Projects',
      href: `/workspaces/${workspaceId}`,
      icon: FolderKanban,
      isActive:
        pathname === `/workspaces/${workspaceId}` ||
        pathname.startsWith(`/workspaces/${workspaceId}/projects`),
    },
    {
      label: 'Members',
      href: `/workspaces/${workspaceId}/members`,
      icon: Users,
      isActive: pathname === `/workspaces/${workspaceId}/members`,
    },
  ] : []

  return (
    <aside
      className="flex w-56 shrink-0 flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, hsl(250 60% 14%) 0%, hsl(240 50% 10%) 40%, hsl(230 45% 8%) 100%)',
        borderRight: '1px solid hsl(243 75% 65% / 0.12)',
      }}
    >
      {/* top glow */}
      <div className="pointer-events-none absolute -top-10 -left-10 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
      {/* bottom glow */}
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />

      {/* header */}
      <div className="relative flex h-[52px] items-center gap-2.5 px-4"
        style={{ borderBottom: '1px solid hsl(243 75% 65% / 0.12)' }}
      >
        <Logo size={28} />
        <span className="text-white font-semibold text-sm tracking-tight">
          FlowSpace
        </span>
      </div>

      {/* nav */}
      <nav className="relative flex-1 px-2 py-3 space-y-0.5">
        {topNav.map(({ label, href, icon: Icon, isActive }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-all duration-150',
              isActive
                ? 'bg-white/15 text-white font-medium shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]'
                : 'text-white/50 hover:bg-white/8 hover:text-white/80'
            )}
          >
            <Icon size={14} strokeWidth={1.75} />
            {label}
          </Link>
        ))}

        {workspaceNav.length > 0 && (
          <>
            <div className="pt-4 pb-1 px-2.5">
              <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                Workspace
              </p>
            </div>
            {workspaceNav.map(({ label, href, icon: Icon, isActive }) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-all duration-150',
                  isActive
                    ? 'bg-white/15 text-white font-medium shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]'
                    : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                )}
              >
                <Icon size={14} strokeWidth={1.75} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* footer */}
      <div
        className="relative px-3 py-3 flex items-center gap-2.5"
        style={{ borderTop: '1px solid hsl(243 75% 65% / 0.12)' }}
      >
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-xs text-white/40 truncate">My Account</span>
      </div>
    </aside>
  )
}