/**
 * テスト用フィクスチャのエクスポートとDBセットアップヘルパー
 *
 * 使用方法:
 *   import { seedTestData, cleanupTestData } from "@/tests/fixtures";
 *
 *   beforeEach(async () => {
 *     await cleanupTestData(prisma);
 *     const fixtures = await seedTestData(prisma);
 *     // fixtures.users.admin, fixtures.projects.projectA 等でアクセス
 *   });
 */

import type { PrismaClient, ReviewCategory } from "@prisma/client";
import { userFixtures } from "./users.fixture";
import { projectFixtures, reviewCategoryFixtures } from "./projects.fixture";
import { taskFixtures } from "./tasks.fixture";

export { userFixtures } from "./users.fixture";
export { projectFixtures, reviewCategoryFixtures } from "./projects.fixture";
export { taskFixtures } from "./tasks.fixture";

/** テストで使用するダミーパスワードハッシュ（bcrypt 形式のダミー値） */
const TEST_PASSWORD_HASH = "$2b$12$testHashForTestingPurposesOnly.NotRealBcryptHash";

export type SeededFixtures = {
  users: {
    admin: { id: bigint; email: string };
    pmo: { id: bigint; email: string };
    pm: { id: bigint; email: string };
    dev1: { id: bigint; email: string };
    dev2: { id: bigint; email: string };
    inactive: { id: bigint; email: string };
  };
  projects: {
    projectA: { id: bigint; name: string };
    projectB: { id: bigint; name: string };
  };
  tasks: {
    parentTask: { id: bigint; name: string };
    childTask: { id: bigint; name: string };
    grandChildTask: { id: bigint; name: string };
    completedTask: { id: bigint; name: string };
    developmentTask: { id: bigint; name: string };
  };
  reviewCategories: Array<{ id: bigint; name: string }>;
};

/**
 * テストデータを DB に投入する
 * beforeEach で呼び出す
 */
export async function seedTestData(prisma: PrismaClient): Promise<SeededFixtures> {
  // ─── ユーザー作成 ───
  const createdUsers: Record<string, { id: bigint; email: string }> = {};

  for (const [key, fixture] of Object.entries(userFixtures)) {
    const user = await prisma.user.create({
      data: {
        name: fixture.name,
        email: fixture.email,
        passwordHash: TEST_PASSWORD_HASH,
        role: fixture.role,
        isActive: fixture.isActive,
      },
    });
    createdUsers[key] = { id: user.id, email: user.email };
  }

  // ─── プロジェクト作成 ───
  const createdProjects: Record<string, { id: bigint; name: string }> = {};

  // プロジェクトA（active）— PM が作成者
  const projectA = await prisma.project.create({
    data: {
      ...projectFixtures.projectA,
      createdBy: createdUsers.pm.id,
    },
  });
  createdProjects.projectA = { id: projectA.id, name: projectA.name };

  // プロジェクトB（archived）
  const projectB = await prisma.project.create({
    data: {
      ...projectFixtures.projectB,
      createdBy: createdUsers.pm.id,
    },
  });
  createdProjects.projectB = { id: projectB.id, name: projectB.name };

  // ─── プロジェクトメンバー設定（プロジェクトA） ───
  const memberEntries = [
    { userId: createdUsers.pm.id, isFavorite: true },
    { userId: createdUsers.pmo.id, isFavorite: false },
    { userId: createdUsers.dev1.id, isFavorite: false },
    { userId: createdUsers.dev2.id, isFavorite: false },
  ];

  await prisma.projectMember.createMany({
    data: memberEntries.map((m) => ({
      projectId: projectA.id,
      userId: m.userId,
      isFavorite: m.isFavorite,
    })),
  });

  // ─── 指摘区分マスタ（プロジェクトA） ───
  await prisma.reviewCategory.createMany({
    data: reviewCategoryFixtures.map((c) => ({
      projectId: projectA.id,
      name: c.name,
      sortOrder: c.sortOrder,
      isActive: true,
    })),
  });

  const createdCategories = await prisma.reviewCategory.findMany({
    where: { projectId: projectA.id },
    orderBy: { sortOrder: "asc" },
  });

  // ─── WBS タスク作成（プロジェクトA）───
  // 親子関係があるため順番に作成する
  const taskIdMap: Record<string, bigint> = {};

  // 大項目
  const parentTask = await prisma.task.create({
    data: {
      projectId: projectA.id,
      parentTaskId: null,
      level: taskFixtures.parentTask.level,
      name: taskFixtures.parentTask.name,
      startDate: taskFixtures.parentTask.startDate,
      endDate: taskFixtures.parentTask.endDate,
      plannedHours: taskFixtures.parentTask.plannedHours,
      status: taskFixtures.parentTask.status,
      sortOrder: taskFixtures.parentTask.sortOrder,
    },
  });
  taskIdMap.parentTask = parentTask.id;

  // 完了タスク（大項目）
  const completedTask = await prisma.task.create({
    data: {
      projectId: projectA.id,
      parentTaskId: null,
      level: taskFixtures.completedTask.level,
      name: taskFixtures.completedTask.name,
      startDate: taskFixtures.completedTask.startDate,
      endDate: taskFixtures.completedTask.endDate,
      plannedHours: taskFixtures.completedTask.plannedHours,
      status: taskFixtures.completedTask.status,
      sortOrder: taskFixtures.completedTask.sortOrder,
    },
  });
  taskIdMap.completedTask = completedTask.id;

  // 中項目
  const childTask = await prisma.task.create({
    data: {
      projectId: projectA.id,
      parentTaskId: taskIdMap.parentTask,
      level: taskFixtures.childTask.level,
      name: taskFixtures.childTask.name,
      startDate: taskFixtures.childTask.startDate,
      endDate: taskFixtures.childTask.endDate,
      plannedHours: taskFixtures.childTask.plannedHours,
      status: taskFixtures.childTask.status,
      sortOrder: taskFixtures.childTask.sortOrder,
    },
  });
  taskIdMap.childTask = childTask.id;

  // 小項目
  const grandChildTask = await prisma.task.create({
    data: {
      projectId: projectA.id,
      parentTaskId: taskIdMap.childTask,
      level: taskFixtures.grandChildTask.level,
      name: taskFixtures.grandChildTask.name,
      startDate: taskFixtures.grandChildTask.startDate,
      endDate: taskFixtures.grandChildTask.endDate,
      plannedHours: taskFixtures.grandChildTask.plannedHours,
      status: taskFixtures.grandChildTask.status,
      sortOrder: taskFixtures.grandChildTask.sortOrder,
    },
  });
  taskIdMap.grandChildTask = grandChildTask.id;

  // 日報実績工数テスト用タスク
  const developmentTask = await prisma.task.create({
    data: {
      projectId: projectA.id,
      parentTaskId: taskIdMap.completedTask,
      assigneeId: createdUsers.dev1.id,
      level: taskFixtures.developmentTask.level,
      name: taskFixtures.developmentTask.name,
      startDate: taskFixtures.developmentTask.startDate,
      endDate: taskFixtures.developmentTask.endDate,
      plannedHours: taskFixtures.developmentTask.plannedHours,
      status: taskFixtures.developmentTask.status,
      sortOrder: taskFixtures.developmentTask.sortOrder,
    },
  });
  taskIdMap.developmentTask = developmentTask.id;

  return {
    users: {
      admin: createdUsers.admin,
      pmo: createdUsers.pmo,
      pm: createdUsers.pm,
      dev1: createdUsers.dev1,
      dev2: createdUsers.dev2,
      inactive: createdUsers.inactive,
    },
    projects: {
      projectA: createdProjects.projectA,
      projectB: createdProjects.projectB,
    },
    tasks: {
      parentTask: { id: parentTask.id, name: parentTask.name },
      childTask: { id: childTask.id, name: childTask.name },
      grandChildTask: { id: grandChildTask.id, name: grandChildTask.name },
      completedTask: { id: completedTask.id, name: completedTask.name },
      developmentTask: {
        id: developmentTask.id,
        name: developmentTask.name,
      },
    },
    reviewCategories: createdCategories.map((c: ReviewCategory) => ({
      id: c.id,
      name: c.name,
    })),
  };
}

/**
 * テストデータをすべて削除する（TRUNCATE CASCADE 相当）
 * afterEach で呼び出す
 */
export async function cleanupTestData(prisma: PrismaClient): Promise<void> {
  // 外部キー制約の順序に沿って削除（CASCADE が効くが念のため順序通りに）
  await prisma.$executeRaw`TRUNCATE TABLE
    audit_logs,
    bugs,
    review_items,
    review_categories,
    review_sessions,
    daily_report_entries,
    daily_reports,
    tasks,
    project_members,
    projects,
    users
    RESTART IDENTITY CASCADE`;
}
