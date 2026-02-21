import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { authService } from "@/lib/services/auth.service";
import { changePasswordSchema } from "@/lib/utils/validation";
import { handleApiError } from "@/lib/utils/error";

/**
 * API-C-001: パスワード変更
 * PUT /api/users/me/password
 */
export async function PUT(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const input = changePasswordSchema.parse(body);

    await authService.changePassword(
      BigInt(session.user.id),
      input.currentPassword,
      input.newPassword
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
