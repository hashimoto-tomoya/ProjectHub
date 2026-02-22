# ProjectHub

社内プロジェクトの進捗・工数・品質情報を一元管理するWebアプリケーション。
WBS管理・日報入力・レビュー記録・障害管理・EVM分析など、データに基づいた意思決定を支援します。

## 概要

Excelや個別ファイルに分散したプロジェクト管理情報を統合し、以下を実現します。

- **工数管理の効率化**: 日報からの工数自動集計
- **品質の見える化**: EVM・信頼性成長曲線・傾向分析によるリスク早期検知
- **プロセス標準化**: WBS・レビュー・障害管理の記録フォーマット統一

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 14 (App Router) + TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| 状態管理 | TanStack Query v5 |
| 認証 | NextAuth.js v5 (Credentials Provider) |
| ORM | Prisma v5 |
| DB | PostgreSQL |
| バリデーション | Zod |
| グラフ | Recharts |
| インフラ | Docker Compose + nginx |
| テスト | Vitest + Testing Library + MSW + Playwright |

## 開発環境のセットアップ

### 前提条件

- Node.js 20+
- Docker Desktop
- PostgreSQL（またはDockerで起動）

### 手順

```bash
# 1. リポジトリのクローン
git clone <repository-url>
cd project-hub

# 2. 環境変数の設定
cp .env.example .env.local
# NEXTAUTH_SECRET を任意の文字列に変更する（DATABASE_URL はデフォルト値のまま動作）

# 3. DBサーバー起動（Docker）
docker compose up db -d

# 4. 依存パッケージのインストール
npm install

# 5. DBマイグレーション & シードデータ投入
npx prisma migrate dev
npx prisma db seed

# 6. 開発サーバー起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスします。

#### DB接続情報（デフォルト値）

| 項目 | 値 |
|------|---|
| ホスト | `localhost:5432` |
| DB名 | `projecthub` |
| ユーザー | `postgres` |
| パスワード | `password` |

#### DBの停止

```bash
docker compose down        # 停止（データは保持）
docker compose down -v     # 停止 + データも削除
```

### アプリ全体をDockerで起動する場合

```bash
docker compose up -d
```

nginx経由で `https://localhost` にアクセスします（自己署名証明書）。

## npm スクリプト

| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run lint` | ESLint チェック |
| `npm run type-check` | TypeScript 型チェック |
| `npm run format` | Prettier フォーマット |
| `npm test` | 単体テスト（Vitest） |
| `npm run test:watch` | 単体テスト（ウォッチモード） |
| `npm run test:int` | 結合テスト（Vitest + テストDB） |
| `npm run test:e2e` | E2Eテスト（Playwright） |
| `npm run test:cov` | カバレッジレポート生成 |

## 実装状況

### Phase 1: 基盤確立（完了）

| タスク | 内容 | 状態 |
|--------|------|------|
| T01 | プロジェクト初期セットアップ | 完了 |
| T02 | Docker環境構築・CI/CD | 完了 |
| T03 | DBスキーマ・Prismaマイグレーション | 完了 |
| T04 | 共通基盤（認証・型定義・ユーティリティ） | 完了 |
| T05 | 共通UIコンポーネント | 完了 |
| T06 | 認証機能（ログイン・パスワード管理） | 完了 |

### Phase 2 / Phase 3: コア・業務機能（進行中）

| タスク | 内容 | 状態 |
|--------|------|------|
| T07 | プロジェクト管理（CRUD・メンバー・お気に入り） | 完了 |
| T08 | WBS・タスク管理（ガントチャート・実績工数集計） | 完了 |
| T09 | 日報・実績入力（カレンダービュー・工数自動反映） | 未着手 |
| T10 | レビュー記録票管理（指摘・ステータス遷移） | 未着手 |
| T11 | 障害管理票（自動採番・ステータス遷移） | 未着手 |
| T13 | ユーザー管理（管理者機能） | 未着手 |

### Phase 4: 完成

| タスク | 内容 | 状態 |
|--------|------|------|
| T12 | レポート・分析（EVM・信頼性成長曲線） | 未着手 |
| T14 | 結合テスト・E2Eテスト | 未着手 |

## ディレクトリ構成

```
project-hub/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # 認証画面（ログイン・パスワード変更）
│   ├── (main)/                 # メイン画面（要認証）
│   │   ├── admin/              # 管理者専用画面
│   │   └── projects/[id]/      # プロジェクト詳細・WBS・日報・障害等
│   └── api/                    # API Routes
├── components/
│   ├── features/               # 機能固有コンポーネント
│   └── ui/                     # 汎用UIコンポーネント（shadcn/ui拡張）
├── lib/
│   ├── auth/                   # 認証ヘルパー
│   ├── prisma/                 # Prisma Client
│   ├── repositories/           # データアクセス層
│   ├── services/               # ビジネスロジック層
│   ├── types/                  # 型定義（domain / api）
│   └── utils/                  # ユーティリティ（password / validation / error）
├── prisma/
│   ├── schema.prisma           # DBスキーマ（全10テーブル）
│   └── seed.ts                 # シードデータ
├── tests/
│   ├── unit/                   # 単体テスト
│   ├── integration/            # 結合テスト
│   └── e2e/                    # E2Eテスト（Playwright）
├── nginx/                      # nginx設定
├── docker-compose.yml
└── docs/                       # 設計ドキュメント（MkDocs）
```

## 設計ドキュメント

`docs/` フォルダに設計書一式があります。MkDocs（Material for MkDocs）でローカル閲覧できます。

```bash
# Python仮想環境のセットアップ（初回のみ）
python -m venv .venv
.venv/Scripts/Activate.ps1   # Windows PowerShell
pip install mkdocs-material

# ドキュメントサーバー起動
mkdocs serve --livereload
```

ブラウザで [http://127.0.0.1:8000](http://127.0.0.1:8000) にアクセスします。

## 開発ルール

- **TDD（RED → GREEN）**: テストを先に書き、失敗確認後に実装する
- **ブランチ戦略**: `feature/T{NN}-{内容}` → Squash Merge のみ
- **品質チェック**: `npm run lint && npm run type-check` をマージ前に必須実行
- 詳細は [CLAUDE.md](./CLAUDE.md) を参照
