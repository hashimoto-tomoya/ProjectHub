"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, StarOff, ChevronRight, Search, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectStatusBadge } from "@/components/features/project-status-badge";
import type { ProjectListItem } from "@/lib/types/api";

interface ProjectListTableProps {
  projects: ProjectListItem[];
  onFavoriteToggle: (projectId: number, newValue: boolean) => void;
}

export function ProjectListTable({ projects, onFavoriteToggle }: ProjectListTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = search
    ? projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : projects;

  return (
    <div className="space-y-4">
      {/* 検索フィルタ */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="プロジェクトを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* テーブル */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-12 px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                ★
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                プロジェクト名
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                PM
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                開始日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                ステータス
              </th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FolderOpen className="h-8 w-8 opacity-40" />
                    <p className="text-sm">プロジェクトが見つかりません</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  onFavoriteToggle={onFavoriteToggle}
                  onRowClick={() => router.push(`/projects/${project.id}/dashboard`)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ProjectRowProps {
  project: ProjectListItem;
  onFavoriteToggle: (projectId: number, newValue: boolean) => void;
  onRowClick: () => void;
}

function ProjectRow({ project, onFavoriteToggle, onRowClick }: ProjectRowProps) {
  const [optimisticFavorite, setOptimisticFavorite] = useState(project.isFavorite);

  // invalidateQueries 後にサーバーから最新データが返ったとき、ローカル state を同期する
  useEffect(() => {
    setOptimisticFavorite(project.isFavorite);
  }, [project.isFavorite]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !optimisticFavorite;
    setOptimisticFavorite(next);
    onFavoriteToggle(project.id, next);
  };

  return (
    <tr className="cursor-pointer transition-colors hover:bg-muted/40" onClick={onRowClick}>
      {/* お気に入りトグル */}
      <td className="px-3 py-3 text-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-amber-500"
          aria-label={optimisticFavorite ? "お気に入り解除" : "お気に入り登録"}
          onClick={handleFavoriteClick}
        >
          {optimisticFavorite ? (
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </Button>
      </td>

      {/* プロジェクト名 */}
      <td className="px-4 py-3">
        <span className="font-medium text-foreground">{project.name}</span>
      </td>

      {/* PM名 */}
      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{project.pmName}</td>

      {/* 開始日 */}
      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{project.startDate}</td>

      {/* ステータス */}
      <td className="px-4 py-3">
        <ProjectStatusBadge status={project.status} />
      </td>

      {/* 矢印ボタン */}
      <td className="px-3 py-3 text-right">
        <ChevronRight className="inline-block h-4 w-4 text-muted-foreground" />
      </td>
    </tr>
  );
}
