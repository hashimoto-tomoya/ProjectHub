"use client";

import { Archive, Pencil, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProjectListItem } from "@/lib/types/api";

interface ProjectManagementTableProps {
  projects: ProjectListItem[];
  onEdit: (project: ProjectListItem) => void;
  onArchive: (project: ProjectListItem) => void;
}

export function ProjectManagementTable({
  projects,
  onEdit,
  onArchive,
}: ProjectManagementTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              プロジェクト名
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
              PM
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
              開始日
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
              終了予定日
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              ステータス
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {projects.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <FolderOpen className="h-8 w-8 opacity-40" />
                  <p className="text-sm">プロジェクトが見つかりません</p>
                </div>
              </td>
            </tr>
          ) : (
            projects.map((project) => (
              <tr key={project.id} className="transition-colors hover:bg-muted/40">
                {/* プロジェクト名 */}
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{project.name}</span>
                </td>

                {/* PM名 */}
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                  {project.pmName}
                </td>

                {/* 開始日 */}
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                  {project.startDate}
                </td>

                {/* 終了予定日 */}
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                  {project.endDate ?? "—"}
                </td>

                {/* ステータス */}
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>

                {/* 操作ボタン */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(project)}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      編集
                    </Button>
                    {project.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => onArchive(project)}
                      >
                        <Archive className="mr-1.5 h-3.5 w-3.5" />
                        アーカイブ
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      >
        進行中
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-muted-foreground">
      アーカイブ
    </Badge>
  );
}
