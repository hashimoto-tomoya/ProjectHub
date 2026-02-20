/**
 * テスト用ユーザーフィクスチャ
 *
 * testing.md の「テストユーザー」定義に準拠
 */

export type UserFixture = {
  name: string;
  email: string;
  /** bcrypt でハッシュ化される前の平文パスワード（テスト内でのログイン操作用） */
  plainPassword: string;
  role: "admin" | "pmo" | "pm" | "developer";
  isActive: boolean;
};

export const userFixtures: Record<string, UserFixture> = {
  admin: {
    name: "管理者 テスト",
    email: "admin@test.local",
    plainPassword: "Admin1234!",
    role: "admin",
    isActive: true,
  },
  pmo: {
    name: "PMO テスト",
    email: "pmo@test.local",
    plainPassword: "Pmo12345!",
    role: "pmo",
    isActive: true,
  },
  pm: {
    name: "PM テスト",
    email: "pm@test.local",
    plainPassword: "Pm123456!",
    role: "pm",
    isActive: true,
  },
  dev1: {
    name: "開発者1 テスト",
    email: "dev1@test.local",
    plainPassword: "Dev12345!",
    role: "developer",
    isActive: true,
  },
  dev2: {
    name: "開発者2 テスト",
    email: "dev2@test.local",
    plainPassword: "Dev22345!",
    role: "developer",
    isActive: true,
  },
  /** ログイン拒否テスト用（is_active = false） */
  inactive: {
    name: "無効ユーザー テスト",
    email: "inactive@test.local",
    plainPassword: "Inact123!",
    role: "developer",
    isActive: false,
  },
};
