"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, FolderOpen, ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface FavoriteProject {
  id: number;
  name: string;
  status: string;
}

async function fetchFavoriteProjects(): Promise<FavoriteProject[]> {
  const res = await fetch("/api/projects?favorites=true");
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("プロジェクト取得に失敗しました");
  }
  const json = await res.json();
  return json.data ?? [];
}

export function GlobalProjectSelector() {
  const router = useRouter();
  const params = useParams();
  const currentProjectId = params?.id as string | undefined;

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", "favorites"],
    queryFn: fetchFavoriteProjects,
    staleTime: 30 * 1000,
    retry: false,
  });

  const currentProject = projects.find((p) => String(p.id) === currentProjectId);

  const handleProjectSelect = (projectId: number) => {
    router.push(`/projects/${projectId}/dashboard`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 max-w-[280px] gap-1.5 text-sm font-medium hover:bg-slate-100"
          aria-label="プロジェクトを切り替え"
        >
          <FolderOpen className="h-4 w-4 flex-shrink-0 text-slate-500" />
          <span className="truncate text-slate-700">
            {currentProject?.name ?? "プロジェクトを選択"}
          </span>
          {isLoading ? (
            <LoadingSpinner size="sm" className="ml-1" />
          ) : (
            <ChevronDown className="h-3 w-3 flex-shrink-0 text-slate-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64">
        {projects.length > 0 ? (
          <>
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => handleProjectSelect(project.id)}
                className="cursor-pointer"
              >
                <FolderOpen className="mr-2 h-4 w-4 text-slate-400" />
                <span className="truncate">{project.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : (
          !isLoading && (
            <>
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                お気に入りプロジェクトがありません
              </div>
              <DropdownMenuSeparator />
            </>
          )
        )}
        <DropdownMenuItem
          onClick={() => router.push("/projects")}
          className="cursor-pointer text-indigo-600 hover:text-indigo-700 focus:text-indigo-700"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          全プロジェクト一覧
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
