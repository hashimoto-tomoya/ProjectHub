import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/utils/error";
import type { Role } from "@/lib/types/domain";
import type { Session } from "next-auth";

/**
 * 認証チェック：未認証なら 401 エラーをスロー
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session;
}

/**
 * ロールチェック：指定ロール以外なら 403 エラーをスロー
 */
export async function requireRole(roles: Role[]): Promise<Session> {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as Role)) {
    throw new ForbiddenError();
  }
  return session;
}

/**
 * プロジェクトメンバーチェック：非メンバーなら 404 をスロー
 * （admin はすべてのプロジェクトにアクセス可能）
 */
export async function requireProjectMember(projectId: number): Promise<Session> {
  const session = await requireAuth();

  // admin は全プロジェクトにアクセス可能
  if (session.user.role === "admin") {
    return session;
  }

  const membership = await prisma.projectMember.findFirst({
    where: {
      projectId: BigInt(projectId),
      userId: BigInt(session.user.id),
    },
  });

  if (!membership) {
    throw new NotFoundError("プロジェクトが見つかりません");
  }

  return session;
}
