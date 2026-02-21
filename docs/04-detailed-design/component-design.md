# コンポーネント設計

## フロントエンド コンポーネント設計

### コンポーネント分類

本プロジェクトでは Next.js App Router を使用し、コンポーネントを以下の4種別に分類する。

| 種別 | 責務 | 状態保持 |
|------|------|---------|
| Layout | 画面レイアウト構造を定義 | 最小限 |
| Page | ルーティング単位のトップレベルコンポーネント。データ取得・レイアウト構成を担う | あり |
| Feature | 業務機能を実現する複合コンポーネント。API呼び出し・ローカル状態を持つ | あり |
| UI | 再利用可能なプレゼンテーションコンポーネント。Props のみで制御 | なし |

### コンポーネント一覧

#### レイアウトコンポーネント

| ID | コンポーネント名 | ファイルパス | 責務 |
|----|----------------|------------|------|
| CMP-LAYOUT-001 | AuthLayout | `app/(auth)/layout.tsx` | ログイン画面用レイアウト（センタリング・ブランドロゴ） |
| CMP-LAYOUT-002 | AppLayout | `app/(main)/layout.tsx` | 認証済み共通レイアウト（ヘッダー＋サイドバー＋メインコンテンツ） |
| CMP-LAYOUT-003 | AdminGuardLayout | `app/(main)/admin/layout.tsx` | 管理者ロール制限レイアウト（admin 以外は 403 リダイレクト） |

#### ページコンポーネント

| ID | コンポーネント名 | ファイルパス | 対応画面 |
|----|----------------|------------|---------|
| CMP-PAGE-001 | LoginPage | `app/(auth)/login/page.tsx` | SCR-C-001 |
| CMP-PAGE-002 | ProjectListPage | `app/(main)/projects/page.tsx` | SCR-C-002 |
| CMP-PAGE-003 | DashboardPage | `app/(main)/projects/[id]/dashboard/page.tsx` | SCR-C-003 |
| CMP-PAGE-004 | WbsPage | `app/(main)/projects/[id]/wbs/page.tsx` | SCR-C-004 |
| CMP-PAGE-005 | DailyReportPage | `app/(main)/projects/[id]/daily-reports/page.tsx` | SCR-C-005 |
| CMP-PAGE-006 | ReviewPage | `app/(main)/projects/[id]/reviews/page.tsx` | SCR-C-006 |
| CMP-PAGE-007 | BugPage | `app/(main)/projects/[id]/bugs/page.tsx` | SCR-C-007 |
| CMP-PAGE-008 | ReportPage | `app/(main)/projects/[id]/reports/page.tsx` | SCR-C-008 |
| CMP-PAGE-009 | UserManagementPage | `app/(main)/admin/users/page.tsx` | SCR-A-001 |
| CMP-PAGE-010 | ProjectManagementPage | `app/(main)/admin/projects/page.tsx` | SCR-A-002 |

#### フィーチャーコンポーネント

| ID | コンポーネント名 | ファイルパス | 責務 | 対応画面 |
|----|----------------|------------|------|---------|
| CMP-FTR-001 | AppSidebar | `components/features/app-sidebar.tsx` | サイドバーナビゲーション。ロールに応じた項目の表示/非表示制御 | 全画面（共通） |
| CMP-FTR-002 | GlobalProjectSelector | `components/features/global-project-selector.tsx` | ヘッダーのプロジェクト切り替えドロップダウン。お気に入りプロジェクト一覧を表示 | 全画面（共通） |
| CMP-FTR-003 | UserMenu | `components/features/user-menu.tsx` | ヘッダー右上のユーザーメニュー（プロフィール・パスワード変更・ログアウト） | 全画面（共通） |
| CMP-FTR-004 | ProjectListTable | `components/features/project-list-table.tsx` | プロジェクト一覧テーブル。検索・フィルタ・お気に入りトグル | SCR-C-002 |
| CMP-FTR-005 | DashboardSummaryCards | `components/features/dashboard-summary-cards.tsx` | SPI/CPI・障害数・指摘数・タスク完了率のサマリーカード群 | SCR-C-003 |
| CMP-FTR-006 | DailyReportAlert | `components/features/daily-report-alert.tsx` | 日報未入力警告バナー（平日当日の日報が未登録の場合に表示） | SCR-C-003 |
| CMP-FTR-007 | WbsTreeTable | `components/features/wbs-tree-table.tsx` | WBS階層ツリーテーブル。タスク名・担当・ステータス・予実工数・残余を表示。折りたたみ対応 | SCR-C-004 |
| CMP-FTR-008 | GanttChart | `components/features/gantt-chart.tsx` | ガントチャート。日/週/月切替、D&Dによる期間変更（API-C-012 呼び出し） | SCR-C-004 |
| CMP-FTR-009 | TaskSlideOver | `components/features/task-slide-over.tsx` | タスク登録/編集スライドオーバーフォーム | SCR-C-004 |
| CMP-FTR-010 | DailyReportCalendar | `components/features/daily-report-calendar.tsx` | 月次カレンダービュー。入力済み(✓)・未入力警告(⚠)の表示 | SCR-C-005 |
| CMP-FTR-011 | DailyReportList | `components/features/daily-report-list.tsx` | 日報リストビュー。期間フィルタ・一覧テーブル | SCR-C-005 |
| CMP-FTR-012 | DailyReportSlideOver | `components/features/daily-report-slide-over.tsx` | 日報入力フォーム（複数タスク行追加対応） | SCR-C-005 |
| CMP-FTR-013 | ReviewSessionList | `components/features/review-session-list.tsx` | レビューセッション一覧テーブル。指摘数・未対応数を表示 | SCR-C-006 |
| CMP-FTR-014 | ReviewItemList | `components/features/review-item-list.tsx` | 指摘一覧テーブル。インラインステータス変更対応 | SCR-C-006 |
| CMP-FTR-015 | BugList | `components/features/bug-list.tsx` | 障害一覧テーブル。重要度・ステータスでフィルタ・検索対応 | SCR-C-007 |
| CMP-FTR-016 | BugSlideOver | `components/features/bug-slide-over.tsx` | 障害詳細/登録/編集フォーム | SCR-C-007 |
| CMP-FTR-017 | EvmChart | `components/features/evm-chart.tsx` | EVM折れ線グラフ（PV/AC/EV）＋派生指標（SPI/CPI/残工数） | SCR-C-008 |
| CMP-FTR-018 | ReliabilityGrowthChart | `components/features/reliability-growth-chart.tsx` | 信頼性成長曲線（累積バグ発見数/修正完了数） | SCR-C-008 |
| CMP-FTR-019 | ReviewCategoryPieChart | `components/features/review-category-pie-chart.tsx` | 指摘区分円グラフ＋件数テーブル | SCR-C-008 |
| CMP-FTR-020 | BugDensityBarChart | `components/features/bug-density-bar-chart.tsx` | 障害密度棒グラフ（担当者別・WBSモジュール別） | SCR-C-008 |
| CMP-FTR-021 | UserManagementTable | `components/features/user-management-table.tsx` | ユーザー一覧テーブル。有効/無効フィルタ・編集ボタン | SCR-A-001 |
| CMP-FTR-022 | ProjectManagementTable | `components/features/project-management-table.tsx` | プロジェクト一覧テーブル（管理者用）。アーカイブ操作 | SCR-A-002 |

#### 共通UIコンポーネント

shadcn/ui をベースに、プロジェクト固有の UI コンポーネントを追加定義する。

| ID | コンポーネント名 | ファイルパス | 責務 | 主要 Props |
|----|----------------|------------|------|-----------|
| CMP-UI-001 | StatusBadge | `components/ui/status-badge.tsx` | ステータスをカラーバッジで表示 | `status: TaskStatus \| ReviewItemStatus \| BugStatus`, `variant?: 'default' \| 'outline'` |
| CMP-UI-002 | SeverityBadge | `components/ui/severity-badge.tsx` | 重要度（致命的/高/中/低）をカラーバッジで表示 | `severity: Severity` |
| CMP-UI-003 | SlideOver | `components/ui/slide-over.tsx` | 右寄せスライドオーバー汎用コンポーネント | `open: boolean`, `onClose: () => void`, `title: string`, `children: ReactNode` |
| CMP-UI-004 | ConfirmDialog | `components/ui/confirm-dialog.tsx` | 確認ダイアログ（削除・アーカイブ等の破壊的操作前に使用） | `open: boolean`, `title: string`, `description: string`, `onConfirm: () => void`, `onCancel: () => void` |
| CMP-UI-005 | DataTable | `components/ui/data-table.tsx` | 汎用データテーブル（ソート・ページネーション付き） | `columns: ColumnDef[]`, `data: T[]`, `pagination?: boolean` |
| CMP-UI-006 | DateRangePicker | `components/ui/date-range-picker.tsx` | 期間選択ピッカー | `value: DateRange`, `onChange: (range: DateRange) => void` |
| CMP-UI-007 | LoadingSpinner | `components/ui/loading-spinner.tsx` | ローディングスピナー（TanStack Query のローディング状態に使用） | `size?: 'sm' \| 'md' \| 'lg'` |

---

### ルーティング（Next.js App Router）

#### ディレクトリ構成

```
app/
├── middleware.ts                          # セッションチェック・ルートガード
├── (auth)/
│   └── login/
│       └── page.tsx                       # SCR-C-001 ログイン
├── (main)/
│   ├── layout.tsx                         # AppLayout（共通レイアウト）
│   ├── projects/
│   │   ├── page.tsx                       # SCR-C-002 プロジェクト一覧
│   │   └── [id]/
│   │       ├── dashboard/page.tsx         # SCR-C-003 ダッシュボード
│   │       ├── wbs/page.tsx               # SCR-C-004 WBS・タスク管理
│   │       ├── daily-reports/page.tsx     # SCR-C-005 日報入力・管理
│   │       ├── reviews/page.tsx           # SCR-C-006 レビュー記録票
│   │       ├── bugs/page.tsx              # SCR-C-007 障害管理票
│   │       └── reports/page.tsx           # SCR-C-008 レポート・分析
│   └── admin/
│       ├── layout.tsx                     # AdminGuardLayout（管理者チェック）
│       ├── users/page.tsx                 # SCR-A-001 ユーザー管理
│       └── projects/page.tsx              # SCR-A-002 プロジェクト管理
└── api/
    ├── auth/[...nextauth]/route.ts        # NextAuth.js
    ├── users/me/password/route.ts
    ├── projects/
    │   ├── route.ts                       # GET, POST
    │   └── [id]/
    │       ├── route.ts                   # GET, PUT
    │       ├── favorite/route.ts          # PUT
    │       ├── members/
    │       │   ├── route.ts               # GET, POST
    │       │   └── [userId]/route.ts      # DELETE
    │       ├── tasks/
    │       │   ├── route.ts               # GET, POST
    │       │   └── [taskId]/route.ts      # PUT, DELETE
    │       ├── daily-reports/
    │       │   ├── route.ts               # GET, POST
    │       │   └── [reportId]/route.ts    # GET, PUT
    │       ├── review-sessions/route.ts   # GET, POST
    │       ├── review-items/
    │       │   ├── route.ts               # GET, POST
    │       │   └── [itemId]/route.ts      # PUT
    │       ├── review-categories/route.ts # GET
    │       ├── bugs/
    │       │   ├── route.ts               # GET, POST
    │       │   └── [bugId]/route.ts       # GET, PUT
    │       ├── dashboard/route.ts         # GET
    │       └── reports/
    │           ├── evm/route.ts
    │           ├── reliability-growth/route.ts
    │           ├── review-categories/route.ts
    │           └── bug-density/route.ts
    └── admin/
        └── users/
            ├── route.ts                   # GET, POST
            └── [id]/
                ├── route.ts               # PUT
                └── reset-password/route.ts # POST
```

#### ルート一覧

| パス | ページコンポーネント | 認証 | 必要ロール | 対応画面 |
|------|-------------------|------|---------|---------|
| `/login` | LoginPage | 不要 | — | SCR-C-001 |
| `/projects` | ProjectListPage | 要 | 全ロール | SCR-C-002 |
| `/projects/[id]/dashboard` | DashboardPage | 要 | 全ロール | SCR-C-003 |
| `/projects/[id]/wbs` | WbsPage | 要 | 全ロール | SCR-C-004 |
| `/projects/[id]/daily-reports` | DailyReportPage | 要 | 全ロール | SCR-C-005 |
| `/projects/[id]/reviews` | ReviewPage | 要 | 全ロール | SCR-C-006 |
| `/projects/[id]/bugs` | BugPage | 要 | 全ロール | SCR-C-007 |
| `/projects/[id]/reports` | ReportPage | 要 | 全ロール | SCR-C-008 |
| `/admin/users` | UserManagementPage | 要 | admin | SCR-A-001 |
| `/admin/projects` | ProjectManagementPage | 要 | admin / pm | SCR-A-002 |

#### ルートガード

`middleware.ts` で Next.js Edge Runtime によるルートガードを実装する。

```typescript
// middleware.ts の処理フロー
// 1. /api/* および /_next/* は対象外
// 2. セッションが存在しない場合 → /login へリダイレクト
// 3. /admin/* へのアクセスはセッションの role を確認
//    - /admin/users: admin のみ許可。それ以外は 403
//    - /admin/projects: admin / pm を許可。それ以外は 403
```

| 条件 | 挙動 |
|------|------|
| 未認証ユーザーが保護ルートにアクセス | `/login?callbackUrl=...` へリダイレクト |
| ログイン済みユーザーが `/login` にアクセス | `/projects` へリダイレクト |
| 権限不足（admin 以外が `/admin/users` に） | `/projects` へリダイレクト（または 403 ページ表示） |
| `mustChangePassword` フラグが true | `/users/me/change-password` 以外へのアクセスをブロック |

---

### 状態管理

#### 状態の分類と管理方針

| 種類 | スコープ | 管理手法 | 主な用途 |
|------|---------|---------|---------|
| サーバー状態 | グローバル | TanStack Query | API データ取得・キャッシュ管理 |
| 認証状態 | グローバル | NextAuth.js `useSession()` | ログインユーザー情報・ロール |
| ローカルUI状態 | コンポーネント | `useState` / `useReducer` | モーダル開閉・フォーム入力・ビュー切替 |
| URL状態 | グローバル | `useSearchParams` | フィルタ条件・タブ状態・ページ番号 |

!!! note "グローバル状態ライブラリ（Zustand 等）は採用しない"
    認証状態は NextAuth.js、サーバーデータは TanStack Query でそれぞれ管理する。追加のグローバル状態ライブラリは不要と判断する。

#### TanStack Query のキャッシュ方針

| クエリキー | `staleTime` | `gcTime` | 備考 |
|-----------|-------------|---------|------|
| `['projects']` | 30秒 | 5分 | プロジェクト一覧 |
| `['projects', id, 'tasks']` | 10秒 | 3分 | WBS（日報保存後に invalidate） |
| `['projects', id, 'dashboard']` | 60秒 | 5分 | ダッシュボード集計 |
| `['projects', id, 'daily-reports']` | 10秒 | 3分 | 日報一覧 |
| `['projects', id, 'bugs']` | 30秒 | 5分 | 障害一覧 |
| `['projects', id, 'reports', *]` | 60秒 | 10分 | レポートデータ |

**楽観的更新の適用範囲:**

- タスクステータス変更（ガントチャートのD&D）
- 指摘ステータスのインライン変更
- お気に入りトグル

**エラーリトライ方針:**

- 4xx エラー: リトライなし
- 5xx エラー: 最大2回リトライ（デフォルト動作）

---

### 共通コンポーネント設計（主要）

#### StatusBadge（CMP-UI-001）

ステータスに応じた色のバッジコンポーネント。

| ステータス種別 | 値と色 |
|-------------|------|
| TaskStatus | 未着手（グレー）/ 進行中（青）/ 完了（緑）/ 保留（黄） |
| ReviewItemStatus | 未対応（赤）/ 修正中（黄）/ 確認待ち（青）/ 完了（緑） |
| BugStatus | 未対応（赤）/ 調査中（橙）/ 修正中（黄）/ 確認待ち（青）/ クローズ（緑） |

#### SlideOver（CMP-UI-003）

右寄せドロワーの汎用コンポーネント。shadcn/ui の `Sheet` コンポーネントを利用。

```typescript
interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg'; // sm: 400px, md: 600px, lg: 800px
}
```

TaskSlideOver・DailyReportSlideOver・BugSlideOver は本コンポーネントを内包して実装する。

---

## バックエンド コンポーネント設計

### ディレクトリ構成

```
lib/
├── auth/
│   └── session.ts                # getServerSession のラッパー・ロール検証ヘルパー
├── services/
│   ├── auth.service.ts           # SVC-001
│   ├── project.service.ts        # SVC-002
│   ├── task.service.ts           # SVC-003
│   ├── daily-report.service.ts   # SVC-004
│   ├── review.service.ts         # SVC-005
│   ├── bug.service.ts            # SVC-006
│   ├── report.service.ts         # SVC-007
│   └── admin.service.ts          # SVC-008
├── repositories/
│   ├── user.repository.ts        # REP-001
│   ├── project.repository.ts     # REP-002
│   ├── task.repository.ts        # REP-003
│   ├── daily-report.repository.ts # REP-004
│   ├── review.repository.ts      # REP-005
│   └── bug.repository.ts         # REP-006
├── prisma/
│   └── client.ts                 # Prisma Client シングルトン
├── types/
│   ├── domain.ts                 # ドメイン型定義
│   └── api.ts                    # API リクエスト/レスポンス型
└── utils/
    ├── password.ts               # bcrypt ハッシュ・検証
    ├── error.ts                  # エラーレスポンス生成ヘルパー
    └── validation.ts             # Zod スキーマ共通定義
```

---

### ドメイン型定義

`lib/types/domain.ts` に TypeScript 型として定義する。Prisma が生成する型をベースに、アプリケーション固有の型を拡張する。

#### 主要型定義

```typescript
// ロール
type Role = 'admin' | 'pmo' | 'pm' | 'developer';

// プロジェクトステータス
type ProjectStatus = 'active' | 'archived';

// タスクステータス
type TaskStatus = '未着手' | '進行中' | '完了' | '保留';

// レビュー指摘ステータス
type ReviewItemStatus = '未対応' | '修正中' | '確認待ち' | '完了';

// 障害ステータス
type BugStatus = '未対応' | '調査中' | '修正中' | '確認待ち' | 'クローズ';

// 重要度（指摘・障害共通）
type Severity = '致命的' | '高' | '中' | '低';
```

#### 集計型（レポート用）

```typescript
// ダッシュボード集計データ
interface DashboardData {
  spi: number;
  cpi: number;
  taskCompletionRate: number;
  openBugsCount: number;
  openBugsBySeverity: Record<Severity, number>;
  openReviewItemsCount: number;
  hasDailyReportToday: boolean;
}

// EVM データポイント
interface EvmDataPoint {
  date: string;   // YYYY-MM-DD
  pv: number;     // 計画価値（累積予定工数）
  ac: number;     // 実コスト（累積実績工数）
  ev: number;     // 出来高（累積完了タスク予定工数）
}
```

---

### サービス層

#### サービス一覧

| ID | サービス名 | ファイル | 責務 | 対応API |
|----|-----------|---------|------|---------|
| SVC-001 | AuthService | `auth.service.ts` | パスワード変更・初回ログイン検証 | API-C-001 |
| SVC-002 | ProjectService | `project.service.ts` | プロジェクト CRUD・お気に入り管理・メンバー管理 | API-C-002〜009 |
| SVC-003 | TaskService | `task.service.ts` | WBS タスク CRUD・階層制限チェック | API-C-010〜013 |
| SVC-004 | DailyReportService | `daily-report.service.ts` | 日報登録・更新・一覧取得 | API-C-014〜017 |
| SVC-005 | ReviewService | `review.service.ts` | レビューセッション・指摘の CRUD・ステータス遷移検証 | API-C-018〜023 |
| SVC-006 | BugService | `bug.service.ts` | 障害 CRUD・番号採番・ステータス遷移検証 | API-C-024〜027 |
| SVC-007 | ReportService | `report.service.ts` | ダッシュボード・EVM・信頼性成長・分析データ集計 | API-C-028〜032 |
| SVC-008 | AdminService | `admin.service.ts` | ユーザー管理（管理者専用）・パスワードリセット | API-A-001〜004 |

#### 主要サービスの公開メソッド

**TaskService（SVC-003）**

| メソッド | 引数 | 戻り値 | トランザクション | 処理概要 |
|---------|------|--------|----------------|---------|
| `findByProject` | `projectId: number` | `TaskWithActualHours[]` | 不要 | タスク一覧＋日報集計で実績工数を付加 |
| `create` | `projectId, input: CreateTaskInput` | `Task` | 必要 | 階層3レベル超チェック後に登録 |
| `update` | `taskId, input: UpdateTaskInput` | `Task` | 必要 | 日付・階層のバリデーション後に更新 |
| `delete` | `taskId: number` | `void` | 必要 | 日報明細が紐付く場合は 422 エラー |

**DailyReportService（SVC-004）**

| メソッド | 引数 | 戻り値 | トランザクション | 処理概要 |
|---------|------|--------|----------------|---------|
| `create` | `projectId, userId, input: CreateDailyReportInput` | `DailyReport` | 必要 | `daily_reports` + `daily_report_entries` を同一 TX で保存 |
| `update` | `reportId, input: UpdateDailyReportInput` | `DailyReport` | 必要 | 明細の差分更新（削除→再作成） |

**BugService（SVC-006）**

| メソッド | 引数 | 戻り値 | トランザクション | 処理概要 |
|---------|------|--------|----------------|---------|
| `create` | `projectId, input: CreateBugInput` | `Bug` | 必要 | `bug_sequence` を SELECT FOR UPDATE でインクリメントし `BUG-XXX` を採番 |
| `update` | `bugId, input: UpdateBugInput` | `Bug` | 必要 | ステータス遷移の妥当性チェック後に更新 |

**ReportService（SVC-007）**

| メソッド | 引数 | 戻り値 | トランザクション | 処理概要 |
|---------|------|--------|----------------|---------|
| `getDashboard` | `projectId, userId` | `DashboardData` | 不要 | EVM・障害・指摘・日報の各集計を並列クエリで取得 |
| `getEvmData` | `projectId, startDate?, endDate?` | `EvmResult` | 不要 | 日次累積 PV/AC/EV を計算して返す |

#### バリデーション方針

- API Routes 層でリクエストボディを **Zod** でバリデーションし、失敗時は 400 を返す
- ビジネスロジック（階層超過・ステータス遷移・重複チェック等）はサービス層で検証し、422 を返す
- Zod スキーマは `lib/utils/validation.ts` に集約する

---

### リポジトリ層

#### リポジトリ一覧

| ID | リポジトリ名 | ファイル | 管理対象 | 対応テーブル |
|----|------------|---------|---------|------------|
| REP-001 | UserRepository | `user.repository.ts` | ユーザー | TBL-001 |
| REP-002 | ProjectRepository | `project.repository.ts` | プロジェクト・メンバー | TBL-002, TBL-003 |
| REP-003 | TaskRepository | `task.repository.ts` | タスク（WBS） | TBL-004 |
| REP-004 | DailyReportRepository | `daily-report.repository.ts` | 日報ヘッダー・明細 | TBL-005, TBL-006 |
| REP-005 | ReviewRepository | `review.repository.ts` | レビューセッション・区分・指摘 | TBL-007, TBL-008, TBL-009 |
| REP-006 | BugRepository | `bug.repository.ts` | 障害管理票 | TBL-010 |

#### 主要メソッド定義

**TaskRepository（REP-003）**

| メソッド | 引数 | 戻り値 | 説明 |
|---------|------|--------|------|
| `findByProjectWithActualHours` | `projectId: number` | `TaskWithActualHours[]` | タスク一覧＋日報集計の実績工数（JOIN クエリ） |
| `findById` | `id: number` | `Task \| null` | ID による単一取得 |
| `findChildren` | `parentId: number` | `Task[]` | 子タスク一覧（階層チェック用） |
| `create` | `data: Prisma.TaskCreateInput` | `Task` | 作成 |
| `update` | `id: number, data: Prisma.TaskUpdateInput` | `Task` | 更新 |
| `delete` | `id: number` | `void` | 削除 |

**BugRepository（REP-006）**

| メソッド | 引数 | 戻り値 | 説明 |
|---------|------|--------|------|
| `findByProjectWithFilters` | `projectId, criteria: BugCriteria` | `Bug[]` | 重要度・ステータス・キーワードによるフィルタ付き一覧 |
| `findById` | `id: number` | `Bug \| null` | ID による単一取得 |
| `create` | `data: Prisma.BugCreateInput` | `Bug` | 作成（採番後に呼び出す） |
| `update` | `id: number, data: Prisma.BugUpdateInput` | `Bug` | 更新 |
| `incrementBugSequence` | `projectId: number` | `number` | `bug_sequence` をインクリメントして新番号を返す（SELECT FOR UPDATE） |

#### Prisma Client の利用方針

```typescript
// lib/prisma/client.ts - シングルトンパターン（開発環境の hot reload 対策）
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

### ミドルウェア設計

#### セッション検証ヘルパー（`lib/auth/session.ts`）

API Routes 内で共通利用するヘルパー関数を定義する。

```typescript
// 認証チェック：未認証なら 401 エラーをスロー
async function requireAuth(req: Request): Promise<Session>

// ロールチェック：指定ロール以外なら 403 エラーをスロー
async function requireRole(req: Request, roles: Role[]): Promise<Session>

// プロジェクトメンバーチェック：非メンバーなら 404 をスロー
async function requireProjectMember(req: Request, projectId: number): Promise<Session>
```

#### API Routes のエラーハンドリングパターン

```typescript
// API Routes の共通実装パターン
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // 1. 認証・認可チェック
    const session = await requireProjectMember(req, Number(params.id));

    // 2. リクエストボディのバリデーション（Zod）
    const body = await req.json();
    const input = createTaskSchema.parse(body); // 失敗時は ZodError

    // 3. サービス呼び出し
    const task = await taskService.create(Number(params.id), input);

    // 4. 成功レスポンス
    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    return handleApiError(error); // lib/utils/error.ts の共通エラーハンドラ
  }
}
```

#### エラーハンドラ（`lib/utils/error.ts`）

| エラー種別 | HTTPステータス | エラーコード |
|----------|-------------|------------|
| `ZodError` | 400 | `VALIDATION_ERROR` |
| `UnauthorizedError` | 401 | `UNAUTHORIZED` |
| `ForbiddenError` | 403 | `FORBIDDEN` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ConflictError` | 409 | `CONFLICT` |
| `InvalidTransitionError` | 422 | `INVALID_TRANSITION` |
| `Error`（その他） | 500 | `INTERNAL_ERROR` |

#### 操作ログ記録方針

非機能要件（FR-AUTH 等の操作ログ）に対応するため、以下の操作でサービス層からログを出力する。

| 記録対象 | 記録内容 |
|---------|---------|
| ログイン・ログアウト | タイムスタンプ・ユーザーID・操作内容・IPアドレス |
| ユーザー管理操作（追加・編集・無効化） | タイムスタンプ・実行者ID・対象ユーザーID・変更内容 |
| レビュー指摘の登録・更新 | タイムスタンプ・実行者ID・指摘ID・操作内容 |
| 障害の登録・更新 | タイムスタンプ・実行者ID・障害ID・操作内容 |

!!! note "ログ出力方式"
    初期フェーズは `console.log` による標準出力（Docker ログとして収集）で対応する。将来的には専用のロギングライブラリ（pino 等）への移行を検討する。
