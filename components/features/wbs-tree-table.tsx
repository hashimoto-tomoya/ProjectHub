"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { TaskResponse } from "@/lib/types/api";

interface WbsTreeTableProps {
  tasks: TaskResponse[];
  projectId: number;
  onAdd: () => void;
  onEdit: (task: TaskResponse) => void;
  onDelete: (task: TaskResponse) => void;
}

export function WbsTreeTable({
  tasks,
  projectId: _projectId,
  onAdd,
  onEdit,
  onDelete,
}: WbsTreeTableProps) {
  // 折りたたみ状態: key = taskId, value = collapsed (true=折りたたみ)
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const toggleCollapse = (taskId: number) => {
    setCollapsed((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // 子タスクを取得
  const getChildren = (parentId: number) => tasks.filter((t) => t.parentTaskId === parentId);

  // 特定 taskId の子孫IDセットを再帰収集
  const getDescendantIds = (taskId: number): Set<number> => {
    const result = new Set<number>();
    const queue = [taskId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const children = getChildren(current);
      for (const child of children) {
        result.add(child.id);
        queue.push(child.id);
      }
    }
    return result;
  };

  // 折りたたまれた先祖を持つタスクIDセットを算出
  const hiddenIds = new Set<number>();
  for (const taskId of Object.keys(collapsed)) {
    if (collapsed[Number(taskId)]) {
      const descendants = getDescendantIds(Number(taskId));
      descendants.forEach((id) => hiddenIds.add(id));
    }
  }

  const visibleTasks = tasks.filter((t) => !hiddenIds.has(t.id));

  if (tasks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="default" size="sm" onClick={() => onAdd()} aria-label="タスク追加">
            <Plus className="mr-1 h-4 w-4" />
            タスク追加
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-muted-foreground">
            <Layers className="h-8 w-8 opacity-40" />
            <p className="text-sm">タスクがありません</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ツールバー */}
      <div className="flex items-center justify-between">
        <Button variant="default" size="sm" onClick={() => onAdd()} aria-label="タスク追加">
          <Plus className="mr-1 h-4 w-4" />
          タスク追加
        </Button>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                タスク名
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                担当者
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                開始日
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                終了日
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                予定
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                実績
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                ステータス
              </th>
              <th className="w-24 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleTasks.map((task) => {
              const children = getChildren(task.id);
              const hasChildren = children.length > 0;
              const isCollapsed = !!collapsed[task.id];
              const indent = (task.level - 1) * 20;

              return (
                <tr
                  key={task.id}
                  className={cn(
                    "transition-colors hover:bg-muted/30",
                    task.level === 1 && "bg-muted/10 font-medium",
                    task.level === 2 && "bg-background",
                    task.level === 3 && "bg-background text-sm"
                  )}
                >
                  {/* タスク名（インデント＋折りたたみ） */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1" style={{ paddingLeft: `${indent}px` }}>
                      {hasChildren ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0 text-muted-foreground"
                          aria-label={isCollapsed ? "展開" : "折りたたみ"}
                          onClick={() => toggleCollapse(task.id)}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      ) : (
                        <span className="h-5 w-5 shrink-0" />
                      )}
                      <span
                        className={cn(
                          "truncate",
                          task.level === 1 && "font-semibold text-foreground",
                          task.level >= 2 && "text-foreground/90"
                        )}
                      >
                        {task.name}
                      </span>
                    </div>
                  </td>

                  {/* 担当者 */}
                  <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">
                    {task.assigneeName ?? "—"}
                  </td>

                  {/* 開始日 */}
                  <td className="hidden px-4 py-2.5 text-muted-foreground lg:table-cell">
                    {task.startDate ?? "—"}
                  </td>

                  {/* 終了日 */}
                  <td className="hidden px-4 py-2.5 text-muted-foreground lg:table-cell">
                    {task.endDate ?? "—"}
                  </td>

                  {/* 予定工数 */}
                  <td className="px-4 py-2.5 text-right tabular-nums text-foreground/80">
                    {task.plannedHours !== null ? task.plannedHours : "—"}
                  </td>

                  {/* 実績工数 */}
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <span
                      className={cn(
                        task.plannedHours !== null && task.actualHours > task.plannedHours
                          ? "font-semibold text-destructive"
                          : "text-foreground/80"
                      )}
                    >
                      {task.actualHours}
                    </span>
                  </td>

                  {/* ステータス */}
                  <td className="hidden px-4 py-2.5 sm:table-cell">
                    <StatusBadge status={task.status} />
                  </td>

                  {/* 操作 */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        aria-label="タスク編集"
                        onClick={() => onEdit(task)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label="タスク削除"
                        onClick={() => onDelete(task)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 後方互換のための re-export
export type { WbsTreeTableProps };
