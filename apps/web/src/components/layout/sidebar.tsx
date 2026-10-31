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
    `flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors ${
      active
        ? "bg-[#202023] font-medium text-[#eeeeef]"
        : "text-[#a1a1a6] hover:bg-[#18181b] hover:text-[#eeeeef]"
    }`;

  return (
    <aside className="relative z-10 flex h-dvh w-60 shrink-0 flex-col bg-[#0b0c0e]">
      <div className="flex h-14 shrink-0 items-center gap-3 px-5">
        <Logo size={27} />
        <span className="text-base font-semibold tracking-tight text-[#eeeeef]">
          FlowSpace
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <Link
          href="/workspaces"
          aria-current={pathname === "/workspaces" ? "page" : undefined}
          className={navItemClass(pathname === "/workspaces")}
        >
          <LayoutDashboard size={16} strokeWidth={1.8} />
          <span>Workspaces</span>
        </Link>

        {workspaceId && (
          <div className="pt-7">
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-[#77777d]">
              Workspace
            </p>

            <div className="space-y-1">
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
                <FolderKanban size={16} strokeWidth={1.8} />
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
                <Users size={16} strokeWidth={1.8} />
                <span>Members</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className="flex h-16 shrink-0 items-center gap-3 px-4">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-sm font-medium text-[#eeeeef]">
          My Account
        </span>
      </div>
    </aside>
  );
}