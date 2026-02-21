import { cn } from "@/lib/utils";
import type { TaskStatus, ReviewItemStatus, BugStatus } from "@/lib/types/domain";

type Status = TaskStatus | ReviewItemStatus | BugStatus;

interface StatusConfig {
  label: string;
  className: string;
}

const statusConfig: Record<string, StatusConfig> = {
  // TaskStatus
  未着手: {
    label: "未着手",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  進行中: {
    label: "進行中",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  完了: {
    label: "完了",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  保留: {
    label: "保留",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  // ReviewItemStatus & BugStatus
  未対応: {
    label: "未対応",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  修正中: {
    label: "修正中",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  確認待ち: {
    label: "確認待ち",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  // BugStatus only
  調査中: {
    label: "調査中",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  クローズ: {
    label: "クローズ",
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

interface StatusBadgeProps {
  status: Status;
  variant?: "default" | "outline";
  className?: string;
}

export function StatusBadge({ status, variant = "default", className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "outline" ? cn("border bg-transparent", config.className) : config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
