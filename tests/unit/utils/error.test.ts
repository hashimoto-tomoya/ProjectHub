import { describe, it, expect } from "vitest";
import { ZodError, z } from "zod";
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InvalidTransitionError,
  handleApiError,
} from "@/lib/utils/error";

describe("error utils", () => {
  describe("カスタムエラークラス", () => {
    it("UnauthorizedError は message と statusCode を持つ", () => {
      const err = new UnauthorizedError();
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe("UNAUTHORIZED");
    });

    it("UnauthorizedError はカスタムメッセージを設定できる", () => {
      const err = new UnauthorizedError("カスタムメッセージ");
      expect(err.message).toBe("カスタムメッセージ");
    });

    it("ForbiddenError は 403 を返す", () => {
      const err = new ForbiddenError();
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe("FORBIDDEN");
    });

    it("NotFoundError は 404 を返す", () => {
      const err = new NotFoundError();
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe("NOT_FOUND");
    });

    it("ConflictError は 409 を返す", () => {
      const err = new ConflictError();
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe("CONFLICT");
    });

    it("InvalidTransitionError は 422 を返す", () => {
      const err = new InvalidTransitionError();
      expect(err.statusCode).toBe(422);
      expect(err.code).toBe("INVALID_TRANSITION");
    });
  });

  describe("handleApiError", () => {
    it("TC-UT-019: ZodError を HTTP 400 に変換する", async () => {
      const zodErr = await createZodError();
      const response = handleApiError(zodErr);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    it("TC-UT-020: NotFoundError を HTTP 404 に変換する", async () => {
      const err = new NotFoundError("リソースが見つかりません");
      const response = handleApiError(err);
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error.code).toBe("NOT_FOUND");
      expect(body.error.message).toBe("リソースが見つかりません");
    });

    it("UnauthorizedError を HTTP 401 に変換する", async () => {
      const err = new UnauthorizedError();
      const response = handleApiError(err);
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("ForbiddenError を HTTP 403 に変換する", async () => {
      const err = new ForbiddenError();
      const response = handleApiError(err);
      expect(response.status).toBe(403);
    });

    it("ConflictError を HTTP 409 に変換する", async () => {
      const err = new ConflictError();
      const response = handleApiError(err);
      expect(response.status).toBe(409);
    });

    it("InvalidTransitionError を HTTP 422 に変換する", async () => {
      const err = new InvalidTransitionError();
      const response = handleApiError(err);
      expect(response.status).toBe(422);
    });

    it("未知のエラーを HTTP 500 に変換する", async () => {
      const err = new Error("予期しないエラー");
      const response = handleApiError(err);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error.code).toBe("INTERNAL_ERROR");
    });
  });
});

// ZodError を生成するヘルパー
async function createZodError(): Promise<ZodError> {
  const schema = z.object({ name: z.string().min(1) });
  const result = schema.safeParse({ name: "" });
  if (!result.success) {
    return result.error;
  }
  throw new Error("ZodError の生成に失敗しました");
}
