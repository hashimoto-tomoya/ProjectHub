# ProjectHub 実装タスク一覧

## TDD サイクルについて

このプロジェクトでは **RED → GREEN** のサイクルで開発を進める。

- **[RED]** テスト作成: 期待する入出力に基づきテストを先に書き、失敗を確認する
- **[GREEN]** 実装: テストをパスさせる最小限の実装を行う
- 単体テスト（Vitest）は各機能タスク内に組み込み済み
- 結合テスト（T14-B）・E2Eテスト（T14-C）は各機能完成後に順次実施

---

## 依存関係マップ

```
T01（初期セットアップ）
  ├── T02（Docker環境） ──────────────────────────┐
  └── T03（DBスキーマ）                           │
        └── T04（共通基盤） ← T05（共通UI）        │
              └── T06（認証）                      │
                    ├── T07（プロジェクト管理）      │
                    │     ├── T08（WBS・タスク）      │
                    │     │     └── T09（日報）       │
                    │     ├── T10（レビュー記録票）   │
                    │     └── T11（障害管理）         │
                    │           └── T12（レポート・分析）
                    └── T13（ユーザー管理）          │
                                                   └── T14（結合・E2Eテスト）
```

### 並列作業が可能なグループ

| グループ | タスク | 前提条件 |
|---------|--------|---------|-
| G1 | T02, T03 | T01 完了後 |
| G2 | T04, T05 | T01, T03 完了後 |
| G3 | T07, T13 | T06 完了後 |
| G4 | T08, T10, T11 | T07 完了後 |
| G5 | T09 | T08 完了後 |
| G6 | T12 | T09, T10, T11 完了後 |
| G7 | T14 | 各機能実装後に順次 |

---

## T01: プロジェクト初期セットアップ `TECH_API-12`

> **概要**: Next.js プロジェクト作成・開発環境構築・コーディング規約設定 / **依存**: なし

- [x] T01-1: Next.js 14 (App Router) + TypeScript プロジェクト作成
- [x] T01-2: 依存パッケージインストール（shadcn/ui, Tailwind CSS, TanStack Query v5, NextAuth.js v5, Prisma v5, Zod, Recharts）
- [x] T01-3: `.gitattributes`（LF統一）, `.env.example`, `.gitignore` 設定
- [x] T01-4: ESLint + Prettier 設定（Next.js 標準ルール）
- [x] T01-5: Vitest + Testing Library + MSW + Playwright テスト環境設定
- [x] T01-6: `package.json` npm スクリプト定義（`test`, `test:int`, `test:e2e`, `test:cov`, `lint`, `type-check`）

---

## T02: Docker環境構築 `TECH_API-13`

> **概要**: コンテナ構成・nginx設定・CI/CDパイプライン構築 / **依存**: T01 / **並列**: T03 と同時進行可能

- [x] T02-1: `Dockerfile` 作成（Node.js 20-alpine, Next.js ビルド）
- [x] T02-2: `docker-compose.yml` 作成（nginx, app, db コンテナ・ヘルスチェック）
- [x] T02-3: `docker-compose.test.yml` 作成（テスト用 PostgreSQL コンテナ分離）
- [x] T02-4: nginx 設定（`nginx/nginx.conf`）: HTTPS終端・HTTP→HTTPSリダイレクト・IP制限・リバースプロキシ
- [x] T02-5: TLS 自己署名証明書生成手順整備・`nginx-certs` ボリューム設定
- [x] T02-6: GitHub Actions CI ワークフロー作成（`.github/workflows/ci.yml`）: lint, type-check, unit test, npm audit
- [x] T02-7: Claude Code Review ワークフロー作成（`.github/workflows/claude-review.yml`）
- [x] T02-8: `/api/health` エンドポイント実装（`{ status: "ok", timestamp }` を返す）

---

## T03: データベース設計・Prisma スキーマ `TECH_API-14`

> **概要**: Prisma スキーマ定義・マイグレーション・シードデータ / **依存**: T01 / **並列**: T02 と同時進行可能

- [x] T03-1: `prisma/schema.prisma` 定義（全10テーブル: users, projects, project_members, tasks, daily_reports, daily_report_entries, review_sessions, review_categories, review_items, bugs）
- [x] T03-2: `project_members` テーブルに `is_favorite BOOLEAN DEFAULT false` カラム追加（API設計書の追記事項対応）
- [x] T03-3: `audit_logs` テーブル定義追加（操作ログ: id, timestamp, user_id, action, resource_type, resource_id, detail）
- [x] T03-4: インデックス定義（各テーブルの外部キー・検索用・集計用インデックス）
- [x] T03-5: 初回マイグレーション実行（`prisma migrate dev`）
- [x] T03-6: シードデータ作成（`prisma/seed.ts`）: テストユーザー・テストプロジェクト・指摘区分マスタ
- [x] T03-7: テスト用フィクスチャデータ作成（`tests/fixtures/`）: 各テストケース用データ

---

## T04: 共通基盤実装 `TECH_API-15`

> **概要**: 認証基盤・Prisma Client・型定義・ユーティリティ・ミドルウェア / **依存**: T01, T03 / **並列**: T05 と一部並列可能

- [ ] T04-1: `lib/prisma/client.ts` 実装（Prisma Client シングルトン・開発環境 hot reload 対策）
- [ ] T04-2: `lib/types/domain.ts` 定義（Role, ProjectStatus, TaskStatus, ReviewItemStatus, BugStatus, Severity, DashboardData, EvmDataPoint 等）
- [ ] T04-3: `lib/types/api.ts` 定義（各 API リクエスト/レスポンス型）
- [ ] T04-4: **[RED]** `tests/unit/utils/password.test.ts` 作成（TC-UT-016: ハッシュ化・検証・ポリシー違反テスト・失敗確認）
- [ ] T04-5: **[GREEN]** `lib/utils/password.ts` 実装（bcrypt ハッシュ化・検証, コストファクター12）
- [ ] T04-6: **[RED]** `tests/unit/utils/validation.test.ts` 作成（Zod スキーマ: パスワードポリシー・日付・各エンティティバリデーションテスト・失敗確認）
- [ ] T04-7: **[GREEN]** `lib/utils/validation.ts` 実装（Zod スキーマ共通定義）
- [ ] T04-8: **[RED]** `tests/unit/utils/error.test.ts` 作成（TC-UT-017〜020: カスタムエラークラス・`handleApiError` テスト・失敗確認）
- [ ] T04-9: **[GREEN]** `lib/utils/error.ts` 実装（カスタムエラークラス・`handleApiError` 共通エラーハンドラ）
- [ ] T04-10: NextAuth.js 設定（`app/api/auth/[...nextauth]/route.ts`）: Credentials Provider, セッション管理, `mustChangePassword` フラグ
- [ ] T04-11: `lib/auth/session.ts` 実装（`requireAuth`, `requireRole`, `requireProjectMember` ヘルパー）
- [ ] T04-12: `app/middleware.ts` 実装（ルートガード: 未認証リダイレクト・管理者チェック・パスワード変更強制）

---

## T05: 共通UIコンポーネント実装 `TECH_API-16`

> **概要**: レイアウト・汎用UIコンポーネント実装 / **依存**: T01-2（shadcn/ui インストール済み）/ **並列**: T04 と並列実装可能

- [ ] T05-1: `app/(auth)/layout.tsx` (AuthLayout): ログイン画面用センタリングレイアウト
- [ ] T05-2: `app/(main)/layout.tsx` (AppLayout): 共通レイアウト（ヘッダー+サイドバー+メインコンテンツ）
- [ ] T05-3: `app/admin/layout.tsx` (AdminGuardLayout): 管理者ロール制限レイアウト
- [ ] T05-4: `components/features/app-sidebar.tsx` (AppSidebar): サイドバーナビゲーション（ロール別表示制御）
- [ ] T05-5: `components/features/global-project-selector.tsx` (GlobalProjectSelector): プロジェクト切り替えドロップダウン
- [ ] T05-6: `components/features/user-menu.tsx` (UserMenu): ユーザーメニュー（パスワード変更・ログアウト）
- [ ] T05-7: `components/ui/status-badge.tsx` (StatusBadge): ステータスカラーバッジ（タスク・指摘・障害）
- [ ] T05-8: `components/ui/severity-badge.tsx` (SeverityBadge): 重要度カラーバッジ
- [ ] T05-9: `components/ui/slide-over.tsx` (SlideOver): 右寄せドロワー汎用コンポーネント（shadcn/ui Sheet 利用）
- [ ] T05-10: `components/ui/confirm-dialog.tsx` (ConfirmDialog): 確認ダイアログ
- [ ] T05-11: `components/ui/data-table.tsx` (DataTable): 汎用データテーブル（ソート・ページネーション）
- [ ] T05-12: `components/ui/date-range-picker.tsx` (DateRangePicker): 期間選択ピッカー
- [ ] T05-13: `components/ui/loading-spinner.tsx` (LoadingSpinner): ローディングスピナー

---

## T06: 認証機能実装 `TECH_API-17`

> **概要**: ログイン画面・パスワード管理・AuthService / **依存**: T04, T05

- [ ] T06-1: **[RED]** `tests/unit/services/auth.service.test.ts` 作成（パスワード変更・初回ログイン検証・パスワード履歴3世代チェックテスト・失敗確認）
- [ ] T06-2: **[GREEN]** UserRepository 実装（`lib/repositories/user.repository.ts`）: findByEmail, findById, create, update（論理削除対応）
- [ ] T06-3: **[GREEN]** AuthService 実装（`lib/services/auth.service.ts`）: パスワード変更・初回ログイン検証・パスワード履歴3世代管理（T06-1テストをパス）
- [ ] T06-4: ログイン画面（`app/(auth)/login/page.tsx`）: メールアドレス・パスワード入力・エラー表示
- [ ] T06-5: パスワード変更画面（`app/(main)/users/me/change-password/page.tsx`）: 現パスワード確認・新パスワード入力
- [ ] T06-6: パスワード変更 API 実装（`PUT /api/users/me/password`）: バリデーション・現パスワード確認・ハッシュ更新

---

## T07: プロジェクト管理機能実装 `TECH_API-18`

> **概要**: プロジェクトCRUD・メンバー管理・お気に入り / **依存**: T04, T05, T06 / **並列**: T13 と同時進行可能

- [ ] T07-1: **[RED]** `tests/unit/services/project.service.test.ts` 作成（お気に入り管理・メンバー管理・指摘区分自動生成テスト・失敗確認）
- [ ] T07-2: **[GREEN]** ProjectRepository 実装（`lib/repositories/project.repository.ts`）: CRUD・メンバー管理・お気に入りフラグ
- [ ] T07-3: **[GREEN]** ProjectService 実装（`lib/services/project.service.ts`）: プロジェクトCRUD・お気に入り管理・メンバー管理・指摘区分自動生成（T07-1テストをパス）
- [ ] T07-4: プロジェクト一覧 API（`GET/POST /api/projects`）: ロール別フィルタ・ステータスフィルタ
- [ ] T07-5: プロジェクト詳細・更新 API（`GET/PUT /api/projects/[id]`）
- [ ] T07-6: お気に入り API（`PUT /api/projects/[id]/favorite`）
- [ ] T07-7: メンバー管理 API（`GET/POST /api/projects/[id]/members`, `DELETE /api/projects/[id]/members/[userId]`）
- [ ] T07-8: `components/features/project-list-table.tsx` (ProjectListTable): 検索・フィルタ・お気に入りトグル・楽観的更新
- [ ] T07-9: プロジェクト一覧画面（`app/(main)/projects/page.tsx`）: TanStack Query キャッシュ設定（staleTime: 30秒）
- [ ] T07-10: `components/features/project-management-table.tsx` (ProjectManagementTable): 管理者用テーブル・アーカイブ操作
- [ ] T07-11: プロジェクト管理画面（`app/admin/projects/page.tsx`）: 登録・編集・アーカイブ

---

## T08: WBS・タスク管理機能実装 `TECH_API-19`

> **概要**: タスクCRUD・ガントチャート・実績工数集計 / **依存**: T04, T05, T06, T07 / **並列**: T10, T11 と同時進行可能

- [ ] T08-1: **[RED]** `tests/unit/services/task.service.test.ts` 作成（TC-UT-001〜005: 階層3レベル超過エラー・日付バリデーション・D&D期間更新テスト・失敗確認）
- [ ] T08-2: **[GREEN]** TaskRepository 実装（`lib/repositories/task.repository.ts`）: findByProjectWithActualHours（JOIN集計）・CRUD・findChildren
- [ ] T08-3: **[GREEN]** TaskService 実装（`lib/services/task.service.ts`）: 階層3レベル制限チェック・日付バリデーション・CRUD（T08-1テストをパス）
- [ ] T08-4: タスク一覧 API（`GET /api/projects/[id]/tasks`）: 実績工数付き全タスク取得（ページネーションなし）
- [ ] T08-5: タスク登録 API（`POST /api/projects/[id]/tasks`）: 階層制限・バリデーション
- [ ] T08-6: タスク更新 API（`PUT /api/projects/[id]/tasks/[taskId]`）: ガントチャートD&D対応
- [ ] T08-7: タスク削除 API（`DELETE /api/projects/[id]/tasks/[taskId]`）: 日報明細紐付きチェック
- [ ] T08-8: `components/features/task-slide-over.tsx` (TaskSlideOver): タスク登録/編集フォーム
- [ ] T08-9: `components/features/wbs-tree-table.tsx` (WbsTreeTable): 階層ツリーテーブル・折りたたみ・予実工数表示
- [ ] T08-10: `components/features/gantt-chart.tsx` (GanttChart): 日/週/月切替・D&Dによる期間変更・楽観的更新
- [ ] T08-11: WBS 画面（`app/(main)/projects/[id]/wbs/page.tsx`）: WBSビュー/ガントチャート切替

---

## T09: 日報・実績入力機能実装 `TECH_API-20`

> **概要**: 日報CRUD・カレンダービュー・WBS実績工数自動反映 / **依存**: T04, T05, T06, T07, T08

- [ ] T09-1: **[RED]** `tests/unit/services/daily-report.service.test.ts` 作成（TC-UT-006〜009: 日報登録・将来日付エラー・同日重複エラー・作業時間0バリデーションテスト・失敗確認）
- [ ] T09-2: **[GREEN]** DailyReportRepository 実装（`lib/repositories/daily-report.repository.ts`）: ヘッダー・明細の CRUD・期間検索
- [ ] T09-3: **[GREEN]** DailyReportService 実装（`lib/services/daily-report.service.ts`）: 日報登録（同一TX・ヘッダー+明細）・将来日チェック・重複チェック（T09-1テストをパス）
- [ ] T09-4: 日報一覧 API（`GET /api/projects/[id]/daily-reports`）: userId・期間フィルタ・カレンダービュー兼用
- [ ] T09-5: 日報登録 API（`POST /api/projects/[id]/daily-reports`）: 複数タスク明細・将来日・作業時間バリデーション
- [ ] T09-6: 日報更新 API（`PUT /api/projects/[id]/daily-reports/[reportId]`）: 明細差分更新（削除→再作成）
- [ ] T09-7: `components/features/daily-report-calendar.tsx` (DailyReportCalendar): 月次カレンダー・入力済み(✓)・未入力警告(⚠)
- [ ] T09-8: `components/features/daily-report-list.tsx` (DailyReportList): リストビュー・期間フィルタ・テーブル
- [ ] T09-9: `components/features/daily-report-slide-over.tsx` (DailyReportSlideOver): 複数タスク行追加対応フォーム
- [ ] T09-10: 日報画面（`app/(main)/projects/[id]/daily-reports/page.tsx`）: カレンダー/リスト切替

---

## T10: レビュー記録票管理機能実装 `TECH_API-21`

> **概要**: レビューセッション・指摘事項のCRUD・ステータス遷移 / **依存**: T04, T05, T06, T07 / **並列**: T08, T11 と同時進行可能

- [ ] T10-1: **[RED]** `tests/unit/services/review.service.test.ts` 作成（TC-UT-014〜015: 差し戻し遷移・不正ステータス遷移エラーテスト・失敗確認）
- [ ] T10-2: **[GREEN]** ReviewRepository 実装（`lib/repositories/review.repository.ts`）: セッション・指摘・区分のCRUD・ステータスフィルタ
- [ ] T10-3: **[GREEN]** ReviewService 実装（`lib/services/review.service.ts`）: セッション・指摘CRUD・ステータス遷移検証（未対応→修正中→確認待ち→完了、差し戻し対応）（T10-1テストをパス）
- [ ] T10-4: レビューセッション一覧 API（`GET/POST /api/projects/[id]/review-sessions`）
- [ ] T10-5: 指摘一覧 API（`GET/POST /api/projects/[id]/review-items`）: ステータス・区分・担当者フィルタ
- [ ] T10-6: 指摘更新 API（`PUT /api/projects/[id]/review-items/[itemId]`）: インラインステータス変更・楽観的更新対応
- [ ] T10-7: 指摘区分一覧 API（`GET /api/projects/[id]/review-categories`）
- [ ] T10-8: `components/features/review-session-list.tsx` (ReviewSessionList): セッション一覧・指摘数・未対応数表示
- [ ] T10-9: `components/features/review-item-list.tsx` (ReviewItemList): 指摘一覧・インラインステータス変更
- [ ] T10-10: レビュー記録票画面（`app/(main)/projects/[id]/reviews/page.tsx`）: セッション一覧/指摘一覧タブ切替

---

## T11: 障害管理票機能実装 `TECH_API-22`

> **概要**: 障害CRUD・自動採番・ステータス遷移 / **依存**: T04, T05, T06, T07 / **並列**: T08, T10 と同時進行可能

- [ ] T11-1: **[RED]** `tests/unit/services/bug.service.test.ts` 作成（TC-UT-010〜013: BUG-001採番・連番インクリメント・不正ステータス遷移エラーテスト・失敗確認）
- [ ] T11-2: **[GREEN]** BugRepository 実装（`lib/repositories/bug.repository.ts`）: findByProjectWithFilters・CRUD・incrementBugSequence（SELECT FOR UPDATE）
- [ ] T11-3: **[GREEN]** BugService 実装（`lib/services/bug.service.ts`）: 障害CRUD・BUG-XXX採番（排他制御）・ステータス遷移検証（未対応→調査中→修正中→確認待ち→クローズ）（T11-1テストをパス）
- [ ] T11-4: 障害一覧 API（`GET /api/projects/[id]/bugs`）: 重要度・ステータス・キーワードフィルタ
- [ ] T11-5: 障害登録 API（`POST /api/projects/[id]/bugs`）: 自動採番・バリデーション
- [ ] T11-6: 障害詳細 API（`GET /api/projects/[id]/bugs/[bugId]`）
- [ ] T11-7: 障害更新 API（`PUT /api/projects/[id]/bugs/[bugId]`）: ステータス遷移チェック
- [ ] T11-8: `components/features/bug-list.tsx` (BugList): 障害一覧テーブル・重要度・ステータスフィルタ・検索
- [ ] T11-9: `components/features/bug-slide-over.tsx` (BugSlideOver): 登録/詳細/編集フォーム・WBSタスク紐付け
- [ ] T11-10: 障害管理画面（`app/(main)/projects/[id]/bugs/page.tsx`）

---

## T12: レポート・分析機能実装 `TECH_API-23`

> **概要**: ダッシュボード・EVM・信頼性成長曲線・指摘区分分析・障害密度分析 / **依存**: T04, T05, T06, T07, T08, T09, T10, T11

- [ ] T12-1: ReportService 実装（`lib/services/report.service.ts`）: getDashboard（並列クエリ）・getEvmData・getReliabilityGrowth・getReviewCategoryStats・getBugDensity
- [ ] T12-2: ダッシュボード集計 API（`GET /api/projects/[id]/dashboard`）: SPI/CPI・タスク完了率・障害数・指摘数・日報フラグ
- [ ] T12-3: EVM 分析 API（`GET /api/projects/[id]/reports/evm`）: 日次累積 PV/AC/EV・SPI/CPI/残工数
- [ ] T12-4: 信頼性成長曲線 API（`GET /api/projects/[id]/reports/reliability-growth`）: 累積バグ発見数・修正完了数
- [ ] T12-5: 指摘区分分析 API（`GET /api/projects/[id]/reports/review-categories`）: 区分別件数・割合
- [ ] T12-6: 障害密度分析 API（`GET /api/projects/[id]/reports/bug-density`）: 担当者別・WBSモジュール別件数
- [ ] T12-7: `components/features/daily-report-alert.tsx` (DailyReportAlert): 日報未入力警告バナー（平日判定）
- [ ] T12-8: `components/features/dashboard-summary-cards.tsx` (DashboardSummaryCards): SPI/CPI・障害数・指摘数・タスク完了率カード
- [ ] T12-9: ダッシュボード画面（`app/(main)/projects/[id]/dashboard/page.tsx`）: TanStack Query（staleTime: 60秒）
- [ ] T12-10: `components/features/evm-chart.tsx` (EvmChart): EVM折れ線グラフ（Recharts）・派生指標表示
- [ ] T12-11: `components/features/reliability-growth-chart.tsx` (ReliabilityGrowthChart): 累積バグ発見/修正完了 2系列折れ線グラフ
- [ ] T12-12: `components/features/review-category-pie-chart.tsx` (ReviewCategoryPieChart): 指摘区分円グラフ＋件数テーブル
- [ ] T12-13: `components/features/bug-density-bar-chart.tsx` (BugDensityBarChart): 担当者別・モジュール別障害密度棒グラフ
- [ ] T12-14: レポート・分析画面（`app/(main)/projects/[id]/reports/page.tsx`）: 4タブ切替・期間フィルタ

---

## T13: ユーザー管理機能実装 `TECH_API-24`

> **概要**: 管理者によるユーザーCRUD・ロール管理・パスワードリセット / **依存**: T04, T05, T06 / **並列**: T07 と同時進行可能

- [ ] T13-1: **[RED]** `tests/unit/services/admin.service.test.ts` 作成（ユーザー登録・論理削除・パスワードリセット（mustChangePassword フラグ設定）・メール重複エラーテスト・失敗確認）
- [ ] T13-2: **[GREEN]** AdminService 実装（`lib/services/admin.service.ts`）: ユーザー登録・更新（論理削除）・パスワードリセット・ロール管理（T13-1テストをパス）
- [ ] T13-3: ユーザー一覧 API（`GET /api/admin/users`）: 有効/無効フィルタ
- [ ] T13-4: ユーザー登録 API（`POST /api/admin/users`）: 初期パスワード設定・メール重複チェック
- [ ] T13-5: ユーザー更新 API（`PUT /api/admin/users/[id]`）: 氏名・ロール・有効/無効（論理削除）
- [ ] T13-6: パスワードリセット API（`POST /api/admin/users/[id]/reset-password`）: 強制パスワード変更フラグ設定
- [ ] T13-7: `components/features/user-management-table.tsx` (UserManagementTable): ユーザー一覧・有効/無効フィルタ・編集ボタン
- [ ] T13-8: ユーザー管理画面（`app/admin/users/page.tsx`）: 登録・編集ダイアログ・パスワードリセット

---

## T14: 結合テスト・E2Eテスト `TECH_API-25`

> **概要**: 結合テスト・E2Eテスト / **依存**: T04〜T13（各機能実装後に順次並列実行可能）
>
> ※ 単体テスト（Vitest）は各機能タスク（T04〜T13）の `[RED]` / `[GREEN]` ステップに統合済み

### T14-B: 結合テスト（Vitest + テスト DB）

- [ ] T14-B1: 認証・認可 結合テスト（TC-IT-001〜005）: ログイン・誤パスワード・未認証・権限不足
- [ ] T14-B2: プロジェクト・WBS 結合テスト（TC-IT-006〜010）: プロジェクト一覧・タスク登録・権限・階層制限・実績工数
- [ ] T14-B3: 日報 結合テスト（TC-IT-011〜014）: 日報登録・重複・PMO権限・カレンダーデータ取得
- [ ] T14-B4: 障害・レビュー 結合テスト（TC-IT-015〜017）: 採番・不正遷移・差し戻し
- [ ] T14-B5: レポート 結合テスト（TC-IT-018〜019）: EVMデータ・ダッシュボード集計

### T14-C: E2Eテスト（Playwright）

- [ ] T14-C1: TC-E2E-001: ログイン → ダッシュボード表示シナリオ
- [ ] T14-C2: TC-E2E-002: WBSタスク登録 → 一覧確認シナリオ
- [ ] T14-C3: TC-E2E-003: 日報入力 → WBS実績工数自動反映確認シナリオ
- [ ] T14-C4: TC-E2E-004: 障害登録 → ステータス更新フローシナリオ
- [ ] T14-C5: TC-E2E-005: レポート画面（EVM グラフ）表示シナリオ
