import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskService } from "@/lib/services/task.service";
import type { TaskRepository } from "@/lib/repositories/task.repository";
import { InvalidHierarchyError, NotFoundError, ValidationError } from "@/lib/utils/error";
import type { TaskResponse } from "@/lib/types/api";

// TaskRepository のモック
const mockTaskRepository: TaskRepository = {
  findByProjectWithActualHours: vi.fn(),
  findById: vi.fn(),
  findChildren: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  hasDailyReportEntries: vi.fn(),
};

// タスクのフィクスチャ
const makeTask = (overrides: Partial<TaskResponse> = {}): TaskResponse => ({
  id: 1,
  parentTaskId: null,
  level: 1,
  name: "大項目タスク",
  assigneeId: null,
  assigneeName: null,
  startDate: "2026-01-01",
  endDate: "2026-03-31",
  status: "未着手",
  plannedHours: 10,
  actualHours: 0,
  displayOrder: 0,
  ...overrides,
});

describe("TaskService", () => {
  let taskService: TaskService;

  beforeEach(() => {
    vi.clearAllMocks();
    taskService = new TaskService(mockTaskRepository);
  });

  // ============================================================
  // TC-UT-001: 正常なタスク登録（大項目）
  // ============================================================

  describe("create - 大項目タスク登録", () => {
    it("TC-UT-001: parentTaskId=null で level=1 のタスクが作成される", async () => {
      const createdTask = makeTask({ id: 10, parentTaskId: null, level: 1, name: "新規大項目" });
      vi.mocked(mockTaskRepository.create).mockResolvedValue(createdTask);

      const result = await taskService.create(BigInt(1), {
        name: "新規大項目",
        startDate: "2026-01-01",
        endDate: "2026-03-31",
        plannedHours: 10,
      });

      expect(result.level).toBe(1);
      expect(result.parentTaskId).toBeNull();
      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 1,
          parentTaskId: null,
        })
      );
    });
  });

  // ============================================================
  // TC-UT-002: 中項目タスクの登録
  // ============================================================

  describe("create - 中項目タスク登録", () => {
    it("TC-UT-002: 大項目（level=1）を親に指定すると level=2 のタスクが作成される", async () => {
      const parentTask = makeTask({ id: 1, level: 1, parentTaskId: null });
      const createdTask = makeTask({ id: 11, parentTaskId: 1, level: 2, name: "中項目タスク" });

      vi.mocked(mockTaskRepository.findById).mockResolvedValue(parentTask);
      vi.mocked(mockTaskRepository.create).mockResolvedValue(createdTask);

      const result = await taskService.create(BigInt(1), {
        name: "中項目タスク",
        parentTaskId: 1,
        startDate: "2026-01-01",
        endDate: "2026-03-31",
        plannedHours: 5,
      });

      expect(result.level).toBe(2);
      expect(result.parentTaskId).toBe(1);
      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 2,
          parentTaskId: 1,
        })
      );
    });
  });

  // ============================================================
  // TC-UT-003: 階層 3 レベル超過
  // ============================================================

  describe("create - 階層制限", () => {
    it("TC-UT-003: level=3 の親タスクを指定すると InvalidHierarchyError（422）", async () => {
      const parentTask = makeTask({ id: 3, level: 3, parentTaskId: 2 });

      vi.mocked(mockTaskRepository.findById).mockResolvedValue(parentTask);

      await expect(
        taskService.create(BigInt(1), {
          name: "4階層目タスク",
          parentTaskId: 3,
          startDate: "2026-01-01",
          endDate: "2026-03-31",
          plannedHours: 2,
        })
      ).rejects.toThrow(InvalidHierarchyError);

      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // TC-UT-004: 終了日が開始日より前
  // ============================================================

  describe("create - 日付バリデーション", () => {
    it("TC-UT-004: endDate が startDate より前の場合 ValidationError（400）", async () => {
      await expect(
        taskService.create(BigInt(1), {
          name: "日付不正タスク",
          startDate: "2026-03-31",
          endDate: "2026-01-01",
          plannedHours: 5,
        })
      ).rejects.toThrow(ValidationError);

      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    it("startDate と endDate が同じ日付は正常", async () => {
      const createdTask = makeTask({
        id: 12,
        name: "同日タスク",
        startDate: "2026-01-15",
        endDate: "2026-01-15",
      });
      vi.mocked(mockTaskRepository.create).mockResolvedValue(createdTask);

      const result = await taskService.create(BigInt(1), {
        name: "同日タスク",
        startDate: "2026-01-15",
        endDate: "2026-01-15",
        plannedHours: 1,
      });

      expect(result).toBeDefined();
    });
  });

  // ============================================================
  // TC-UT-005: ガントチャート D&D での期間更新
  // ============================================================

  describe("update - ガントチャート D&D 期間更新", () => {
    it("TC-UT-005: startDate/endDate が更新される", async () => {
      const existingTask = makeTask({ id: 5, startDate: "2026-01-01", endDate: "2026-01-31" });
      const updatedTask = makeTask({ id: 5, startDate: "2026-02-01", endDate: "2026-02-28" });

      vi.mocked(mockTaskRepository.findById).mockResolvedValue(existingTask);
      vi.mocked(mockTaskRepository.update).mockResolvedValue(updatedTask);

      const result = await taskService.update(BigInt(5), {
        startDate: "2026-02-01",
        endDate: "2026-02-28",
      });

      expect(result.startDate).toBe("2026-02-01");
      expect(result.endDate).toBe("2026-02-28");
      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        BigInt(5),
        expect.objectContaining({
          startDate: "2026-02-01",
          endDate: "2026-02-28",
        })
      );
    });

    it("存在しないタスクを更新すると NotFoundError", async () => {
      vi.mocked(mockTaskRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.update(BigInt(999), {
          startDate: "2026-02-01",
          endDate: "2026-02-28",
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ============================================================
  // delete - 日報明細紐付きチェック
  // ============================================================

  describe("delete", () => {
    it("日報明細が紐付いていない場合は削除できる", async () => {
      const task = makeTask({ id: 5 });
      vi.mocked(mockTaskRepository.findById).mockResolvedValue(task);
      vi.mocked(mockTaskRepository.hasDailyReportEntries).mockResolvedValue(false);
      vi.mocked(mockTaskRepository.delete).mockResolvedValue(undefined);

      await expect(taskService.delete(BigInt(5))).resolves.toBeUndefined();
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(BigInt(5));
    });

    it("日報明細が紐付いている場合は ValidationError", async () => {
      const task = makeTask({ id: 5 });
      vi.mocked(mockTaskRepository.findById).mockResolvedValue(task);
      vi.mocked(mockTaskRepository.hasDailyReportEntries).mockResolvedValue(true);

      await expect(taskService.delete(BigInt(5))).rejects.toThrow(ValidationError);
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });

    it("存在しないタスクを削除すると NotFoundError", async () => {
      vi.mocked(mockTaskRepository.findById).mockResolvedValue(null);

      await expect(taskService.delete(BigInt(999))).rejects.toThrow(NotFoundError);
    });
  });
});
