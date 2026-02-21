"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTree,
  ClipboardList,
  FileCheck2,
  Bug,
  BarChart3,
  Users,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types/domain";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: Role[];
}

const projectNavItems: NavItem[] = [
  {
    label: "ダッシュボード",
    href: "dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "WBS・タスク管理",
    href: "wbs",
    icon: ListTree,
  },
  {
    label: "日報入力・管理",
    href: "daily-reports",
    icon: ClipboardList,
  },
  {
    label: "レビュー記録票",
    href: "reviews",
    icon: FileCheck2,
  },
  {
    label: "障害管理票",
    href: "bugs",
    icon: Bug,
  },
  {
    label: "レポート・分析",
    href: "reports",
    icon: BarChart3,
  },
];

const adminNavItems: NavItem[] = [
  {
    label: "ユーザー管理",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "プロジェクト管理",
    href: "/admin/projects",
    icon: FolderKanban,
    roles: ["admin", "pm"],
  },
];

interface AppSidebarProps {
  role: Role;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params?.id as string | undefined;

  const visibleAdminItems = adminNavItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const getProjectHref = (segment: string) => {
    if (!projectId) return "/projects";
    return `/projects/${projectId}/${segment}`;
  };

  const isActive = (href: string) => {
    if (href.startsWith("/admin")) {
      return pathname === href || pathname.startsWith(href + "/");
    }
    const fullHref = getProjectHref(href);
    return pathname === fullHref || pathname.startsWith(fullHref + "/");
  };

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col bg-slate-900">
      {/* Sidebar body */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {/* Project navigation */}
        <div className="space-y-0.5">
          {projectNavItems.map((item) => {
            const href = getProjectHref(item.href);
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin section */}
        {visibleAdminItems.length > 0 && (
          <>
            <div className="my-2 border-t border-slate-700" />
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              管理
            </p>
            <div className="space-y-0.5">
              {visibleAdminItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-indigo-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
