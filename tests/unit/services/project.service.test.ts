import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectService } from "@/lib/services/project.service";
import type { ProjectRepository } from "@/lib/repositories/project.repository";
import { NotFoundError, ConflictError } from "@/lib/utils/error";

// ProjectRepository のモック
const mockProjectRepository: ProjectRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  createFull: vi.fn(),
  update: vi.fn(),
  findMembers: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  toggleFavorite: vi.fn(),
  createReviewCategories: vi.fn(),
  isMember: vi.fn(),
};

describe("ProjectService", () => {
  let projectService: ProjectService;

  beforeEach(() => {
    vi.clearAllMocks();
    projectService = new ProjectService(mockProjectRepository);
  });

  // ============================================================
  // お気に入り管理テスト
  // ============================================================

  describe("toggleFavorite", () => {
    it("メンバーはお気に入りを true に設定できる", async () => {
      vi.mocked(mockProjectRepository.isMember).mockResolvedValue(true);
      vi.mocked(mockProjectRepository.toggleFavorite).mockResolvedValue(undefined);

      await expect(
        projectService.toggleFavorite(BigInt(1), BigInt(1), true)
      ).resolves.toBeUndefined();

      expect(mockProjectRepository.toggleFavorite).toHaveBeenCalledWith(BigInt(1), BigInt(1), true);
    });

    it("メンバーはお気に入りを false に設定できる", async () => {
      vi.mocked(mockProjectRepository.isMember).mockResolvedValue(true);
      vi.mocked(mockProjectRepository.toggleFavorite).mockResolvedValue(undefined);

      await expect(
        projectService.toggleFavorite(BigInt(1), BigInt(1), false)
      ).resolves.toBeUndefined();

      expect(mockProjectRepository.toggleFavorite).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1),
        false
      );
    });

    it("メンバー外ユーザーがお気に入り操作をすると NotFoundError", async () => {
      vi.mocked(mockProjectRepository.isMember).mockResolvedValue(false);

      await expect(projectService.toggleFavorite(BigInt(1), BigInt(99), true)).rejects.toThrow(
        NotFoundError
      );

      expect(mockProjectRepository.toggleFavorite).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // メンバー管理テスト
  // ============================================================

  describe("addMember", () => {
    it("既存メンバーを重複追加すると ConflictError", async () => {
      vi.mocked(mockProjectRepository.isMember).mockResolvedValue(true);

      await expect(projectService.addMember(BigInt(1), BigInt(5))).rejects.toThrow(ConflictError);

      expect(mockProjectRepository.addMember).not.toHaveBeenCalled();
    });

    it("未参加ユーザーをメンバーに追加できる", async () => {
      vi.mocked(mockProjectRepository.isMember).mockResolvedValue(false);
      vi.mocked(mockProjectRepository.addMember).mockResolvedValue(undefined);

      await expect(projectService.addMember(BigInt(1), BigInt(5))).resolves.toBeUndefined();

      expect(mockProjectRepository.addMember).toHaveBeenCalledWith(BigInt(1), BigInt(5));
    });
  });

  describe("removeMember", () => {
    it("メンバーを削除できる", async () => {
      vi.mocked(mockProjectRepository.isMember).mockResolvedValue(true);
      vi.mocked(mockProjectRepository.removeMember).mockResolvedValue(undefined);

      await expect(projectService.removeMember(BigInt(1), BigInt(5))).resolves.toBeUndefined();

      expect(mockProjectRepository.removeMember).toHaveBeenCalledWith(BigInt(1), BigInt(5));
    });

    it("メンバー外ユーザーを削除しようとすると NotFoundError", async () => {
      vi.mocked(mockProjectRepository.isMember).mockResolvedValue(false);

      await expect(projectService.removeMember(BigInt(1), BigInt(99))).rejects.toThrow(
        NotFoundError
      );

      expect(mockProjectRepository.removeMember).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // 指摘区分自動生成テスト
  // ============================================================

  describe("createProject（指摘区分自動生成）", () => {
    const mockCreatedProject = {
      id: BigInt(1),
      name: "テストプロジェクト",
      description: null,
      startDate: new Date("2026-01-01"),
      endDate: null,
      status: "active",
      bugSequence: 0,
      createdBy: BigInt(1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockProjectWithPm = {
      ...mockCreatedProject,
      pmId: BigInt(1),
      pmName: "PM テスト",
      isFavorite: false,
    };

    it("プロジェクト作成時に5つの指摘区分が自動生成される（createFull でトランザクション実行）", async () => {
      vi.mocked(mockProjectRepository.createFull).mockResolvedValue(mockCreatedProject);
      vi.mocked(mockProjectRepository.findById).mockResolvedValue(mockProjectWithPm);

      await projectService.createProject(BigInt(1), {
        name: "テストプロジェクト",
        startDate: "2026-01-01",
        pmId: 1,
      });

      expect(mockProjectRepository.createFull).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Array),
        expect.arrayContaining([
          expect.objectContaining({ name: "設計漏れ", sortOrder: 1 }),
          expect.objectContaining({ name: "実装誤り", sortOrder: 2 }),
          expect.objectContaining({ name: "テスト不足", sortOrder: 3 }),
          expect.objectContaining({ name: "スタイル", sortOrder: 4 }),
          expect.objectContaining({ name: "その他", sortOrder: 5 }),
        ])
      );
    });

    it("プロジェクト作成時に pmId ユーザーがメンバーに追加される", async () => {
      vi.mocked(mockProjectRepository.createFull).mockResolvedValue(mockCreatedProject);
      vi.mocked(mockProjectRepository.findById).mockResolvedValue(mockProjectWithPm);

      await projectService.createProject(BigInt(1), {
        name: "テストプロジェクト",
        startDate: "2026-01-01",
        pmId: 5,
      });

      expect(mockProjectRepository.createFull).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([BigInt(5)]),
        expect.any(Array)
      );
    });

    it("作成者(userId)が pmId と異なる場合、作成者もメンバーに追加される", async () => {
      vi.mocked(mockProjectRepository.createFull).mockResolvedValue(mockCreatedProject);
      vi.mocked(mockProjectRepository.findById).mockResolvedValue(mockProjectWithPm);

      await projectService.createProject(BigInt(10), {
        name: "テストプロジェクト",
        startDate: "2026-01-01",
        pmId: 5,
      });

      // pmId(5) と creator(10) の両方が追加される
      expect(mockProjectRepository.createFull).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([BigInt(5), BigInt(10)]),
        expect.any(Array)
      );
    });
  });

  // ============================================================
  // プロジェクト取得テスト
  // ============================================================

  describe("getProjects", () => {
    it("admin はすべてのプロジェクトを取得できる", async () => {
      const mockProjects = [
        {
          id: BigInt(1),
          name: "プロジェクトA",
          status: "active",
          startDate: new Date("2026-01-01"),
          endDate: null,
          isFavorite: false,
          pmName: "PM テスト",
          createdBy: BigInt(1),
          description: null,
          bugSequence: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockProjectRepository.findAll).mockResolvedValue(mockProjects as any);

      const result = await projectService.getProjects(BigInt(1), "admin", "active");

      expect(mockProjectRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: "active" }),
        expect.anything()
      );
      expect(result).toHaveLength(1);
    });

    it("developer はメンバー参加プロジェクトのみ取得できる", async () => {
      vi.mocked(mockProjectRepository.findAll).mockResolvedValue([]);

      await projectService.getProjects(BigInt(2), "developer", "active");

      expect(mockProjectRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ userId: BigInt(2) }),
        expect.anything()
      );
    });
  });

  describe("getProjectById", () => {
    it("存在するプロジェクトを取得できる", async () => {
      const mockProject = {
        id: BigInt(1),
        name: "プロジェクトA",
        status: "active",
        startDate: new Date("2026-01-01"),
        endDate: null,
        description: null,
        bugSequence: 0,
        createdBy: BigInt(1),
        createdAt: new Date(),
        updatedAt: new Date(),
        pmName: "PM テスト",
        pmId: BigInt(1),
      };

      vi.mocked(mockProjectRepository.findById).mockResolvedValue(mockProject as any);

      const result = await projectService.getProjectById(BigInt(1));

      expect(result).toBeDefined();
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(BigInt(1));
    });

    it("存在しないプロジェクトは NotFoundError", async () => {
      vi.mocked(mockProjectRepository.findById).mockResolvedValue(null);

      await expect(projectService.getProjectById(BigInt(999))).rejects.toThrow(NotFoundError);
    });
  });
});
