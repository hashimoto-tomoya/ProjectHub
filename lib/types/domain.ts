// ロール
export type Role = "admin" | "pmo" | "pm" | "developer";

// プロジェクトステータス
export type ProjectStatus = "active" | "archived";

// タスクステータス
export type TaskStatus = "未着手" | "進行中" | "完了" | "保留";

// レビュー指摘ステータス
export type ReviewItemStatus = "未対応" | "修正中" | "確認待ち" | "完了";

// 障害ステータス
export type BugStatus = "未対応" | "調査中" | "修正中" | "確認待ち" | "クローズ";

// 重要度（指摘・障害共通）
export type Severity = "致命的" | "高" | "中" | "低";

// ダッシュボード集計データ
export interface DashboardData {
  spi: number;
  cpi: number;
  taskCompletionRate: number;
  openBugsCount: number;
  openBugsBySeverity: Record<Severity, number>;
  openReviewItemsCount: number;
  hasDailyReportToday: boolean;
}

// EVM データポイント
export interface EvmDataPoint {
  date: string; // YYYY-MM-DD
  pv: number; // 計画価値（累積予定工数）
  ac: number; // 実コスト（累積実績工数）
  ev: number; // 出来高（累積完了タスク予定工数）
}

// EVM 集計結果
export interface EvmResult {
  dataPoints: EvmDataPoint[];
  summary: {
    spi: number;
    cpi: number;
    remainingHours: number;
  };
}

// タスク（実績工数付き）
export interface TaskWithActualHours {
  id: number;
  projectId: number;
  parentTaskId: number | null;
  name: string;
  assigneeId: number | null;
  status: TaskStatus;
  startDate: string | null;
  endDate: string | null;
  plannedHours: number | null;
  actualHours: number;
  level: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ページネーション
export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
