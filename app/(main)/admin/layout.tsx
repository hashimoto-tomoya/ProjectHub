import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";

export default async function AdminGuardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  // admin または pm 以外はプロジェクト一覧へリダイレクト
  if (role !== "admin" && role !== "pm") {
    redirect("/projects");
  }

  return <>{children}</>;
}
