import { InvalidHierarchyError, NotFoundError, ValidationError } from "@/lib/utils/error";
import { taskRepository } from "@/lib/repositories/task.repository";
import type { TaskRepository } from "@/lib/repositories/task.repository";
import type { CreateTaskRequest, TaskResponse, UpdateTaskRequest } from "@/lib/types/api";

export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  /**
   * プロジェクトのタスク一覧取得（実績工数付き）
   */
  async findByProject(projectId: bigint): Promise<TaskResponse[]> {
    return this.taskRepository.findByProjectWithActualHours(projectId);
  }

  /**
   * タスク登録
   * - 親タスクが指定された場合、階層レベルを計算
   * - 3階層超はエラー
   * - 日付バリデーション（endDate >= startDate）
   */
  async create(projectId: bigint, input: CreateTaskRequest): Promise<TaskResponse> {
    // 日付バリデーション
    if (input.startDate && input.endDate) {
      if (input.endDate < input.startDate) {
        throw new ValidationError("終了日は開始日以降の日付を入力してください");
      }
    }

    let level = 1;
    const parentTaskId = input.parentTaskId ?? null;

    if (parentTaskId) {
      const parentTask = await this.taskRepository.findById(BigInt(parentTaskId));
      if (!parentTask) {
        throw new NotFoundError("親タスクが見つかりません");
      }

      // 階層制限チェック: 親が level=3 なら子は level=4 となり制限超過
      if (parentTask.level >= 3) {
        throw new InvalidHierarchyError("タスクは3階層までしか作成できません");
      }

      level = parentTask.level + 1;
    }

    const displayOrder =
      input.displayOrder ??
      (await this.taskRepository.getMaxSortOrder(projectId, parentTaskId)) + 1;

    return this.taskRepository.create({
      projectId,
      parentTaskId,
      level,
      name: input.name,
      assigneeId: input.assigneeId ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      status: input.status ?? "未着手",
      plannedHours: input.plannedHours ?? null,
      displayOrder,
    });
  }

  /**
   * タスク更新
   * - プロジェクト所有権チェック
   * - 日付バリデーション
   */
  async update(projectId: bigint, taskId: bigint, input: UpdateTaskRequest): Promise<TaskResponse> {
    const existing = await this.taskRepository.findByIdAndProjectId(taskId, projectId);
    if (!existing) {
      throw new NotFoundError("タスクが見つかりません");
    }

    // 日付バリデーション（両方指定された場合）
    const startDate = input.startDate !== undefined ? input.startDate : existing.startDate;
    const endDate = input.endDate !== undefined ? input.endDate : existing.endDate;

    if (startDate && endDate && endDate < startDate) {
      throw new ValidationError("終了日は開始日以降の日付を入力してください");
    }

    return this.taskRepository.update(taskId, {
      name: input.name,
      assigneeId: input.assigneeId,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
      plannedHours: input.plannedHours,
      displayOrder: input.displayOrder,
    });
  }

  /**
   * タスク削除
   * - プロジェクト所有権チェック
   * - 日報明細が紐付いている場合は削除不可
   */
  async delete(projectId: bigint, taskId: bigint): Promise<void> {
    const existing = await this.taskRepository.findByIdAndProjectId(taskId, projectId);
    if (!existing) {
      throw new NotFoundError("タスクが見つかりません");
    }

    const hasEntries = await this.taskRepository.hasDailyReportEntries(taskId);
    if (hasEntries) {
      throw new ValidationError("日報明細が紐付いているタスクは削除できません");
    }

    await this.taskRepository.delete(taskId);
  }
}

export const taskService = new TaskService(taskRepository);
