"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProjectManagementTable } from "@/components/features/project-management-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type {
  ProjectListItem,
  ApiCollectionResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  UserResponse,
  ApiCollectionResponse as UsersResponse,
} from "@/lib/types/api";
import type { ProjectStatus } from "@/lib/types/domain";

type StatusFilter = ProjectStatus | "all";

interface ProjectFormData {
  name: string;
  pmId: string;
  startDate: string;
  endDate: string;
  description: string;
}

const EMPTY_FORM: ProjectFormData = {
  name: "",
  pmId: "",
  startDate: "",
  endDate: "",
  description: "",
};

export default function ProjectManagementPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectListItem | null>(null);
  const [archivingProject, setArchivingProject] = useState<ProjectListItem | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  // プロジェクト一覧取得
  const { data, isLoading } = useQuery<ApiCollectionResponse<ProjectListItem>>({
    queryKey: ["admin-projects", statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/projects?status=${statusFilter}`);
      if (!res.ok) throw new Error("プロジェクト一覧の取得に失敗しました");
      return res.json();
    },
    staleTime: 30 * 1000,
  });

  // PM候補ユーザー取得（pmロール以上）
  const { data: usersData } = useQuery<UsersResponse<UserResponse>>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("ユーザー一覧の取得に失敗しました");
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const pmUsers = (usersData?.data ?? []).filter(
    (u) => u.isActive && (u.role === "pm" || u.role === "admin")
  );

  // プロジェクト登録
  const createMutation = useMutation({
    mutationFn: async (body: CreateProjectRequest) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error?.message ?? "プロジェクトの登録に失敗しました");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      handleCloseForm();
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  // プロジェクト更新
  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: UpdateProjectRequest }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error?.message ?? "プロジェクトの更新に失敗しました");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      handleCloseForm();
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  // アーカイブ
  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" } satisfies UpdateProjectRequest),
      });
      if (!res.ok) throw new Error("アーカイブに失敗しました");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      setArchivingProject(null);
    },
  });

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: ProjectListItem) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      pmId: "",
      startDate: project.startDate,
      endDate: project.endDate ?? "",
      description: project.description ?? "",
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("プロジェクト名を入力してください");
      return;
    }
    if (!formData.startDate) {
      setFormError("開始日を入力してください");
      return;
    }

    if (editingProject) {
      const body: UpdateProjectRequest = {
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        description: formData.description || null,
      };
      if (formData.pmId) {
        body.pmId = Number(formData.pmId);
      }
      updateMutation.mutate({ id: editingProject.id, body });
    } else {
      if (!formData.pmId) {
        setFormError("PMを選択してください");
        return;
      }
      const body: CreateProjectRequest = {
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        description: formData.description || null,
        pmId: Number(formData.pmId),
      };
      createMutation.mutate(body);
    }
  };

  const projects = data?.data ?? [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 p-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">プロジェクト管理</h1>
        <div className="flex items-center gap-3">
          {/* ステータスフィルタ */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">アクティブ</SelectItem>
              <SelectItem value="archived">アーカイブ</SelectItem>
              <SelectItem value="all">すべて</SelectItem>
            </SelectContent>
          </Select>

          {/* 新規登録ボタン */}
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            プロジェクト登録
          </Button>
        </div>
      </div>

      {/* コンテンツ */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <ProjectManagementTable
          projects={projects}
          onEdit={handleOpenEdit}
          onArchive={setArchivingProject}
        />
      )}

      {/* 登録・編集ダイアログ */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProject ? "プロジェクト編集" : "プロジェクト登録"}</DialogTitle>
            <DialogDescription>
              {editingProject
                ? "プロジェクト情報を編集してください。"
                : "新しいプロジェクトを登録してください。"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* プロジェクト名 */}
            <div className="space-y-1.5">
              <Label htmlFor="project-name">
                プロジェクト名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="プロジェクト名を入力"
                maxLength={100}
              />
            </div>

            {/* PM選択 */}
            <div className="space-y-1.5">
              <Label htmlFor="project-pm">
                PM {!editingProject && <span className="text-destructive">*</span>}
              </Label>
              <Select
                value={formData.pmId}
                onValueChange={(v) => setFormData((p) => ({ ...p, pmId: v }))}
              >
                <SelectTrigger id="project-pm">
                  <SelectValue placeholder="PMを選択" />
                </SelectTrigger>
                <SelectContent>
                  {pmUsers.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 開始日 */}
            <div className="space-y-1.5">
              <Label htmlFor="project-start-date">
                開始日 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
              />
            </div>

            {/* 終了予定日 */}
            <div className="space-y-1.5">
              <Label htmlFor="project-end-date">終了予定日</Label>
              <Input
                id="project-end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
              />
            </div>

            {/* 説明 */}
            <div className="space-y-1.5">
              <Label htmlFor="project-description">説明</Label>
              <Textarea
                id="project-description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="プロジェクトの説明（任意）"
                maxLength={500}
                rows={3}
              />
            </div>

            {/* エラー表示 */}
            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "保存中..." : editingProject ? "更新" : "登録"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* アーカイブ確認ダイアログ */}
      <Dialog
        open={archivingProject !== null}
        onOpenChange={(open) => !open && setArchivingProject(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>アーカイブの確認</DialogTitle>
            <DialogDescription>
              「{archivingProject?.name}」をアーカイブしますか？
              <br />
              アーカイブ後はプロジェクト一覧の表示が「アーカイブ」に変わります。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchivingProject(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              disabled={archiveMutation.isPending}
              onClick={() => archivingProject && archiveMutation.mutate(archivingProject.id)}
            >
              {archiveMutation.isPending ? "処理中..." : "アーカイブ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
