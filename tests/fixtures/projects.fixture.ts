/**
 * テスト用プロジェクト・指摘区分マスタフィクスチャ
 *
 * testing.md の「テストプロジェクト・マスタデータ」定義に準拠
 */

export type ProjectFixture = {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "archived";
};

export const projectFixtures: Record<string, ProjectFixture> = {
  /** 標準テスト用（全機能テスト） */
  projectA: {
    name: "テストプロジェクトA",
    description: "全機能テスト用の標準プロジェクト",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    status: "active",
  },
  /** フィルタテスト用（アーカイブ済み） */
  projectB: {
    name: "テストプロジェクトB（アーカイブ）",
    description: "フィルタテスト用のアーカイブ済みプロジェクト",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    status: "archived",
  },
};

export type ReviewCategoryFixture = {
  name: string;
  sortOrder: number;
};

/** プロジェクトA の初期指摘区分マスタ（data-model.md 参照） */
export const reviewCategoryFixtures: ReviewCategoryFixture[] = [
  { name: "設計漏れ", sortOrder: 1 },
  { name: "実装誤り", sortOrder: 2 },
  { name: "テスト不足", sortOrder: 3 },
  { name: "スタイル", sortOrder: 4 },
  { name: "その他", sortOrder: 5 },
];
