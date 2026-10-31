"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, FolderKanban, Users } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams<{ workspaceId?: string }>();
  const workspaceId = params?.workspaceId;

  const navItemClass = (active: boolean) =>
    `relative flex h-8 items-center gap-3 rounded-md px-3 text-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
      active
        ? "bg-surface-hover font-semibold text-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-bone"
        : "text-text-secondary hover:bg-surface-hover hover:text-foreground"
    }`;

  return (
    <aside className="relative z-10 flex h-dvh w-56 shrink-0 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 px-6">
        <Logo size={24} />
        <span className="text-medium font-semibold text-foreground">
          FlowSpace
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        <Link
          href="/workspaces"
          aria-current={pathname === "/workspaces" ? "page" : undefined}
          className={navItemClass(pathname === "/workspaces")}
        >
          <LayoutDashboard size={16} strokeWidth={1.75} />
          <span>Workspaces</span>
        </Link>

        {workspaceId && (
          <div className="pt-5">
            <p className="px-3 pb-1.5 text-small font-semibold text-text-secondary">
              Workspace
            </p>

            <div className="space-y-0.5">
              <Link
                href={`/workspaces/${workspaceId}`}
                aria-current={
                  pathname === `/workspaces/${workspaceId}` ||
                  pathname.startsWith(`/workspaces/${workspaceId}/projects`)
                    ? "page"
                    : undefined
                }
                className={navItemClass(
                  pathname === `/workspaces/${workspaceId}` ||
                    pathname.startsWith(`/workspaces/${workspaceId}/projects`)
                )}
              >
                <FolderKanban size={16} strokeWidth={1.75} />
                <span>Projects</span>
              </Link>

              <Link
                href={`/workspaces/${workspaceId}/members`}
                aria-current={
                  pathname === `/workspaces/${workspaceId}/members`
                    ? "page"
                    : undefined
                }
                className={navItemClass(
                  pathname === `/workspaces/${workspaceId}/members`
                )}
              >
                <Users size={16} strokeWidth={1.75} />
                <span>Members</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className="flex h-14 shrink-0 items-center gap-3 px-6">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-medium font-semibold text-foreground">
          My Account
        </span>
      </div>
    </aside>
  );
}