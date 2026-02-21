import { prisma } from "@/lib/prisma/client";
import type { Prisma, Project } from "@prisma/client";

export interface ProjectWithPm extends Project {
  pmId: bigint | null;
  pmName: string | null;
  isFavorite: boolean;
}

export interface MemberWithUser {
  id: bigint;
  projectId: bigint;
  userId: bigint;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: bigint;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export interface ProjectCriteria {
  status?: string;
  /** admin 以外は userId でメンバーフィルタ */
  userId?: bigint;
}

export interface ReviewCategoryInput {
  name: string;
  sortOrder: number;
}

export interface ProjectRepository {
  findAll(criteria: ProjectCriteria, currentUserId?: bigint): Promise<ProjectWithPm[]>;
  findById(id: bigint): Promise<ProjectWithPm | null>;
  create(data: Prisma.ProjectCreateInput): Promise<Project>;
  /** プロジェクト作成・メンバー追加・指摘区分生成をトランザクションで一括実行 */
  createFull(
    data: Prisma.ProjectCreateInput,
    memberIds: bigint[],
    categories: ReviewCategoryInput[]
  ): Promise<Project>;
  update(id: bigint, data: Prisma.ProjectUpdateInput): Promise<Project>;
  findMembers(projectId: bigint): Promise<MemberWithUser[]>;
  addMember(projectId: bigint, userId: bigint): Promise<void>;
  removeMember(projectId: bigint, userId: bigint): Promise<void>;
  toggleFavorite(projectId: bigint, userId: bigint, isFavorite: boolean): Promise<void>;
  createReviewCategories(projectId: bigint, categories: ReviewCategoryInput[]): Promise<void>;
  isMember(projectId: bigint, userId: bigint): Promise<boolean>;
}

export class PrismaProjectRepository implements ProjectRepository {
  async findAll(criteria: ProjectCriteria, currentUserId?: bigint): Promise<ProjectWithPm[]> {
    const where: Prisma.ProjectWhereInput = {};

    if (criteria.status && criteria.status !== "all") {
      where.status = criteria.status;
    }

    // admin 以外はメンバー参加プロジェクトのみ
    if (criteria.userId) {
      where.members = {
        some: {
          userId: criteria.userId,
        },
      };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return projects.map((project) => {
      // PM: role が "pm" のメンバーから最初の1名
      const pmMember = project.members.find((m) => m.user.role === "pm");
      const creatorMember = project.members.find((m) => m.userId === project.createdBy);

      // お気に入り状態: currentUserId のメンバーレコードから取得
      const currentMember = currentUserId
        ? project.members.find((m) => m.userId === currentUserId)
        : null;

      return {
        ...project,
        pmId: pmMember?.userId ?? creatorMember?.userId ?? null,
        pmName: pmMember?.user.name ?? creatorMember?.user.name ?? null,
        isFavorite: currentMember?.isFavorite ?? false,
      };
    });
  }

  async findById(id: bigint): Promise<ProjectWithPm | null> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!project) return null;

    const pmMember = project.members.find((m) => m.user.role === "pm");
    const creatorMember = project.members.find((m) => m.userId === project.createdBy);

    return {
      ...project,
      pmId: pmMember?.userId ?? creatorMember?.userId ?? null,
      pmName: pmMember?.user.name ?? creatorMember?.user.name ?? null,
      isFavorite: false,
    };
  }

  async create(data: Prisma.ProjectCreateInput): Promise<Project> {
    return prisma.project.create({ data });
  }

  async createFull(
    data: Prisma.ProjectCreateInput,
    memberIds: bigint[],
    categories: ReviewCategoryInput[]
  ): Promise<Project> {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({ data });

      await tx.projectMember.createMany({
        data: memberIds.map((userId) => ({ projectId: project.id, userId })),
      });

      await tx.reviewCategory.createMany({
        data: categories.map((c) => ({
          projectId: project.id,
          name: c.name,
          sortOrder: c.sortOrder,
        })),
      });

      return project;
    });
  }

  async update(id: bigint, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return prisma.project.update({ where: { id }, data });
  }

  async findMembers(projectId: bigint): Promise<MemberWithUser[]> {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async addMember(projectId: bigint, userId: bigint): Promise<void> {
    await prisma.projectMember.create({
      data: { projectId, userId },
    });
  }

  async removeMember(projectId: bigint, userId: bigint): Promise<void> {
    await prisma.projectMember.deleteMany({
      where: { projectId, userId },
    });
  }

  async toggleFavorite(projectId: bigint, userId: bigint, isFavorite: boolean): Promise<void> {
    await prisma.projectMember.updateMany({
      where: { projectId, userId },
      data: { isFavorite },
    });
  }

  async createReviewCategories(
    projectId: bigint,
    categories: ReviewCategoryInput[]
  ): Promise<void> {
    await prisma.reviewCategory.createMany({
      data: categories.map((c) => ({
        projectId,
        name: c.name,
        sortOrder: c.sortOrder,
      })),
    });
  }

  async isMember(projectId: bigint, userId: bigint): Promise<boolean> {
    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    return member !== null;
  }
}

export const projectRepository = new PrismaProjectRepository();
