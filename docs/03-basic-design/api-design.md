# API設計

## API設計方針

### 設計原則

本システムのAPIは **RESTful** 設計に基づき、Next.js API Routes として実装する。

| 原則 | 方針 |
|------|------|
| ベースURL | `/api/`（バージョニングなし。初期フェーズは `/api/v1/` を採用しない） |
| URLスタイル | リソースは名詞・複数形・ケバブケース（例: `/api/projects`, `/api/daily-reports`） |
| HTTPメソッド | GET（取得）/ POST（作成）/ PUT（更新）/ DELETE（削除）をRESTの意味論に従い使用 |
| リクエスト形式 | `Content-Type: application/json` / UTF-8 |
| レスポンス形式 | JSON 統一（エラー含む） |
| ネスト深さ | 最大2階層まで（例: `/api/projects/{id}/tasks`） |
| 日時フォーマット | ISO 8601 / 日付のみの場合は `YYYY-MM-DD` |

### 認証方式

NextAuth.js によるサーバーサイドセッション管理を使用する。

```
// NextAuth.js が自動提供するエンドポイント
POST /api/auth/[...nextauth]  // ログイン・ログアウト・セッション管理
```

- 認証が必要なエンドポイントは API Routes 内で `getServerSession()` を呼び出し、未認証の場合は 401 を返す
- 認可チェックは API Routes 内でロール（`admin` / `pmo` / `pm` / `developer`）を確認し、権限外の操作は 403 を返す

### レスポンス形式

**成功（単一リソース）:**

```json
{
  "data": { "id": 1, "name": "..." }
}
```

**成功（コレクション）:**

```json
{
  "data": [ ... ],
  "pagination": { "page": 1, "perPage": 20, "total": 150, "totalPages": 8 }
}
```

**成功（データなし）:** HTTPステータス 204 No Content を返す（ボディなし）

### エラーレスポンス

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

| エラーコード | 説明 |
|-------------|------|
| `UNAUTHORIZED` | 未認証 |
| `FORBIDDEN` | 権限不足 |
| `NOT_FOUND` | リソース未存在 |
| `VALIDATION_ERROR` | バリデーションエラー |
| `CONFLICT` | 重複（メールアドレス・日報の重複登録等） |
| `INVALID_TRANSITION` | 不正なステータス遷移 |
| `INTERNAL_ERROR` | サーバー内部エラー |

### ページネーション

- クエリパラメータ: `?page=1&perPage=20`
- デフォルト: 20件/ページ / 最大: 100件/ページ
- ページネーションが不要な一覧（WBS全体等）は省略する

### HTTPステータスコード

| コード | 意味 | 使用場面 |
|--------|------|---------|
| 200 | OK | 取得・更新成功 |
| 201 | Created | 作成成功 |
| 204 | No Content | 削除成功・更新で返却データなし |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 未認証 |
| 403 | Forbidden | 権限不足 |
| 404 | Not Found | リソース未存在 |
| 409 | Conflict | 競合（重複登録等） |
| 422 | Unprocessable Entity | 不正なステータス遷移等のビジネスロジックエラー |
| 500 | Internal Server Error | サーバー内部エラー |

---

## エンドポイント一覧

### 認証

| # | API ID | メソッド | パス | 概要 | 認証 | 権限 |
|---|--------|---------|------|------|------|------|
| 1 | — | POST | `/api/auth/[...nextauth]` | ログイン・ログアウト（NextAuth.js） | 不要 | — |
| 2 | API-C-001 | PUT | `/api/users/me/password` | パスワード変更 | 要 | 全ロール |

### プロジェクト

| # | API ID | メソッド | パス | 概要 | 認証 | 権限 |
|---|--------|---------|------|------|------|------|
| 3 | API-C-002 | GET | `/api/projects` | プロジェクト一覧取得 | 要 | 全ロール |
| 4 | API-C-003 | POST | `/api/projects` | プロジェクト作成 | 要 | admin / pm |
| 5 | API-C-004 | GET | `/api/projects/[id]` | プロジェクト詳細取得 | 要 | 全ロール |
| 6 | API-C-005 | PUT | `/api/projects/[id]` | プロジェクト更新 | 要 | admin / pm |
| 7 | API-C-006 | PUT | `/api/projects/[id]/favorite` | お気に入り登録/解除 | 要 | 全ロール |
| 8 | API-C-007 | GET | `/api/projects/[id]/members` | プロジェクトメンバー一覧取得 | 要 | 全ロール |
| 9 | API-C-008 | POST | `/api/projects/[id]/members` | メンバー追加 | 要 | admin / pm |
| 10 | API-C-009 | DELETE | `/api/projects/[id]/members/[userId]` | メンバー削除 | 要 | admin / pm |

### WBS・タスク

| # | API ID | メソッド | パス | 概要 | 認証 | 権限 |
|---|--------|---------|------|------|------|------|
| 11 | API-C-010 | GET | `/api/projects/[id]/tasks` | タスク一覧取得（WBS全体） | 要 | 全ロール |
| 12 | API-C-011 | POST | `/api/projects/[id]/tasks` | タスク登録 | 要 | admin / pm |
| 13 | API-C-012 | PUT | `/api/projects/[id]/tasks/[taskId]` | タスク更新 | 要 | admin / pm |
| 14 | API-C-013 | DELETE | `/api/projects/[id]/tasks/[taskId]` | タスク削除 | 要 | admin / pm |

### 日報・実績

| # | API ID | メソッド | パス | 概要 | 認証 | 権限 |
|---|--------|---------|------|------|------|------|
| 15 | API-C-014 | GET | `/api/projects/[id]/daily-reports` | 日報一覧取得 | 要 | 全ロール |
| 16 | API-C-015 | POST | `/api/projects/[id]/daily-reports` | 日報登録 | 要 | admin / pm / developer |
| 17 | API-C-016 | GET | `/api/projects/[id]/daily-reports/[reportId]` | 日報詳細取得 | 要 | 全ロール |
| 18 | API-C-017 | PUT | `/api/projects/[id]/daily-reports/[reportId]` | 日報更新 | 要 | admin / pm / developer |

### レビュー記録票

| # | API ID | メソッド | パス | 概要 | 認証 | 権限 |
|---|--------|---------|------|------|------|------|
| 19 | API-C-018 | GET | `/api/projects/[id]/review-sessions` | レビューセッション一覧取得 | 要 | 全ロール |
| 20 | API-C-019 | POST | `/api/projects/[id]/review-sessions` | レビューセッション登録 | 要 | admin / pm / developer |
| 21 | API-C-020 | GET | `/api/projects/[id]/review-items` | 指摘一覧取得 | 要 | 全ロール |
| 22 | API-C-021 | POST | `/api/projects/[id]/review-items` | 指摘登録 | 要 | admin / pm / developer |
| 23 | API-C-022 | PUT | `/api/projects/[id]/review-items/[itemId]` | 指摘更新（ステータス含む） | 要 | admin / pm / developer |
| 24 | API-C-023 | GET | `/api/projects/[id]/review-categories` | 指摘区分一覧取得 | 要 | 全ロール |

### 障害管理票

| # | API ID | メソッド | パス | 概要 | 認証 | 権限 |
|---|--------|---------|------|------|------|------|
| 25 | API-C-024 | GET | `/api/projects/[id]/bugs` | 障害一覧取得 | 要 | 全ロール |
| 26 | API-C-025 | POST | `/api/projects/[id]/bugs` | 障害登録 | 要 | admin / pm / developer |
| 27 | API-C-026 | GET | `/api/projects/[id]/bugs/[bugId]` | 障害詳細取得 | 要 | 全ロール |
| 28 | API-C-027 | PUT | `/api/projects/[id]/bugs/[bugId]` | 障害更新 | 要 | admin / pm / developer |

### レポート・分析

| # | API ID | メソッド | パス | 概要 | 認証 | 権限 |
|---|--------|---------|------|------|------|------|
| 29 | API-C-028 | GET | `/api/projects/[id]/dashboard` | ダッシュボード集計データ取得 | 要 | 全ロール |
| 30 | API-C-029 | GET | `/api/projects/[id]/reports/evm` | EVM分析データ取得 | 要 | 全ロール |
| 31 | API-C-030 | GET | `/api/projects/[id]/reports/reliability-growth` | 信頼性成長曲線データ取得 | 要 | 全ロール |
| 32 | API-C-031 | GET | `/api/projects/[id]/reports/review-categories` | 指摘区分分析データ取得 | 要 | 全ロール |
| 33 | API-C-032 | GET | `/api/projects/[id]/reports/bug-density` | 障害密度分析データ取得 | 要 | 全ロール |

### ユーザー管理（管理者）

| # | API ID | メソッド | パス | 概要 | 認証 | 権限 |
|---|--------|---------|------|------|------|------|
| 34 | API-A-001 | GET | `/api/admin/users` | ユーザー一覧取得 | 要 | admin |
| 35 | API-A-002 | POST | `/api/admin/users` | ユーザー登録 | 要 | admin |
| 36 | API-A-003 | PUT | `/api/admin/users/[id]` | ユーザー更新 | 要 | admin |
| 37 | API-A-004 | POST | `/api/admin/users/[id]/reset-password` | パスワードリセット | 要 | admin |

---

## 主要API仕様

### 認証

#### API-C-001: パスワード変更

| 項目 | 内容 |
|------|------|
| API ID | API-C-001 |
| メソッド / パス | `PUT /api/users/me/password` |
| 概要 | ログイン中ユーザー自身のパスワードを変更する |
| 認証 | 要 |
| 権限 | 全ロール |
| 対応機能要件 | FR-AUTH-005 |
| 対応画面 | ユーザーメニュー > パスワード変更 |

**リクエストボディ:**

| フィールド | 型 | 必須 | バリデーション |
|-----------|-----|------|--------------|
| currentPassword | string | 必須 | — |
| newPassword | string | 必須 | 8文字以上、英字＋数字を各1文字以上含む |

**レスポンス:**

| ステータス | 内容 |
|-----------|------|
| 204 | 変更成功 |
| 400 | バリデーションエラー（新パスワードが要件未満） |
| 401 | 現在のパスワードが不一致 |

!!! note "NextAuth.js の認証エンドポイント"
    ログイン（`POST /api/auth/signin`）・ログアウト（`POST /api/auth/signout`）は NextAuth.js が自動提供するエンドポイント。画面設計（SCR-C-001）のログイン操作は NextAuth.js の credentials プロバイダーが処理する。初回ログイン時のパスワード変更強制はセッションに `mustChangePassword` フラグを持たせ、画面側でリダイレクト制御する。

---

### プロジェクト

#### API-C-002: プロジェクト一覧取得

| 項目 | 内容 |
|------|------|
| API ID | API-C-002 |
| メソッド / パス | `GET /api/projects` |
| 概要 | ログインユーザーが参加しているプロジェクトの一覧を取得する |
| 認証 | 要 |
| 権限 | 全ロール（admin は全プロジェクト、その他はメンバー参加プロジェクトのみ） |
| 対応機能要件 | FR-WBS-007 |
| 対応画面 | SCR-C-002 プロジェクト一覧 |

**クエリパラメータ:**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| status | string | 任意 | `active` | `active` / `archived` / `all` |

**レスポンス（200）:**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| data[].id | number | プロジェクトID |
| data[].name | string | プロジェクト名 |
| data[].status | string | ステータス（`active` / `archived`） |
| data[].startDate | string | 開始日（YYYY-MM-DD） |
| data[].endDate | string \| null | 終了予定日 |
| data[].pmName | string | PM の氏名 |
| data[].isFavorite | boolean | お気に入り登録状態 |

!!! warning "データモデルへの追記が必要"
    `isFavorite` フラグを保存するため、`project_members` テーブルに `is_favorite BOOLEAN DEFAULT false` カラムの追加が必要。`data-model.md` のテーブル定義（TBL-003）に反映すること。

#### API-C-006: お気に入り登録/解除

| 項目 | 内容 |
|------|------|
| API ID | API-C-006 |
| メソッド / パス | `PUT /api/projects/[id]/favorite` |
| 概要 | プロジェクトのお気に入り状態をトグルする。グローバルセレクタへの表示を制御する |
| 認証 | 要 |
| 権限 | 全ロール（プロジェクトメンバーのみ） |
| 対応機能要件 | FR-WBS-007 |
| 対応画面 | SCR-C-002 ★/☆クリック |

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| isFavorite | boolean | 必須 | `true` = 登録、`false` = 解除 |

**レスポンス:**

| ステータス | 内容 |
|-----------|------|
| 200 | 更新成功。`{ "data": { "isFavorite": true } }` |
| 404 | プロジェクト未存在またはメンバー外 |

---

### WBS・タスク

#### API-C-010: タスク一覧取得

| 項目 | 内容 |
|------|------|
| API ID | API-C-010 |
| メソッド / パス | `GET /api/projects/[id]/tasks` |
| 概要 | プロジェクトの WBS 全体（タスク階層・予実工数）を取得する |
| 認証 | 要 |
| 権限 | 全ロール |
| 対応機能要件 | FR-WBS-001〜006 |
| 対応画面 | SCR-C-004 WBS・タスク管理 |

**レスポンス（200）:**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| data[].id | number | タスクID |
| data[].parentTaskId | number \| null | 親タスクID（null = 大項目） |
| data[].level | number | 階層レベル（1〜3） |
| data[].name | string | タスク名 |
| data[].assigneeId | number \| null | 担当者ID |
| data[].assigneeName | string \| null | 担当者名 |
| data[].startDate | string | 開始予定日（YYYY-MM-DD） |
| data[].endDate | string | 終了予定日（YYYY-MM-DD） |
| data[].plannedHours | number | 予定工数（時間） |
| data[].actualHours | number | 実績工数（日報明細の集計値） |
| data[].status | string | ステータス（未着手/進行中/完了/保留） |
| data[].sortOrder | number | 同一親タスク内の表示順 |

!!! note "ページネーションなし"
    WBS は全タスクを一括で返す（ページネーションなし）。プロジェクト規模（〜500タスク想定）では問題なし。`actualHours` はレスポンス生成時に `daily_report_entries` を JOIN して集計する。

#### API-C-011: タスク登録

| 項目 | 内容 |
|------|------|
| API ID | API-C-011 |
| メソッド / パス | `POST /api/projects/[id]/tasks` |
| 概要 | WBS にタスクを登録する |
| 認証 | 要 |
| 権限 | admin / pm |
| 対応機能要件 | FR-WBS-001, FR-WBS-003 |
| 対応画面 | SCR-C-004 タスク追加スライドオーバー「保存」 |

**リクエストボディ:**

| フィールド | 型 | 必須 | バリデーション |
|-----------|-----|------|--------------|
| name | string | 必須 | 最大300文字 |
| parentTaskId | number | 任意 | 存在するタスクID。3階層超は不可（422） |
| assigneeId | number | 任意 | プロジェクトメンバーのID |
| startDate | string | 必須 | YYYY-MM-DD 形式 |
| endDate | string | 必須 | YYYY-MM-DD 形式、`startDate` 以降 |
| plannedHours | number | 必須 | 0 より大きい値 |
| status | string | 必須 | 未着手 / 進行中 / 完了 / 保留 |

**レスポンス:**

| ステータス | 内容 |
|-----------|------|
| 201 | 作成成功。作成したタスクオブジェクトを返す |
| 400 | バリデーションエラー |
| 403 | 権限不足 |
| 422 | 階層レベル超過（3階層超） |

#### API-C-012: タスク更新

| 項目 | 内容 |
|------|------|
| API ID | API-C-012 |
| メソッド / パス | `PUT /api/projects/[id]/tasks/[taskId]` |
| 概要 | タスク情報を更新する。ガントチャートでのドラッグ&ドロップによる期間変更にも使用する |
| 認証 | 要 |
| 権限 | admin / pm |
| 対応機能要件 | FR-WBS-002, FR-WBS-003, FR-WBS-006 |
| 対応画面 | SCR-C-004 タスク編集スライドオーバー「保存」、ガントチャート D&D |

**リクエストボディ:** タスク登録と同フィールド（すべて任意。変更分のみ送信）

**レスポンス:**

| ステータス | 内容 |
|-----------|------|
| 200 | 更新成功。更新後タスクオブジェクトを返す |
| 400 | バリデーションエラー |
| 403 | 権限不足 |
| 404 | タスク未存在 |

---

### 日報・実績

#### API-C-015: 日報登録

| 項目 | 内容 |
|------|------|
| API ID | API-C-015 |
| メソッド / パス | `POST /api/projects/[id]/daily-reports` |
| 概要 | 日報（作業実績）を登録する。登録時に WBS の実績工数が自動反映される |
| 認証 | 要 |
| 権限 | admin / pm / developer（PMO は不可） |
| 対応機能要件 | FR-DAILY-001, FR-WBS-004 |
| 対応画面 | SCR-C-005 日報入力スライドオーバー「保存」 |

**リクエストボディ:**

| フィールド | 型 | 必須 | バリデーション |
|-----------|-----|------|--------------|
| workDate | string | 必須 | YYYY-MM-DD 形式、当日以前（将来日不可） |
| entries | array | 必須 | 1件以上 |
| entries[].taskId | number | 必須 | プロジェクトのタスクID |
| entries[].workHours | number | 必須 | 0 より大きい値（時間単位） |
| entries[].comment | string | 任意 | 最大500文字 |

**リクエスト例:**

```json
{
  "workDate": "2025-01-16",
  "entries": [
    { "taskId": 10, "workHours": 4.0, "comment": "設計作業" },
    { "taskId": 12, "workHours": 2.0, "comment": null }
  ]
}
```

**レスポンス:**

| ステータス | 内容 |
|-----------|------|
| 201 | 登録成功。`{ "data": { "id": 1, "workDate": "2025-01-16" } }` を返す |
| 400 | バリデーションエラー（将来日・workHours ≦ 0 等） |
| 403 | 権限不足（PMO） |
| 409 | 同一日付の日報が既に存在（更新は `PUT` を使用） |

!!! note "WBS 実績工数の自動反映"
    日報登録後、クライアント側は `GET /api/projects/[id]/tasks` を再取得することで最新の実績工数を反映する（FR-WBS-004）。サーバー側では日報ヘッダー・明細の保存を同一トランザクションで行う。

#### API-C-014: 日報一覧取得

| 項目 | 内容 |
|------|------|
| API ID | API-C-014 |
| メソッド / パス | `GET /api/projects/[id]/daily-reports` |
| 概要 | 日報一覧を取得する。カレンダービュー・リストビューで共用 |
| 認証 | 要 |
| 権限 | 全ロール |
| 対応機能要件 | FR-DAILY-002, FR-DAILY-003, FR-DAILY-005 |
| 対応画面 | SCR-C-005 日報入力・管理 |

**クエリパラメータ:**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| userId | number | 任意 | ログインユーザー | 対象ユーザー（PMO / PM / admin は他ユーザー指定可） |
| startDate | string | 任意 | 当月初日 | 期間開始（YYYY-MM-DD） |
| endDate | string | 任意 | 当月末日 | 期間終了（YYYY-MM-DD） |

**レスポンス（200）:**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| data[].id | number | 日報ID |
| data[].workDate | string | 作業日（YYYY-MM-DD） |
| data[].totalHours | number | 合計作業時間 |
| data[].entries | array | 明細（taskId, taskName, workHours, comment） |

---

### レビュー記録票

#### API-C-019: レビューセッション登録

| 項目 | 内容 |
|------|------|
| API ID | API-C-019 |
| メソッド / パス | `POST /api/projects/[id]/review-sessions` |
| 概要 | レビューセッション（実施記録）を登録する |
| 認証 | 要 |
| 権限 | admin / pm / developer（PMO は不可） |
| 対応機能要件 | FR-REVIEW-001 |
| 対応画面 | SCR-C-006 レビュー記録票「登録」スライドオーバー |

**リクエストボディ:**

| フィールド | 型 | 必須 | バリデーション |
|-----------|-----|------|--------------|
| reviewType | string | 必須 | コードレビュー / 設計レビュー 等（最大50文字） |
| targetName | string | 必須 | レビュー対象（資料名/ファイル名）最大300文字 |
| sessionDate | string | 必須 | YYYY-MM-DD 形式 |
| reviewerId | number | 必須 | プロジェクトメンバーのID |

**レスポンス:**

| ステータス | 内容 |
|-----------|------|
| 201 | 登録成功。作成したセッションオブジェクトを返す |
| 400 | バリデーションエラー |
| 403 | 権限不足（PMO） |

#### API-C-022: 指摘更新

| 項目 | 内容 |
|------|------|
| API ID | API-C-022 |
| メソッド / パス | `PUT /api/projects/[id]/review-items/[itemId]` |
| 概要 | レビュー指摘のステータス・内容を更新する。インライン更新にも使用する |
| 認証 | 要 |
| 権限 | admin / pm / developer（PMO は不可） |
| 対応機能要件 | FR-REVIEW-003, FR-REVIEW-005 |
| 対応画面 | SCR-C-006 指摘一覧のステータスインライン変更、スライドオーバー編集 |

**リクエストボディ（すべて任意。変更分のみ送信）:**

| フィールド | 型 | バリデーション |
|-----------|-----|--------------|
| status | string | 未対応 / 修正中 / 確認待ち / 完了 |
| assigneeId | number | プロジェクトメンバーのID |
| categoryId | number | プロジェクトの指摘区分ID |
| severity | string | 致命的 / 高 / 中 / 低 |
| resolvedDate | string | YYYY-MM-DD（status = 完了 時に設定） |

**ステータス遷移の制約:**

```
未対応 → 修正中 → 確認待ち → 完了
確認待ち → 修正中（差し戻し）
```

**レスポンス:**

| ステータス | 内容 |
|-----------|------|
| 200 | 更新成功。更新後の指摘オブジェクトを返す |
| 403 | 権限不足（PMO） |
| 404 | 指摘未存在 |
| 422 | 不正なステータス遷移 |

---

### 障害管理票

#### API-C-025: 障害登録

| 項目 | 内容 |
|------|------|
| API ID | API-C-025 |
| メソッド / パス | `POST /api/projects/[id]/bugs` |
| 概要 | 障害を登録する。障害番号（BUG-XXX）を自動採番する |
| 認証 | 要 |
| 権限 | admin / pm / developer（PMO は不可） |
| 対応機能要件 | FR-BUG-001 |
| 対応画面 | SCR-C-007 障害登録スライドオーバー「保存」 |

**リクエストボディ:**

| フィールド | 型 | 必須 | バリデーション |
|-----------|-----|------|--------------|
| title | string | 必須 | 最大300文字 |
| foundDate | string | 必須 | YYYY-MM-DD 形式 |
| foundPhase | string | 必須 | 設計 / 製造 / 単体テスト / 結合テスト |
| severity | string | 必須 | 致命的 / 高 / 中 / 低 |
| assigneeId | number | 任意 | プロジェクトメンバーのID |
| taskId | number | 任意 | 関連 WBS タスクのID |
| description | string | 任意 | 詳細説明 |
| stepsToReproduce | string | 任意 | 再現手順 |

**レスポンス（201）:**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| data.id | number | 障害内部ID |
| data.bugNumber | string | 障害番号（例: `BUG-001`） |
| data.title | string | タイトル |
| data.status | string | 初期ステータス（`未対応`） |
| data.severity | string | 重要度 |
| data.foundDate | string | 発生日 |

!!! note "障害番号の採番"
    `projects.bug_sequence` をインクリメントして `BUG-{3桁ゼロ埋め}` を生成する。採番はトランザクション内で排他制御（`SELECT ... FOR UPDATE`）して連番の重複を防ぐ。

#### API-C-027: 障害更新

| 項目 | 内容 |
|------|------|
| API ID | API-C-027 |
| メソッド / パス | `PUT /api/projects/[id]/bugs/[bugId]` |
| 概要 | 障害情報（ステータス・原因・対策・担当者等）を更新する |
| 認証 | 要 |
| 権限 | admin / pm / developer（PMO は不可） |
| 対応機能要件 | FR-BUG-002, FR-BUG-003 |
| 対応画面 | SCR-C-007 障害詳細スライドオーバー「保存」 |

**リクエストボディ（すべて任意。変更分のみ送信）:**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| status | string | 未対応 / 調査中 / 修正中 / 確認待ち / クローズ |
| severity | string | 致命的 / 高 / 中 / 低 |
| assigneeId | number | 担当者ID |
| taskId | number | 関連 WBS タスクID |
| rootCause | string | 原因分析 |
| fixDescription | string | 対策内容 |
| resolvedDate | string | 修正確認日（YYYY-MM-DD） |

**ステータス遷移の制約:**

```
未対応 → 調査中 → 修正中 → 確認待ち → クローズ
確認待ち → 修正中（再発生・差し戻し）
```

**レスポンス:**

| ステータス | 内容 |
|-----------|------|
| 200 | 更新成功。更新後の障害オブジェクトを返す |
| 403 | 権限不足（PMO） |
| 404 | 障害未存在 |
| 422 | 不正なステータス遷移 |

---

### レポート・分析

#### API-C-028: ダッシュボード集計データ取得

| 項目 | 内容 |
|------|------|
| API ID | API-C-028 |
| メソッド / パス | `GET /api/projects/[id]/dashboard` |
| 概要 | ダッシュボード表示用の集計データを一括取得する |
| 認証 | 要 |
| 権限 | 全ロール |
| 対応機能要件 | FR-REPORT-005, FR-DAILY-005 |
| 対応画面 | SCR-C-003 ダッシュボード |

**レスポンス（200）:**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| spi | number | SPI（= EV/PV）|
| cpi | number | CPI（= EV/AC）|
| taskCompletionRate | number | タスク完了率（0.0〜1.0） |
| openBugsCount | number | 未クローズ障害数（合計） |
| openBugsBySeverity | object | 重要度別の未クローズ障害数 `{ critical, high, medium, low }` |
| openReviewItemsCount | number | レビュー未対応件数 |
| hasDailyReportToday | boolean | 当日の日報入力済みフラグ（土日祝は常に `true`） |

#### API-C-029: EVM分析データ取得

| 項目 | 内容 |
|------|------|
| API ID | API-C-029 |
| メソッド / パス | `GET /api/projects/[id]/reports/evm` |
| 概要 | EVM（PV/AC/EV）の日次推移データを取得する |
| 認証 | 要 |
| 権限 | 全ロール |
| 対応機能要件 | FR-REPORT-001 |
| 対応画面 | SCR-C-008 レポート・分析（EVM タブ） |

**クエリパラメータ:**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| startDate | string | 任意 | プロジェクト開始日 | 集計期間開始（YYYY-MM-DD） |
| endDate | string | 任意 | 当日 | 集計期間終了（YYYY-MM-DD） |

**レスポンス（200）:**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| data[].date | string | 日付（YYYY-MM-DD） |
| data[].pv | number | 計画価値（累積予定工数） |
| data[].ac | number | 実コスト（累積実績工数） |
| data[].ev | number | 出来高（累積完了タスクの予定工数） |
| summary.spi | number | SPI（= EV/PV） |
| summary.cpi | number | CPI（= EV/AC） |
| summary.remainingHours | number | 残工数（PV 総計 - EV） |

#### API-C-030: 信頼性成長曲線データ取得

| 項目 | 内容 |
|------|------|
| API ID | API-C-030 |
| メソッド / パス | `GET /api/projects/[id]/reports/reliability-growth` |
| 概要 | 累積バグ発見数・修正完了数の日次推移データを取得する |
| 認証 | 要 |
| 権限 | 全ロール |
| 対応機能要件 | FR-REPORT-002 |
| 対応画面 | SCR-C-008 レポート・分析（信頼性成長曲線タブ） |

**クエリパラメータ:** EVM と同じ `startDate` / `endDate`

**レスポンス（200）:**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| data[].date | string | 日付（YYYY-MM-DD） |
| data[].cumulativeFound | number | 累積バグ発見数 |
| data[].cumulativeFixed | number | 累積修正完了数 |

---

### ユーザー管理（管理者）

#### API-A-002: ユーザー登録

| 項目 | 内容 |
|------|------|
| API ID | API-A-002 |
| メソッド / パス | `POST /api/admin/users` |
| 概要 | 新規ユーザーを登録する。初期パスワードを設定し、初回ログイン時にパスワード変更を強制する |
| 認証 | 要 |
| 権限 | admin のみ |
| 対応機能要件 | FR-AUTH-003 |
| 対応画面 | SCR-A-001 ユーザー管理「ユーザー追加」 |

**リクエストボディ:**

| フィールド | 型 | 必須 | バリデーション |
|-----------|-----|------|--------------|
| name | string | 必須 | 最大100文字 |
| email | string | 必須 | メール形式、システム内で一意 |
| role | string | 必須 | `admin` / `pmo` / `pm` / `developer` |
| initialPassword | string | 必須 | 8文字以上、英字＋数字を各1文字以上含む |

**レスポンス:**

| ステータス | 内容 |
|-----------|------|
| 201 | 登録成功。作成ユーザー情報（パスワードを除く）を返す |
| 400 | バリデーションエラー |
| 409 | メールアドレス重複 |

#### API-A-003: ユーザー更新

| 項目 | 内容 |
|------|------|
| API ID | API-A-003 |
| メソッド / パス | `PUT /api/admin/users/[id]` |
| 概要 | ユーザー情報（氏名・ロール・有効/無効）を更新する。無効化は論理削除 |
| 認証 | 要 |
| 権限 | admin のみ |
| 対応機能要件 | FR-AUTH-003, FR-AUTH-004 |
| 対応画面 | SCR-A-001 ユーザー管理「編集」 |

**リクエストボディ（すべて任意）:**

| フィールド | 型 | バリデーション |
|-----------|-----|--------------|
| name | string | 最大100文字 |
| role | string | `admin` / `pmo` / `pm` / `developer` |
| isActive | boolean | `false` で無効化（`deleted_at` に現在日時を設定） |

**レスポンス:**

| ステータス | 内容 |
|-----------|------|
| 200 | 更新成功。更新後ユーザー情報を返す |
| 404 | ユーザー未存在 |

#### API-A-004: パスワードリセット

| 項目 | 内容 |
|------|------|
| API ID | API-A-004 |
| メソッド / パス | `POST /api/admin/users/[id]/reset-password` |
| 概要 | 管理者が対象ユーザーのパスワードを強制リセットする。次回ログイン時にパスワード変更を強制する |
| 認証 | 要 |
| 権限 | admin のみ |
| 対応機能要件 | FR-AUTH-006 |
| 対応画面 | SCR-A-001 ユーザー管理（編集ダイアログ内「パスワードリセット」） |

**リクエストボディ:**

| フィールド | 型 | 必須 | バリデーション |
|-----------|-----|------|--------------|
| newPassword | string | 必須 | 8文字以上、英字＋数字を各1文字以上含む |

**レスポンス:**

| ステータス | 内容 |
|-----------|------|
| 204 | リセット成功 |
| 404 | ユーザー未存在 |
