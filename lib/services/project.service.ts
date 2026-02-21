import { NotFoundError, ConflictError } from "@/lib/utils/error";
import { projectRepository } from "@/lib/repositories/project.repository";
import type { ProjectRepository } from "@/lib/repositories/project.repository";
import type { Role, ProjectStatus } from "@/lib/types/domain";
import type {
  ProjectListItem,
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectMember,
} from "@/lib/types/api";

// プロジェクト作成時に自動生成する指摘区分
const DEFAULT_REVIEW_CATEGORIES = [
  { name: "設計漏れ", sortOrder: 1 },
  { name: "実装誤り", sortOrder: 2 },
  { name: "テスト不足", sortOrder: 3 },
  { name: "スタイル", sortOrder: 4 },
  { name: "その他", sortOrder: 5 },
];

export class ProjectService {
  constructor(private projectRepository: ProjectRepository) {}

  /**
   * プロジェクト一覧取得
   * - admin: 全プロジェクト
   * - その他: メンバー参加プロジェクトのみ
   */
  async getProjects(
    userId: bigint,
    role: Role,
    status: ProjectStatus | "all" = "active"
  ): Promise<ProjectListItem[]> {
    const criteria =
      role === "admin"
        ? { status: status === "all" ? undefined : status }
        : { status: status === "all" ? undefined : status, userId };

    const projects = await this.projectRepository.findAll(criteria, userId);

    return projects.map((p) => ({
      id: Number(p.id),
      name: p.name,
      status: p.status as ProjectStatus,
      startDate: p.startDate.toISOString().slice(0, 10),
      endDate: p.endDate ? p.endDate.toISOString().slice(0, 10) : null,
      pmName: p.pmName ?? "",
      isFavorite: p.isFavorite,
    }));
  }

  /**
   * プロジェクト詳細取得
   */
  async getProjectById(projectId: bigint): Promise<ProjectDetail> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("プロジェクトが見つかりません");
    }

    return {
      id: Number(project.id),
      name: project.name,
      status: project.status as ProjectStatus,
      startDate: project.startDate.toISOString().slice(0, 10),
      endDate: project.endDate ? project.endDate.toISOString().slice(0, 10) : null,
      description: project.description,
      pmId: Number(project.pmId ?? project.createdBy),
      pmName: project.pmName ?? "",
      bugSequence: project.bugSequence,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  /**
   * プロジェクト作成
   * - pmId ユーザーをメンバーに追加
   * - 作成者が pmId と異なる場合、作成者もメンバーに追加
   * - 指摘区分マスタを自動生成
   */
  async createProject(userId: bigint, input: CreateProjectRequest): Promise<ProjectDetail> {
    const project = await this.projectRepository.create({
      name: input.name,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      description: input.description ?? null,
      creator: { connect: { id: userId } },
    });

    // PM をメンバーに追加
    const pmId = BigInt(input.pmId);
    await this.projectRepository.addMember(project.id, pmId);

    // 作成者が PM と異なる場合は作成者もメンバーに追加
    if (userId !== pmId) {
      await this.projectRepository.addMember(project.id, userId);
    }

    // 指摘区分マスタを自動生成
    await this.projectRepository.createReviewCategories(project.id, DEFAULT_REVIEW_CATEGORIES);

    return this.getProjectById(project.id);
  }

  /**
   * プロジェクト更新
   */
  async updateProject(projectId: bigint, input: UpdateProjectRequest): Promise<ProjectDetail> {
    const existing = await this.projectRepository.findById(projectId);
    if (!existing) {
      throw new NotFoundError("プロジェクトが見つかりません");
    }

    await this.projectRepository.update(projectId, {
      name: input.name,
      status: input.status,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate !== undefined ? (input.endDate ? new Date(input.endDate) : null) : undefined,
      description: input.description !== undefined ? input.description : undefined,
    });

    return this.getProjectById(projectId);
  }

  /**
   * お気に入りトグル
   * - プロジェクトメンバーのみ操作可能
   */
  async toggleFavorite(projectId: bigint, userId: bigint, isFavorite: boolean): Promise<void> {
    const isMember = await this.projectRepository.isMember(projectId, userId);
    if (!isMember) {
      throw new NotFoundError("プロジェクトが見つかりません");
    }

    await this.projectRepository.toggleFavorite(projectId, userId, isFavorite);
  }

  /**
   * メンバー一覧取得
   */
  async getMembers(projectId: bigint): Promise<ProjectMember[]> {
    const existing = await this.projectRepository.findById(projectId);
    if (!existing) {
      throw new NotFoundError("プロジェクトが見つかりません");
    }

    const members = await this.projectRepository.findMembers(projectId);

    return members.map((m) => ({
      userId: Number(m.userId),
      name: m.user.name,
      email: m.user.email,
      role: m.user.role as Role,
      isFavorite: m.isFavorite,
    }));
  }

  /**
   * メンバー追加
   * - 既存メンバーへの重複追加は ConflictError
   */
  async addMember(projectId: bigint, userId: bigint): Promise<void> {
    const alreadyMember = await this.projectRepository.isMember(projectId, userId);
    if (alreadyMember) {
      throw new ConflictError("すでにプロジェクトのメンバーです");
    }

    await this.projectRepository.addMember(projectId, userId);
  }

  /**
   * メンバー削除
   * - 非メンバーは NotFoundError
   */
  async removeMember(projectId: bigint, userId: bigint): Promise<void> {
    const isMember = await this.projectRepository.isMember(projectId, userId);
    if (!isMember) {
      throw new NotFoundError("プロジェクトメンバーが見つかりません");
    }

    await this.projectRepository.removeMember(projectId, userId);
  }
}

export const projectService = new ProjectService(projectRepository);
