import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import {
  passwordSchema,
  changePasswordSchema,
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  createDailyReportSchema,
  createBugSchema,
  updateBugSchema,
  createUserSchema,
  paginationSchema,
} from "@/lib/utils/validation";

describe("validation utils", () => {
  describe("passwordSchema", () => {
    it("TC-UT-016: 有効なパスワードはパースを通過する", () => {
      expect(() => passwordSchema.parse("Abc12345")).not.toThrow();
      expect(() => passwordSchema.parse("Password1")).not.toThrow();
    });

    it("TC-UT-017: 7文字未満はバリデーションエラー", () => {
      expect(() => passwordSchema.parse("Abc1234")).toThrow(ZodError);
    });

    it("TC-UT-018: 数字のみはバリデーションエラー（英字必須）", () => {
      expect(() => passwordSchema.parse("12345678")).toThrow(ZodError);
    });

    it("英字のみはバリデーションエラー（数字必須）", () => {
      expect(() => passwordSchema.parse("abcdefgh")).toThrow(ZodError);
    });
  });

  describe("changePasswordSchema", () => {
    it("有効なリクエストはパースを通過する", () => {
      const result = changePasswordSchema.parse({
        currentPassword: "OldPass1",
        newPassword: "NewPass2",
      });
      expect(result.currentPassword).toBe("OldPass1");
      expect(result.newPassword).toBe("NewPass2");
    });

    it("currentPasswordが空の場合はエラー", () => {
      expect(() =>
        changePasswordSchema.parse({ currentPassword: "", newPassword: "NewPass2" })
      ).toThrow(ZodError);
    });

    it("newPasswordがポリシー違反の場合はエラー", () => {
      expect(() =>
        changePasswordSchema.parse({
          currentPassword: "OldPass1",
          newPassword: "short",
        })
      ).toThrow(ZodError);
    });
  });

  describe("createProjectSchema", () => {
    it("有効なプロジェクト作成リクエストはパースを通過する", () => {
      const result = createProjectSchema.parse({
        name: "テストプロジェクト",
        startDate: "2026-01-01",
        pmId: 1,
      });
      expect(result.name).toBe("テストプロジェクト");
    });

    it("nameが空の場合はエラー", () => {
      expect(() =>
        createProjectSchema.parse({ name: "", startDate: "2026-01-01", pmId: 1 })
      ).toThrow(ZodError);
    });

    it("startDateの日付フォーマットが不正な場合はエラー", () => {
      expect(() =>
        createProjectSchema.parse({
          name: "テスト",
          startDate: "2026/01/01",
          pmId: 1,
        })
      ).toThrow(ZodError);
    });

    it("startDateに存在しない日付（2026-13-99）はエラー", () => {
      expect(() =>
        createProjectSchema.parse({
          name: "テスト",
          startDate: "2026-13-99",
          pmId: 1,
        })
      ).toThrow(ZodError);
    });
  });

  describe("createTaskSchema", () => {
    it("有効なタスク作成リクエストはパースを通過する", () => {
      const result = createTaskSchema.parse({ name: "タスク名" });
      expect(result.name).toBe("タスク名");
    });

    it("nameが空の場合はエラー", () => {
      expect(() => createTaskSchema.parse({ name: "" })).toThrow(ZodError);
    });

    it("plannedHoursに負の値はエラー", () => {
      expect(() => createTaskSchema.parse({ name: "タスク", plannedHours: -1 })).toThrow(ZodError);
    });
  });

  describe("createDailyReportSchema", () => {
    it("有効な日報作成リクエストはパースを通過する", () => {
      const result = createDailyReportSchema.parse({
        workDate: "2026-02-20",
        entries: [{ taskId: 1, workHours: 4 }],
      });
      expect(result.workDate).toBe("2026-02-20");
      expect(result.entries).toHaveLength(1);
    });

    it("workDateの日付フォーマットが不正な場合はエラー", () => {
      expect(() =>
        createDailyReportSchema.parse({
          workDate: "2026/02/20",
          entries: [{ taskId: 1, workHours: 4 }],
        })
      ).toThrow(ZodError);
    });

    it("entriesが空配列の場合はエラー", () => {
      expect(() => createDailyReportSchema.parse({ workDate: "2026-02-20", entries: [] })).toThrow(
        ZodError
      );
    });

    it("workHoursが0の場合はエラー", () => {
      expect(() =>
        createDailyReportSchema.parse({
          workDate: "2026-02-20",
          entries: [{ taskId: 1, workHours: 0 }],
        })
      ).toThrow(ZodError);
    });
  });

  describe("createBugSchema", () => {
    it("有効な障害登録リクエストはパースを通過する", () => {
      const result = createBugSchema.parse({
        title: "障害タイトル",
        severity: "高",
        foundDate: "2026-02-20",
      });
      expect(result.title).toBe("障害タイトル");
    });

    it("titleが空の場合はエラー", () => {
      expect(() =>
        createBugSchema.parse({ title: "", severity: "高", foundDate: "2026-02-20" })
      ).toThrow(ZodError);
    });

    it("不正なseverity値はエラー", () => {
      expect(() =>
        createBugSchema.parse({
          title: "障害",
          severity: "超高",
          foundDate: "2026-02-20",
        })
      ).toThrow(ZodError);
    });
  });

  describe("createUserSchema", () => {
    it("有効なユーザー登録リクエストはパースを通過する", () => {
      const result = createUserSchema.parse({
        name: "テストユーザー",
        email: "test@example.com",
        role: "developer",
        initialPassword: "Init1234",
      });
      expect(result.email).toBe("test@example.com");
    });

    it("不正なメールアドレスはエラー", () => {
      expect(() =>
        createUserSchema.parse({
          name: "テスト",
          email: "not-an-email",
          role: "developer",
          initialPassword: "Init1234",
        })
      ).toThrow(ZodError);
    });

    it("不正なrole値はエラー", () => {
      expect(() =>
        createUserSchema.parse({
          name: "テスト",
          email: "test@example.com",
          role: "superadmin",
          initialPassword: "Init1234",
        })
      ).toThrow(ZodError);
    });
  });

  describe("paginationSchema", () => {
    it("デフォルト値が正しく設定される", () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(20);
    });

    it("カスタム値が反映される", () => {
      const result = paginationSchema.parse({ page: 2, perPage: 50 });
      expect(result.page).toBe(2);
      expect(result.perPage).toBe(50);
    });

    it("perPageが100を超える場合はエラー", () => {
      expect(() => paginationSchema.parse({ perPage: 101 })).toThrow(ZodError);
    });
  });
});
