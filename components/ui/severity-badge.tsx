import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/types/domain";

interface SeverityConfig {
  label: string;
  className: string;
}

const severityConfig: Record<Severity, SeverityConfig> = {
  致命的: {
    label: "致命的",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  高: {
    label: "高",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  中: {
    label: "中",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  低: {
    label: "低",
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
