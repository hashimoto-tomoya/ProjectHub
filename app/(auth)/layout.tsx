import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">ProjectHub</h1>
        <p className="mt-1 text-sm text-gray-500">社内プロジェクト管理</p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
