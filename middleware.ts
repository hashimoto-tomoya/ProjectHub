import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export default auth(function middleware(req: NextAuthRequest) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // API・静的ファイルはガード対象外
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // ログインページの処理
  if (pathname === "/login") {
    if (session?.user) {
      // 認証済みならプロジェクト一覧へリダイレクト
      return NextResponse.redirect(new URL("/projects", req.url));
    }
    return NextResponse.next();
  }

  // 未認証ユーザーは /login へリダイレクト
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role, mustChangePassword } = session.user;

  // mustChangePassword フラグがある場合はパスワード変更ページ以外へのアクセスをブロック
  if (mustChangePassword && pathname !== "/users/me/change-password") {
    return NextResponse.redirect(new URL("/users/me/change-password", req.url));
  }

  // /admin/users: admin のみ許可
  if (pathname.startsWith("/admin/users")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/projects", req.url));
    }
  }

  // /admin/projects: admin / pm を許可
  if (pathname.startsWith("/admin/projects")) {
    if (role !== "admin" && role !== "pm") {
      return NextResponse.redirect(new URL("/projects", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * 以下のパスにはミドルウェアを適用しない:
     * - _next/static（静的ファイル）
     * - _next/image（画像最適化）
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
