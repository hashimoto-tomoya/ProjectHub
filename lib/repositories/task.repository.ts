import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";
import type { TaskResponse } from "@/lib/types/api";

export interface TaskRepository {
  findByProjectWithActualHours(projectId: bigint): Promise<TaskResponse[]>;
  findById(id: bigint): Promise<TaskResponse | null>;
  findChildren(parentId: bigint): Promise<TaskResponse[]>;
  create(data: {
    projectId: bigint;
    parentTaskId: number | null;
    level: number;
    name: string;
    assigneeId?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    status: string;
    plannedHours?: number | null;
    displayOrder: number;
  }): Promise<TaskResponse>;
  update(
    id: bigint,
    data: {
      name?: string;
      assigneeId?: number | null;
      startDate?: string | null;
      endDate?: string | null;
      status?: string;
      plannedHours?: number | null;
      displayOrder?: number;
    }
  ): Promise<TaskResponse>;
  delete(id: bigint): Promise<void>;
  hasDailyReportEntries(id: bigint): Promise<boolean>;
}

function toTaskResponse(
  task: {
    id: bigint;
    parentTaskId: bigint | null;
    level: number;
    name: string;
    assigneeId: bigint | null;
    startDate: Date | null;
    endDate: Date | null;
    status: string;
    plannedHours: Prisma.Decimal | null;
    sortOrder: number;
    assignee?: { id: bigint; name: string } | null;
  },
  actualHours = 0
): TaskResponse {
  return {
    id: Number(task.id),
    parentTaskId: task.parentTaskId ? Number(task.parentTaskId) : null,
    level: task.level,
    name: task.name,
    assigneeId: task.assigneeId ? Number(task.assigneeId) : null,
    assigneeName: task.assignee?.name ?? null,
    startDate: task.startDate ? task.startDate.toISOString().slice(0, 10) : null,
    endDate: task.endDate ? task.endDate.toISOString().slice(0, 10) : null,
    status: task.status as TaskResponse["status"],
    plannedHours: task.plannedHours ? Number(task.plannedHours) : null,
    actualHours,
    displayOrder: task.sortOrder,
  };
}

export class PrismaTaskRepository implements TaskRepository {
  async findByProjectWithActualHours(projectId: bigint): Promise<TaskResponse[]> {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
        reportEntries: {
          select: { workHours: true },
        },
      },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
    });

    return tasks.map((task) => {
      const actualHours = task.reportEntries.reduce(
        (sum: number, e: { workHours: Prisma.Decimal }) => sum + Number(e.workHours),
        0
      );
      return toTaskResponse(task, actualHours);
    });
  }

  async findById(id: bigint): Promise<TaskResponse | null> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
        reportEntries: {
          select: { workHours: true },
        },
      },
    });

    if (!task) return null;

    const actualHours = task.reportEntries.reduce(
      (sum: number, e: { workHours: Prisma.Decimal }) => sum + Number(e.workHours),
      0
    );
    return toTaskResponse(task, actualHours);
  }

  async findChildren(parentId: bigint): Promise<TaskResponse[]> {
    const tasks = await prisma.task.findMany({
      where: { parentTaskId: parentId },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return tasks.map((task) => toTaskResponse(task));
  }

  async create(data: {
    projectId: bigint;
    parentTaskId: number | null;
    level: number;
    name: string;
    assigneeId?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    status: string;
    plannedHours?: number | null;
    displayOrder: number;
  }): Promise<TaskResponse> {
    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        parentTaskId: data.parentTaskId ? BigInt(data.parentTaskId) : null,
        level: data.level,
        name: data.name,
        assigneeId: data.assigneeId ? BigInt(data.assigneeId) : null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        startDate: (data.startDate ? new Date(data.startDate) : undefined) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endDate: (data.endDate ? new Date(data.endDate) : undefined) as any,
        status: data.status,
        plannedHours: data.plannedHours ?? 0,
        sortOrder: data.displayOrder,
      },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
      },
    });

    return toTaskResponse(task);
  }

  async update(
    id: bigint,
    data: {
      name?: string;
      assigneeId?: number | null;
      startDate?: string | null;
      endDate?: string | null;
      status?: string;
      plannedHours?: number | null;
      displayOrder?: number;
    }
  ): Promise<TaskResponse> {
    const updateData: Prisma.TaskUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.plannedHours !== undefined) updateData.plannedHours = data.plannedHours ?? 0;
    if (data.displayOrder !== undefined) updateData.sortOrder = data.displayOrder;

    if (data.assigneeId !== undefined) {
      updateData.assignee = data.assigneeId
        ? { connect: { id: BigInt(data.assigneeId) } }
        : { disconnect: true };
    }

    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : undefined;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : undefined;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true },
        },
        reportEntries: {
          select: { workHours: true },
        },
      },
    });

    const actualHours = task.reportEntries.reduce(
      (sum: number, e: { workHours: Prisma.Decimal }) => sum + Number(e.workHours),
      0
    );
    return toTaskResponse(task, actualHours);
  }

  async delete(id: bigint): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }

  async hasDailyReportEntries(id: bigint): Promise<boolean> {
    const count = await prisma.dailyReportEntry.count({
      where: { taskId: id },
    });
    return count > 0;
  }
}

export const taskRepository = new PrismaTaskRepository();
