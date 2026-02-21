import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { projectService } from "@/lib/services/project.service";
import { favoriteSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/error";

/**
 * API-C-006: お気に入り登録/解除
 * PUT /api/projects/[id]/favorite
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const body = await req.json();
    const input = favoriteSchema.parse(body);

    await projectService.toggleFavorite(BigInt(id), BigInt(session.user.id), input.isFavorite);

    return NextResponse.json({ data: { isFavorite: input.isFavorite } });
  } catch (error) {
    return handleApiError(error);
  }
}
