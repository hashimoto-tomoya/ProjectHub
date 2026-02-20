/**
 * Prisma シードスクリプト
 *
 * 実行方法:
 *   npx prisma db seed
 *
 * シードデータ:
 *   - テストユーザー（admin, pmo, pm, developer 各1名）
 *   - テストプロジェクト（1件）
 *   - プロジェクトメンバー設定
 *   - 指摘区分マスタ（プロジェクト作成時の初期データ5件）
 */

import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// bcrypt の代わりに sha256 でハッシュ化（シードのみ）
// 本番・テストでは lib/utils/password.ts の bcrypt を使用する
function hashPassword(plain: string): string {
  // シード用の簡易ハッシュ（実際のアプリでは bcrypt を使用）
  // seed.ts では @types/bcrypt が不要なよう crypto で代替
  return `$seed$${createHash("sha256").update(plain).digest("hex")}`;
}

// 指摘区分マスタの初期データ（data-model.md のマスタデータ参照）
const DEFAULT_REVIEW_CATEGORIES = [
  { name: "設計漏れ", sortOrder: 1 },
  { name: "実装誤り", sortOrder: 2 },
  { name: "テスト不足", sortOrder: 3 },
  { name: "スタイル", sortOrder: 4 },
  { name: "その他", sortOrder: 5 },
];

async function main() {
  console.log("🌱 シードデータの投入を開始します...");

  // ─────────────────────────────────────────
  // 1. テストユーザーの作成
  // ─────────────────────────────────────────
  console.log("👤 ユーザーを作成中...");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "管理者 太郎",
      email: "admin@example.com",
      passwordHash: hashPassword("Admin1234!"),
      role: "admin",
      isActive: true,
    },
  });

  const pmoUser = await prisma.user.upsert({
    where: { email: "pmo@example.com" },
    update: {},
    create: {
      name: "PMO 花子",
      email: "pmo@example.com",
      passwordHash: hashPassword("Pmo12345!"),
      role: "pmo",
      isActive: true,
    },
  });

  const pmUser = await prisma.user.upsert({
    where: { email: "pm@example.com" },
    update: {},
    create: {
      name: "PM 次郎",
      email: "pm@example.com",
      passwordHash: hashPassword("Pm123456!"),
      role: "pm",
      isActive: true,
    },
  });

  const devUser = await prisma.user.upsert({
    where: { email: "developer@example.com" },
    update: {},
    create: {
      name: "開発者 三郎",
      email: "developer@example.com",
      passwordHash: hashPassword("Dev12345!"),
      role: "developer",
      isActive: true,
    },
  });

  console.log(`  ✓ admin: ${adminUser.email}`);
  console.log(`  ✓ pmo: ${pmoUser.email}`);
  console.log(`  ✓ pm: ${pmUser.email}`);
  console.log(`  ✓ developer: ${devUser.email}`);

  // ─────────────────────────────────────────
  // 2. テストプロジェクトの作成
  // ─────────────────────────────────────────
  console.log("📁 プロジェクトを作成中...");

  const project = await prisma.project.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      name: "サンプルプロジェクト",
      description: "開発・テスト用のサンプルプロジェクトです。",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      status: "active",
      bugSequence: 0,
      createdBy: adminUser.id,
    },
  });

  console.log(`  ✓ project: ${project.name} (id: ${project.id})`);

  // ─────────────────────────────────────────
  // 3. プロジェクトメンバー設定
  // ─────────────────────────────────────────
  console.log("👥 プロジェクトメンバーを設定中...");

  const memberUsers = [
    { user: pmUser, isFavorite: true },
    { user: pmoUser, isFavorite: false },
    { user: devUser, isFavorite: false },
  ];

  for (const { user, isFavorite } of memberUsers) {
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        projectId: project.id,
        userId: user.id,
        isFavorite,
      },
    });
    console.log(`  ✓ member: ${user.name} (favorite: ${isFavorite})`);
  }

  // ─────────────────────────────────────────
  // 4. 指摘区分マスタの初期データ投入
  // ─────────────────────────────────────────
  console.log("🏷️  指摘区分マスタを作成中...");

  for (const category of DEFAULT_REVIEW_CATEGORIES) {
    await prisma.reviewCategory.upsert({
      where: {
        projectId_name: {
          projectId: project.id,
          name: category.name,
        },
      },
      update: {},
      create: {
        projectId: project.id,
        name: category.name,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });
    console.log(`  ✓ category: ${category.name}`);
  }

  console.log("\n✅ シードデータの投入が完了しました！");
  console.log("\n📋 テストアカウント一覧:");
  console.log("  admin@example.com    / Admin1234!  (管理者)");
  console.log("  pmo@example.com      / Pmo12345!   (PMO)");
  console.log("  pm@example.com       / Pm123456!   (PM)");
  console.log("  developer@example.com / Dev12345!  (開発者)");
}

main()
  .catch((e) => {
    console.error("❌ シードエラー:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
