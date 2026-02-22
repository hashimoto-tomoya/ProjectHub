import { NextResponse } from "next/server";
import { requireProjectMember, requireRole } from "@/lib/auth/session";
import { taskService } from "@/lib/services/task.service";
import { createTaskSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/error";

/**
 * API-C-010: タスク一覧取得
 * GET /api/projects/[id]/tasks
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireProjectMember(Number(id));

    const tasks = await taskService.findByProject(BigInt(id));

    return NextResponse.json({ data: tasks });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * API-C-011: タスク登録
 * POST /api/projects/[id]/tasks
 * - admin / pm のみ
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireRole(["admin", "pm"]);
    await requireProjectMember(Number(id));

    const body = await req.json();
    const input = createTaskSchema.parse(body);

    const task = await taskService.create(BigInt(id), input);

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
