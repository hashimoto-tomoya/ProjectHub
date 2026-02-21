import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/features/app-sidebar";
import { GlobalProjectSelector } from "@/components/features/global-project-selector";
import { UserMenu } from "@/components/features/user-menu";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AppSidebar role={session.user.role ?? "developer"} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
          {/* Logo */}
          <Link
            href="/projects"
            className="text-base font-bold text-gray-900 transition-colors hover:text-indigo-600"
          >
            ProjectHub
          </Link>

          {/* Project selector */}
          <GlobalProjectSelector />

          {/* User menu */}
          <UserMenu userName={session.user.name ?? "ユーザー"} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
