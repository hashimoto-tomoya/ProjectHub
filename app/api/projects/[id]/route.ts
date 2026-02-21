import { NextResponse } from "next/server";
import { requireProjectMember, requireRole } from "@/lib/auth/session";
import { projectService } from "@/lib/services/project.service";
import { updateProjectSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/error";

/**
 * API-C-004: プロジェクト詳細取得
 * GET /api/projects/[id]
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireProjectMember(Number(id));

    const project = await projectService.getProjectById(BigInt(id));

    return NextResponse.json({ data: project });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * API-C-005: プロジェクト更新
 * PUT /api/projects/[id]
 * - admin: 全プロジェクト更新可
 * - pm: 自身がメンバーのプロジェクトのみ更新可
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(["admin", "pm"]);

    // admin 以外（pm）はメンバーシップも確認
    if (session.user.role !== "admin") {
      await requireProjectMember(Number(id));
    }

    const body = await req.json();
    const input = updateProjectSchema.parse(body);

    const project = await projectService.updateProject(BigInt(id), input);

    return NextResponse.json({ data: project });
  } catch (error) {
    return handleApiError(error);
  }
}
