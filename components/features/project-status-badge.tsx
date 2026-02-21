import { Badge } from "@/components/ui/badge";

interface ProjectStatusBadgeProps {
  status: string;
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
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
