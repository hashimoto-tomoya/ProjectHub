import { NextResponse } from "next/server";
import { ZodError } from "zod";

// ============================================================
// カスタムエラークラス
// ============================================================

export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnauthorizedError extends AppError {
  statusCode = 401;
  code = "UNAUTHORIZED";

  constructor(message = "認証が必要です") {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  statusCode = 403;
  code = "FORBIDDEN";

  constructor(message = "アクセス権限がありません") {
    super(message);
  }
}

export class NotFoundError extends AppError {
  statusCode = 404;
  code = "NOT_FOUND";

  constructor(message = "リソースが見つかりません") {
    super(message);
  }
}

export class ConflictError extends AppError {
  statusCode = 409;
  code = "CONFLICT";

  constructor(message = "データが競合しています") {
    super(message);
  }
}

export class ValidationError extends AppError {
  statusCode = 400;
  code = "VALIDATION_ERROR";

  constructor(message = "入力値が不正です") {
    super(message);
  }
}

export class InvalidTransitionError extends AppError {
  statusCode = 422;
  code = "INVALID_TRANSITION";

  constructor(message = "不正なステータス遷移です") {
    super(message);
  }
}

export class InvalidHierarchyError extends AppError {
  statusCode = 422;
  code = "INVALID_HIERARCHY";

  constructor(message = "タスクの階層制限を超えています") {
    super(message);
  }
}

// ============================================================
// 共通エラーハンドラ
// ============================================================

/**
 * エラーを適切なHTTPレスポンスに変換する
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: error.issues.map((e) => e.message).join(", "),
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  console.error("Unexpected error:", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "サーバーエラーが発生しました",
      },
    },
    { status: 500 }
  );
}
