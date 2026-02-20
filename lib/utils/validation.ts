import { z } from "zod";

// YYYY-MM-DD 形式の日付を検証する正規表現
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 日付文字列スキーマ（形式チェック + 実在日付チェック）
const dateString = z
  .string()
  .regex(DATE_PATTERN, "日付は YYYY-MM-DD 形式で入力してください")
  .refine((v) => {
    const d = new Date(v);
    return !isNaN(d.getTime()) && d.toISOString().startsWith(v);
  }, "存在しない日付です");

// ============================================================
// パスワード
// ============================================================

/**
 * パスワードポリシースキーマ
 * - 8文字以上
 * - 英字を1文字以上含む
 * - 数字を1文字以上含む
 */
export const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください")
  .refine((v) => /[a-zA-Z]/.test(v), "パスワードには英字を1文字以上含めてください")
  .refine((v) => /[0-9]/.test(v), "パスワードには数字を1文字以上含めてください");

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
  newPassword: passwordSchema,
});

// ============================================================
// プロジェクト
// ============================================================

export const createProjectSchema = z.object({
  name: z.string().min(1, "プロジェクト名を入力してください"),
  startDate: dateString,
  endDate: dateString.nullable().optional(),
  description: z.string().nullable().optional(),
  pmId: z.number().int().positive(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["active", "archived"]).optional(),
  startDate: dateString.optional(),
  endDate: dateString.nullable().optional(),
  description: z.string().nullable().optional(),
  pmId: z.number().int().positive().optional(),
});

export const favoriteSchema = z.object({
  isFavorite: z.boolean(),
});

export const addMemberSchema = z.object({
  userId: z.number().int().positive(),
});

// ============================================================
// タスク
// ============================================================

export const createTaskSchema = z.object({
  parentTaskId: z.number().int().positive().nullable().optional(),
  name: z.string().min(1, "タスク名を入力してください"),
  assigneeId: z.number().int().positive().nullable().optional(),
  startDate: dateString.nullable().optional(),
  endDate: dateString.nullable().optional(),
  status: z.enum(["未着手", "進行中", "完了", "保留"]).optional(),
  plannedHours: z.number().nonnegative().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).optional(),
  assigneeId: z.number().int().positive().nullable().optional(),
  startDate: dateString.nullable().optional(),
  endDate: dateString.nullable().optional(),
  status: z.enum(["未着手", "進行中", "完了", "保留"]).optional(),
  plannedHours: z.number().nonnegative().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
});

// ============================================================
// 日報
// ============================================================

const dailyReportEntrySchema = z.object({
  taskId: z.number().int().positive(),
  workHours: z.number().positive("作業時間は0より大きい値を入力してください"),
  memo: z.string().nullable().optional(),
});

export const createDailyReportSchema = z.object({
  workDate: dateString,
  entries: z.array(dailyReportEntrySchema).min(1, "明細を1件以上入力してください"),
});

export const updateDailyReportSchema = z.object({
  entries: z.array(dailyReportEntrySchema).min(1, "明細を1件以上入力してください"),
});

// ============================================================
// レビュー記録票
// ============================================================

export const createReviewSessionSchema = z.object({
  reviewType: z.string().min(1, "レビュー種別を入力してください"),
  targetName: z.string().min(1, "レビュー対象を入力してください"),
  sessionDate: dateString,
  reviewerId: z.number().int().positive(),
});

export const createReviewItemSchema = z.object({
  sessionId: z.number().int().positive(),
  categoryId: z.number().int().positive().nullable().optional(),
  title: z.string().min(1, "指摘タイトルを入力してください"),
  description: z.string().nullable().optional(),
  severity: z.enum(["致命的", "高", "中", "低"]),
  assigneeId: z.number().int().positive().nullable().optional(),
  dueDate: dateString.nullable().optional(),
});

export const updateReviewItemSchema = z.object({
  categoryId: z.number().int().positive().nullable().optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  severity: z.enum(["致命的", "高", "中", "低"]).optional(),
  status: z.enum(["未対応", "修正中", "確認待ち", "完了"]).optional(),
  assigneeId: z.number().int().positive().nullable().optional(),
  dueDate: dateString.nullable().optional(),
});

// ============================================================
// 障害
// ============================================================

export const createBugSchema = z.object({
  title: z.string().min(1, "障害タイトルを入力してください"),
  description: z.string().nullable().optional(),
  severity: z.enum(["致命的", "高", "中", "低"]),
  taskId: z.number().int().positive().nullable().optional(),
  assigneeId: z.number().int().positive().nullable().optional(),
  foundDate: dateString,
  foundPhase: z.string().nullable().optional(),
});

export const updateBugSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  severity: z.enum(["致命的", "高", "中", "低"]).optional(),
  status: z.enum(["未対応", "調査中", "修正中", "確認待ち", "クローズ"]).optional(),
  taskId: z.number().int().positive().nullable().optional(),
  assigneeId: z.number().int().positive().nullable().optional(),
  foundDate: dateString.optional(),
  foundPhase: z.string().nullable().optional(),
});

// ============================================================
// ユーザー管理
// ============================================================

export const createUserSchema = z.object({
  name: z.string().min(1, "氏名を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  role: z.enum(["admin", "pmo", "pm", "developer"]),
  initialPassword: passwordSchema,
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "pmo", "pm", "developer"]).optional(),
  isActive: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

// ============================================================
// ページネーション
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});
