import type {
  Role,
  ProjectStatus,
  TaskStatus,
  ReviewItemStatus,
  BugStatus,
  Severity,
  DashboardData,
  EvmResult,
  Pagination,
} from "./domain";

// ============================================================
// 共通レスポンス型
// ============================================================

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiCollectionResponse<T> {
  data: T[];
  pagination?: Pagination;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

// ============================================================
// 認証 (API-C-001)
// ============================================================

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================
// プロジェクト (API-C-002〜009)
// ============================================================

export interface ProjectListItem {
  id: number;
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
  description: string | null;
  pmName: string;
  isFavorite: boolean;
}

export interface ProjectDetail {
  id: number;
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
  description: string | null;
  pmId: number;
  pmName: string;
  bugSequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  pmId: number;
}

export interface UpdateProjectRequest {
  name?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string | null;
  description?: string | null;
  pmId?: number;
}

export interface FavoriteRequest {
  isFavorite: boolean;
}

export interface ProjectMember {
  userId: number;
  name: string;
  email: string;
  role: Role;
  isFavorite: boolean;
}

export interface AddMemberRequest {
  userId: number;
}

// ============================================================
// WBS・タスク (API-C-010〜013)
// ============================================================

export interface TaskResponse {
  id: number;
  parentTaskId: number | null;
  level: number;
  name: string;
  assigneeId: number | null;
  assigneeName: string | null;
  startDate: string | null;
  endDate: string | null;
  status: TaskStatus;
  plannedHours: number | null;
  actualHours: number;
  displayOrder: number;
}

export interface CreateTaskRequest {
  parentTaskId?: number | null;
  name: string;
  assigneeId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: TaskStatus;
  plannedHours?: number | null;
  displayOrder?: number;
}

export interface UpdateTaskRequest {
  name?: string;
  assigneeId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: TaskStatus;
  plannedHours?: number | null;
  displayOrder?: number;
}

// ============================================================
// 日報・実績 (API-C-014〜017)
// ============================================================

export interface DailyReportEntry {
  taskId: number;
  taskName: string;
  workHours: number;
  memo: string | null;
}

export interface DailyReportResponse {
  id: number;
  userId: number;
  userName: string;
  workDate: string;
  totalHours: number;
  entries: DailyReportEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyReportListItem {
  id: number;
  userId: number;
  userName: string;
  workDate: string;
  totalHours: number;
}

export interface CreateDailyReportEntryInput {
  taskId: number;
  workHours: number;
  memo?: string | null;
}

export interface CreateDailyReportRequest {
  workDate: string;
  entries: CreateDailyReportEntryInput[];
}

export interface UpdateDailyReportRequest {
  entries: CreateDailyReportEntryInput[];
}

// ============================================================
// レビュー記録票 (API-C-018〜023)
// ============================================================

export interface ReviewSessionResponse {
  id: number;
  projectId: number;
  reviewType: string;
  targetName: string;
  sessionDate: string;
  reviewerId: number;
  reviewerName: string;
  totalItems: number;
  openItems: number;
  createdAt: string;
}

export interface CreateReviewSessionRequest {
  reviewType: string;
  targetName: string;
  sessionDate: string;
  reviewerId: number;
}

export interface ReviewItemResponse {
  id: number;
  sessionId: number;
  categoryId: number | null;
  categoryName: string | null;
  title: string;
  description: string | null;
  severity: Severity;
  status: ReviewItemStatus;
  assigneeId: number | null;
  assigneeName: string | null;
  dueDate: string | null;
  resolvedAt: string | null;
}

export interface CreateReviewItemRequest {
  sessionId: number;
  categoryId?: number | null;
  title: string;
  description?: string | null;
  severity: Severity;
  assigneeId?: number | null;
  dueDate?: string | null;
}

export interface UpdateReviewItemRequest {
  categoryId?: number | null;
  title?: string;
  description?: string | null;
  severity?: Severity;
  status?: ReviewItemStatus;
  assigneeId?: number | null;
  dueDate?: string | null;
}

export interface ReviewCategoryResponse {
  id: number;
  projectId: number;
  name: string;
  sortOrder: number;
}

// ============================================================
// 障害管理票 (API-C-024〜027)
// ============================================================

export interface BugResponse {
  id: number;
  projectId: number;
  bugNumber: string;
  title: string;
  description: string | null;
  severity: Severity;
  status: BugStatus;
  taskId: number | null;
  taskName: string | null;
  reportedById: number;
  reporterName: string;
  assigneeId: number | null;
  assigneeName: string | null;
  foundDate: string;
  foundPhase: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBugRequest {
  title: string;
  description?: string | null;
  severity: Severity;
  taskId?: number | null;
  assigneeId?: number | null;
  foundDate: string;
  foundPhase?: string | null;
}

export interface UpdateBugRequest {
  title?: string;
  description?: string | null;
  severity?: Severity;
  status?: BugStatus;
  taskId?: number | null;
  assigneeId?: number | null;
  foundDate?: string;
  foundPhase?: string | null;
}

// ============================================================
// レポート・分析 (API-C-028〜032)
// ============================================================

export type DashboardResponse = DashboardData;

export type EvmResponse = EvmResult;

export interface ReliabilityGrowthDataPoint {
  date: string;
  cumulativeFound: number;
  cumulativeFixed: number;
}

export interface ReliabilityGrowthResponse {
  dataPoints: ReliabilityGrowthDataPoint[];
}

export interface ReviewCategoryStatsItem {
  categoryId: number;
  categoryName: string;
  count: number;
  percentage: number;
}

export interface ReviewCategoryStatsResponse {
  items: ReviewCategoryStatsItem[];
  total: number;
}

export interface BugDensityByAssignee {
  assigneeId: number;
  assigneeName: string;
  count: number;
}

export interface BugDensityByModule {
  taskId: number;
  taskName: string;
  count: number;
}

export interface BugDensityResponse {
  byAssignee: BugDensityByAssignee[];
  byModule: BugDensityByModule[];
}

// ============================================================
// ユーザー管理（管理者）(API-A-001〜004)
// ============================================================

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: Role;
  initialPassword: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: Role;
  isActive?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}
