"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectListTable } from "@/components/features/project-list-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { ProjectListItem, ApiCollectionResponse } from "@/lib/types/api";
import type { ProjectStatus } from "@/lib/types/domain";

type StatusFilter = ProjectStatus | "all";

export default function ProjectListPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const { data, isLoading } = useQuery<ApiCollectionResponse<ProjectListItem>>({
    queryKey: ["projects", statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/projects?status=${statusFilter}`);
      if (!res.ok) throw new Error("プロジェクト一覧の取得に失敗しました");
      return res.json();
    },
    staleTime: 30 * 1000, // 30秒
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ projectId, isFavorite }: { projectId: number; isFavorite: boolean }) => {
      const res = await fetch(`/api/projects/${projectId}/favorite`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite }),
      });
      if (!res.ok) throw new Error("お気に入りの更新に失敗しました");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handleFavoriteToggle = (projectId: number, newValue: boolean) => {
    favoriteMutation.mutate({ projectId, isFavorite: newValue });
  };

  const canCreateProject =
    session?.user?.role === "admin" || session?.user?.role === "pm";

  const projects = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          プロジェクト一覧
        </h1>
        <div className="flex items-center gap-3">
          {/* ステータスフィルタ */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">アクティブ</SelectItem>
              <SelectItem value="archived">アーカイブ</SelectItem>
              <SelectItem value="all">すべて</SelectItem>
            </SelectContent>
          </Select>

          {/* 新規作成ボタン（admin/pm のみ） */}
          {canCreateProject && (
            <Button asChild>
              <a href="/admin/projects">
                <Plus className="mr-2 h-4 w-4" />
                新規プロジェクト
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* コンテンツ */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <ProjectListTable
          projects={projects}
          onFavoriteToggle={handleFavoriteToggle}
        />
      )}
    </div>
  );
}
