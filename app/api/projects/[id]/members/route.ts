import { NextResponse } from "next/server";
import { requireProjectMember, requireRole } from "@/lib/auth/session";
import { projectService } from "@/lib/services/project.service";
import { addMemberSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/error";

/**
 * API-C-007: プロジェクトメンバー一覧取得
 * GET /api/projects/[id]/members
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireProjectMember(Number(id));

    const members = await projectService.getMembers(BigInt(id));

    return NextResponse.json({ data: members });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * API-C-008: メンバー追加
 * POST /api/projects/[id]/members
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireRole(["admin", "pm"]);

    const body = await req.json();
    const input = addMemberSchema.parse(body);

    await projectService.addMember(BigInt(id), BigInt(input.userId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
