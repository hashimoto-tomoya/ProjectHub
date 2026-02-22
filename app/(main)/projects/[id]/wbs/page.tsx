"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutList, BarChart2 } from "lucide-react";
import { WbsTreeTable } from "@/components/features/wbs-tree-table";
import { GanttChart } from "@/components/features/gantt-chart";
import { TaskSlideOver } from "@/components/features/task-slide-over";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import type { TaskResponse, ApiSuccessResponse } from "@/lib/types/api";

type ViewMode = "wbs" | "gantt";

export default function WbsPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<ViewMode>("wbs");
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | undefined>(undefined);
  const [deletingTask, setDeletingTask] = useState<TaskResponse | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);

  const queryKey = ["projects", projectId, "tasks"];

  const { data, isLoading } = useQuery<ApiSuccessResponse<TaskResponse[]>>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      if (!res.ok) throw new Error("タスク一覧の取得に失敗しました");
      return res.json();
    },
    staleTime: 10 * 1000, // 10秒
  });

  const tasks = data?.data ?? [];

  const handleAdd = () => {
    setEditingTask(undefined);
    setSlideOverOpen(true);
  };

  const handleEdit = (task: TaskResponse) => {
    setEditingTask(task);
    setSlideOverOpen(true);
  };

  const handleDelete = (task: TaskResponse) => {
    setDeletingTask(task);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${deletingTask.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("タスクの削除に失敗しました");
      await queryClient.invalidateQueries({ queryKey });
    } finally {
      setIsDeleting(false);
      setDeletingTask(undefined);
    }
  };

  const handleSlideOverSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return (
    <div className="space-y-6 p-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">WBS・タスク管理</h1>

        {/* ビュー切替 */}
        <div className="flex overflow-hidden rounded-md border border-border">
          <button
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "wbs"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            )}
            onClick={() => setViewMode("wbs")}
          >
            <LayoutList className="h-4 w-4" />
            WBS
          </button>
          <button
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "gantt"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            )}
            onClick={() => setViewMode("gantt")}
          >
            <BarChart2 className="h-4 w-4" />
            ガントチャート
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="md" />
        </div>
      ) : viewMode === "wbs" ? (
        <WbsTreeTable
          tasks={tasks}
          projectId={projectId}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <GanttChart tasks={tasks} projectId={projectId} onTaskUpdate={handleSlideOverSuccess} />
      )}

      {/* タスク登録/編集スライドオーバー */}
      <TaskSlideOver
        open={slideOverOpen}
        projectId={projectId}
        task={editingTask}
        onClose={() => setSlideOverOpen(false)}
        onSuccess={handleSlideOverSuccess}
      />

      {/* タスク削除確認ダイアログ */}
      <ConfirmDialog
        open={!!deletingTask}
        title="タスクを削除しますか？"
        description={`「${deletingTask?.name ?? ""}」を削除します。この操作は取り消せません。`}
        confirmLabel={isDeleting ? "削除中..." : "削除"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTask(undefined)}
      />
    </div>
  );
}
