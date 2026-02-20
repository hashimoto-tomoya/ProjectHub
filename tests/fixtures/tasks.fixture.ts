/**
 * テスト用 WBS タスクフィクスチャ
 *
 * 3レベル階層のサンプルタスクデータ（TC-UT-001〜005, TC-IT-007〜010 等で使用）
 */

export type TaskFixture = {
  name: string;
  level: 1 | 2 | 3;
  /** parentFixtureKey: null なら大項目 */
  parentFixtureKey: string | null;
  startDate: Date;
  endDate: Date;
  plannedHours: number;
  status: "未着手" | "進行中" | "完了" | "保留";
  sortOrder: number;
};

export const taskFixtures: Record<string, TaskFixture> = {
  /** 大項目（level=1） */
  parentTask: {
    name: "設計フェーズ",
    level: 1,
    parentFixtureKey: null,
    startDate: new Date("2026-01-05"),
    endDate: new Date("2026-01-31"),
    plannedHours: 40,
    status: "未着手",
    sortOrder: 1,
  },
  /** 中項目（level=2） */
  childTask: {
    name: "基本設計",
    level: 2,
    parentFixtureKey: "parentTask",
    startDate: new Date("2026-01-05"),
    endDate: new Date("2026-01-15"),
    plannedHours: 20,
    status: "未着手",
    sortOrder: 1,
  },
  /** 小項目（level=3） — 階層制限テスト用 */
  grandChildTask: {
    name: "画面設計",
    level: 3,
    parentFixtureKey: "childTask",
    startDate: new Date("2026-01-05"),
    endDate: new Date("2026-01-10"),
    plannedHours: 8,
    status: "未着手",
    sortOrder: 1,
  },
  /** EVM テスト用: 完了タスク */
  completedTask: {
    name: "製造フェーズ（完了）",
    level: 1,
    parentFixtureKey: null,
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-02-28"),
    plannedHours: 80,
    status: "完了",
    sortOrder: 2,
  },
  /** 日報実績工数テスト用 */
  developmentTask: {
    name: "機能A実装",
    level: 2,
    parentFixtureKey: "completedTask",
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-02-14"),
    plannedHours: 40,
    status: "進行中",
    sortOrder: 1,
  },
};
