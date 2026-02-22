"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { SlideOver } from "@/components/ui/slide-over";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskResponse, CreateTaskRequest } from "@/lib/types/api";
import type { TaskStatus } from "@/lib/types/domain";

interface TaskSlideOverProps {
  open: boolean;
  projectId: number;
  task?: TaskResponse;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  name: string;
  plannedHours: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
}

const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "未着手", label: "未着手" },
  { value: "進行中", label: "進行中" },
  { value: "完了", label: "完了" },
  { value: "保留", label: "保留" },
];

export function TaskSlideOver({ open, projectId, task, onClose, onSuccess }: TaskSlideOverProps) {
  const isEditMode = task !== undefined;
  const title = isEditMode ? "タスク編集" : "タスク登録";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      plannedHours: "",
      startDate: "",
      endDate: "",
      status: "未着手",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && task) {
        reset({
          name: task.name,
          plannedHours: task.plannedHours !== null ? String(task.plannedHours) : "",
          startDate: task.startDate ?? "",
          endDate: task.endDate ?? "",
          status: task.status,
        });
      } else {
        reset({
          name: "",
          plannedHours: "",
          startDate: "",
          endDate: "",
          status: "未着手",
        });
      }
    }
  }, [open, isEditMode, task, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CreateTaskRequest) => {
      const url = task
        ? `/api/projects/${projectId}/tasks/${task.id}`
        : `/api/projects/${projectId}/tasks`;
      const method = task ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error?.message ?? "タスクの保存に失敗しました");
      }
      return res.json();
    },
    onSuccess: () => {
      setServerError(null);
      onSuccess();
      onClose();
    },
    onError: (err: Error) => {
      setServerError(err.message);
    },
  });

  const statusValue = watch("status");

  const onSubmit = (values: FormValues) => {
    const payload: CreateTaskRequest = {
      name: values.name,
      plannedHours: values.plannedHours !== "" ? Number(values.plannedHours) : null,
      startDate: values.startDate !== "" ? values.startDate : null,
      endDate: values.endDate !== "" ? values.endDate : null,
      status: values.status,
    };
    mutate(payload);
  };

  return (
    <SlideOver open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}
        {/* タスク名 */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">タスク名</Label>
          <Input
            id="name"
            type="text"
            placeholder="タスク名を入力"
            {...register("name", { required: "タスク名を入力してください" })}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* 予定工数 */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="plannedHours">予定工数</Label>
          <Input
            id="plannedHours"
            type="number"
            min={0}
            step={0.5}
            placeholder="例: 8"
            {...register("plannedHours")}
          />
        </div>

        {/* 開始日 */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">開始日</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
        </div>

        {/* 終了日 */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">終了日</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
        </div>

        {/* ステータス */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">ステータス</Label>
          <Select
            value={statusValue}
            onValueChange={(value) => setValue("status", value as TaskStatus)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="ステータスを選択" />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            role="button"
            name="キャンセル"
            onClick={onClose}
            disabled={isPending}
          >
            キャンセル
          </Button>
          <Button type="submit" role="button" name="保存" disabled={isPending}>
            {isPending ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </SlideOver>
  );
}
