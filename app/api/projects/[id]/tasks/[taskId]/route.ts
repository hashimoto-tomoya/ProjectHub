import { NextResponse } from "next/server";
import { requireProjectMember, requireRole } from "@/lib/auth/session";
import { taskService } from "@/lib/services/task.service";
import { updateTaskSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/error";

/**
 * API-C-012: タスク更新
 * PUT /api/projects/[id]/tasks/[taskId]
 * - admin / pm のみ（ガントチャート D&D 対応）
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params;
    await requireRole(["admin", "pm"]);
    await requireProjectMember(Number(id));

    const body = await req.json();
    const input = updateTaskSchema.parse(body);

    const task = await taskService.update(BigInt(taskId), input);

    return NextResponse.json({ data: task });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * API-C-013: タスク削除
 * DELETE /api/projects/[id]/tasks/[taskId]
 * - admin / pm のみ
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params;
    await requireRole(["admin", "pm"]);
    await requireProjectMember(Number(id));

    await taskService.delete(BigInt(taskId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
