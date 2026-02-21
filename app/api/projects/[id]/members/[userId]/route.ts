import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { projectService } from "@/lib/services/project.service";
import { handleApiError } from "@/lib/utils/error";

/**
 * API-C-009: メンバー削除
 * DELETE /api/projects/[id]/members/[userId]
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    await requireRole(["admin", "pm"]);

    await projectService.removeMember(BigInt(id), BigInt(userId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
