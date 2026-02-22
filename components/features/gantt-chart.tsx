"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TaskResponse } from "@/lib/types/api";

type ViewMode = "day" | "week" | "month";

interface GanttChartProps {
  tasks: TaskResponse[];
  projectId: number;
  onTaskUpdate?: () => void;
}

// ミリ秒→日数変換
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// 日付を YYYY-MM-DD 文字列に変換
function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// YYYY-MM-DD 文字列を Date に変換
function parseDate(str: string): Date {
  return new Date(`${str}T00:00:00`);
}

// ViewMode ごとのカラム幅(px)
const COLUMN_WIDTH: Record<ViewMode, number> = {
  day: 32,
  week: 120,
  month: 160,
};

// ViewMode ごとの表示カラム数
const COLUMN_COUNT: Record<ViewMode, number> = {
  day: 30,
  week: 12,
  month: 6,
};

export function GanttChart({ tasks, projectId, onTaskUpdate }: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [baseDate, setBaseDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // ドラッグ状態
  const dragState = useRef<{
    taskId: number;
    startX: number;
    originalStart: Date;
    originalEnd: Date;
    durationDays: number;
    type: "move" | "resize-start" | "resize-end";
  } | null>(null);

  // 楽観的更新用ローカル state
  const [localOverrides, setLocalOverrides] = useState<
    Record<number, { startDate: string; endDate: string }>
  >({});

  const { mutate: updateTask } = useMutation({
    mutationFn: async (data: { taskId: number; startDate: string; endDate: string }) => {
      const res = await fetch(`/api/projects/${projectId}/tasks/${data.taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: data.startDate,
          endDate: data.endDate,
        }),
      });
      if (!res.ok) throw new Error("タスク更新に失敗しました");
      return res.json();
    },
    onSuccess: () => {
      onTaskUpdate?.();
    },
    onError: (_err, variables) => {
      // ロールバック
      setLocalOverrides((prev) => {
        const next = { ...prev };
        delete next[variables.taskId];
        return next;
      });
    },
  });

  // 表示期間の開始・終了を計算
  const periodStart = new Date(baseDate);
  const periodEnd = new Date(baseDate);

  if (viewMode === "day") {
    periodEnd.setDate(periodStart.getDate() + COLUMN_COUNT.day - 1);
  } else if (viewMode === "week") {
    periodEnd.setDate(periodStart.getDate() + COLUMN_COUNT.week * 7 - 1);
  } else {
    periodEnd.setMonth(periodStart.getMonth() + COLUMN_COUNT.month - 1);
    periodEnd.setDate(new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, 0).getDate());
  }

  // ヘッダーラベルを生成
  const headerLabels: string[] = [];
  if (viewMode === "day") {
    for (let i = 0; i < COLUMN_COUNT.day; i++) {
      const d = new Date(periodStart);
      d.setDate(d.getDate() + i);
      headerLabels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
  } else if (viewMode === "week") {
    for (let i = 0; i < COLUMN_COUNT.week; i++) {
      const d = new Date(periodStart);
      d.setDate(d.getDate() + i * 7);
      headerLabels.push(`W${Math.ceil(d.getDate() / 7)} (${d.getMonth() + 1}/${d.getDate()})`);
    }
  } else {
    for (let i = 0; i < COLUMN_COUNT.month; i++) {
      const d = new Date(periodStart.getFullYear(), periodStart.getMonth() + i, 1);
      headerLabels.push(`${d.getFullYear()}/${d.getMonth() + 1}`);
    }
  }

  // 日付から横位置(px)を計算
  const dateToX = useCallback(
    (date: Date): number => {
      const totalDays = Math.round((periodEnd.getTime() - periodStart.getTime()) / MS_PER_DAY) + 1;
      const totalWidth = COLUMN_COUNT[viewMode] * COLUMN_WIDTH[viewMode];
      const daysFromStart = Math.round((date.getTime() - periodStart.getTime()) / MS_PER_DAY);
      return (daysFromStart / totalDays) * totalWidth;
    },
    [periodStart, periodEnd, viewMode]
  );

  const totalWidth = COLUMN_COUNT[viewMode] * COLUMN_WIDTH[viewMode];

  // 前後への移動
  const navigatePrev = () => {
    const d = new Date(baseDate);
    if (viewMode === "day") d.setDate(d.getDate() - COLUMN_COUNT.day);
    else if (viewMode === "week") d.setDate(d.getDate() - COLUMN_COUNT.week * 7);
    else d.setMonth(d.getMonth() - COLUMN_COUNT.month);
    setBaseDate(d);
  };

  const navigateNext = () => {
    const d = new Date(baseDate);
    if (viewMode === "day") d.setDate(d.getDate() + COLUMN_COUNT.day);
    else if (viewMode === "week") d.setDate(d.getDate() + COLUMN_COUNT.week * 7);
    else d.setMonth(d.getMonth() + COLUMN_COUNT.month);
    setBaseDate(d);
  };

  // ドラッグ開始
  const handleMouseDown = (
    e: React.MouseEvent,
    task: TaskResponse,
    type: "move" | "resize-end"
  ) => {
    if (!task.startDate || !task.endDate) return;
    e.preventDefault();
    const originalStart = parseDate(task.startDate);
    const originalEnd = parseDate(task.endDate);
    const durationDays = Math.round((originalEnd.getTime() - originalStart.getTime()) / MS_PER_DAY);
    dragState.current = {
      taskId: task.id,
      startX: e.clientX,
      originalStart,
      originalEnd,
      durationDays,
      type,
    };
  };

  // ドラッグ中
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dragState.current) return;
      const dx = e.clientX - dragState.current.startX;
      const totalDays = Math.round((periodEnd.getTime() - periodStart.getTime()) / MS_PER_DAY) + 1;
      const daysPerPx = totalDays / totalWidth;
      const movedDays = Math.round(dx * daysPerPx);

      if (dragState.current.type === "move") {
        const newStart = new Date(dragState.current.originalStart);
        newStart.setDate(newStart.getDate() + movedDays);
        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + dragState.current.durationDays);
        setLocalOverrides((prev) => ({
          ...prev,
          [dragState.current!.taskId]: {
            startDate: toDateStr(newStart),
            endDate: toDateStr(newEnd),
          },
        }));
      } else {
        const newEnd = new Date(dragState.current.originalEnd);
        newEnd.setDate(newEnd.getDate() + movedDays);
        if (newEnd >= dragState.current.originalStart) {
          setLocalOverrides((prev) => ({
            ...prev,
            [dragState.current!.taskId]: {
              startDate: toDateStr(dragState.current!.originalStart),
              endDate: toDateStr(newEnd),
            },
          }));
        }
      }
    },
    [periodStart, periodEnd, totalWidth]
  );

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    if (!dragState.current) return;
    const override = localOverrides[dragState.current.taskId];
    if (override) {
      updateTask({
        taskId: dragState.current.taskId,
        startDate: override.startDate,
        endDate: override.endDate,
      });
    }
    dragState.current = null;
  }, [localOverrides, updateTask]);

  return (
    <div className="space-y-3">
      {/* ツールバー */}
      <div className="flex items-center gap-2">
        <div className="flex overflow-hidden rounded-md border border-border">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              )}
              onClick={() => setViewMode(mode)}
            >
              {mode === "day" ? "日" : mode === "week" ? "週" : "月"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={navigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-sm text-muted-foreground">
          {periodStart.getFullYear()}/{periodStart.getMonth() + 1}/{periodStart.getDate()} —{" "}
          {periodEnd.getFullYear()}/{periodEnd.getMonth() + 1}/{periodEnd.getDate()}
        </span>
      </div>

      {/* ガントチャート本体 */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <div
          className="flex"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* タスク名カラム（固定） */}
          <div className="w-48 shrink-0 border-r border-border">
            <div className="border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              タスク名
            </div>
            {tasks.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 opacity-40" />
                <span>タスクなし</span>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "truncate border-b border-border px-3 py-2 text-sm",
                    task.level === 1 && "font-semibold",
                    task.level >= 2 && "pl-6 text-foreground/80"
                  )}
                  style={{ paddingLeft: `${(task.level - 1) * 16 + 12}px` }}
                  title={task.name}
                >
                  {task.name}
                </div>
              ))
            )}
          </div>

          {/* チャートエリア（スクロール可） */}
          <div className="flex-1 overflow-x-auto">
            <div style={{ width: `${totalWidth}px`, minWidth: "100%" }}>
              {/* ヘッダー */}
              <div className="flex border-b border-border bg-muted/50">
                {headerLabels.map((label, i) => (
                  <div
                    key={i}
                    className="shrink-0 border-r border-border px-2 py-2 text-center text-xs text-muted-foreground"
                    style={{ width: `${COLUMN_WIDTH[viewMode]}px` }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* タスクバー行 */}
              {tasks.map((task) => {
                const override = localOverrides[task.id];
                const startStr = override?.startDate ?? task.startDate;
                const endStr = override?.endDate ?? task.endDate;

                if (!startStr || !endStr) {
                  return (
                    <div
                      key={task.id}
                      className="relative border-b border-border"
                      style={{ height: "36px" }}
                    />
                  );
                }

                const start = parseDate(startStr);
                const end = parseDate(endStr);
                const totalDays =
                  Math.round((periodEnd.getTime() - periodStart.getTime()) / MS_PER_DAY) + 1;
                const dayWidth = (COLUMN_COUNT[viewMode] * COLUMN_WIDTH[viewMode]) / totalDays;
                const left = Math.max(0, dateToX(start));
                const right = Math.min(totalWidth, dateToX(end) + dayWidth);
                const width = Math.max(8, right - left);

                return (
                  <div
                    key={task.id}
                    className="relative border-b border-border"
                    style={{ height: "36px" }}
                  >
                    {/* ガントバー */}
                    <div
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 cursor-move select-none rounded",
                        task.status === "完了"
                          ? "bg-green-500/80"
                          : task.status === "進行中"
                            ? "bg-blue-500/80"
                            : task.status === "保留"
                              ? "bg-yellow-500/80"
                              : "bg-slate-400/80"
                      )}
                      style={{ left: `${left}px`, width: `${width}px`, height: "20px" }}
                      onMouseDown={(e) => handleMouseDown(e, task, "move")}
                      title={`${task.name}: ${startStr} 〜 ${endStr}`}
                    >
                      <span className="truncate px-1.5 text-xs text-white">
                        {width > 40 ? task.name : ""}
                      </span>
                      {/* リサイズハンドル（右端） */}
                      <div
                        className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown(e, task, "resize-end");
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
