import { NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { projectService } from "@/lib/services/project.service";
import { createProjectSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/error";
import type { Role, ProjectStatus } from "@/lib/types/domain";

/**
 * API-C-002: プロジェクト一覧取得
 * GET /api/projects
 */
export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") ?? "active") as ProjectStatus | "all";

    const projects = await projectService.getProjects(
      BigInt(session.user.id),
      session.user.role as Role,
      status
    );

    return NextResponse.json({ data: projects });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * API-C-003: プロジェクト作成
 * POST /api/projects
 */
export async function POST(req: Request) {
  try {
    const session = await requireRole(["admin", "pm"]);
    const body = await req.json();
    const input = createProjectSchema.parse(body);

    const project = await projectService.createProject(BigInt(session.user.id), {
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      description: input.description ?? null,
      pmId: input.pmId,
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
