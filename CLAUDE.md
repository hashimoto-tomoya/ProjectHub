# 開発ルール

## 1. TDD（テスト駆動開発）

- **必ず RED → GREEN の順で進める**
- テストを先に書き、失敗（RED）を確認してから実装（GREEN）に入る
- 単体テスト（Vitest）は各機能タスク内の `[RED]` / `[GREEN]` ステップに従うこと（Tasks.md 参照）
- すべての単体テストが通過するまで次のステップに進まない

## 2. 設計ドキュメントに従って実装する

実装は必ず以下の設計ドキュメントを参照し、仕様と一致させること。

| フェーズ | ドキュメント | 内容 |
|---------|------------|------|
| 要件定義 | `docs/01-requirements/project-overview.md` | 背景・目的・ユーザー・制約 |
| 要件定義 | `docs/01-requirements/functional-requirements.md` | 機能要件（優先度P0〜P2別の機能一覧） |
| 要件定義 | `docs/01-requirements/non-functional-requirements.md` | 性能・セキュリティ・可用性要件 |
| 方式設計 | `docs/02-technical-design/architecture.md` | 技術スタック・モノリシック構成・認証方式 |
| 方式設計 | `docs/02-technical-design/infrastructure.md` | Docker Compose構成・nginx・CI/CD |
| 基本設計 | `docs/03-basic-design/screen-design.md` | 画面一覧・レイアウト・遷移図 |
| 基本設計 | `docs/03-basic-design/data-model.md` | ER図・テーブル定義（全10テーブル） |
| 基本設計 | `docs/03-basic-design/api-design.md` | RESTful API エンドポイント一覧・リクエスト/レスポンス仕様 |
| 詳細設計 | `docs/04-detailed-design/component-design.md` | FE/BEコンポーネント構成・責務・シーケンス図 |
| 詳細設計 | `docs/04-detailed-design/testing.md` | テスト戦略・単体/結合/E2Eテストケース一覧 |

- 実装前に該当フェーズのドキュメントを確認すること
- ドキュメントと実装が乖離する場合は、ドキュメントを正とする（実装を合わせる）

## 3. 実装後の品質チェック

実装完了後、必ず以下を実行してエラー・警告がないことを確認すること。

```bash
npm run lint        # ESLint チェック
npm run type-check  # TypeScript 型チェック
```

Prettier によるフォーマット修正も合わせて実施する。

```bash
npx prettier --write .
```

---

# 本プロジェクトの設計ドキュメントについて
- 設計書テンプレート: Small

## ドキュメント執筆ルール
- 当プロジェクトのドキュメントはMaterial for MkDocsで作成することを前提とします。
- ドキュメント作成タスクを docs/index.md の「成果物一覧」セクションに記載しています。こちらが指定したタスク番号のタスクを実施してください。
- ドキュメント作成タスクは順番通りに消化するようにしてください。前タスクを飛ばすのはNGです。
- docs/index.md 内の該当タスクが完了した場合、ステータスを更新してください（未着手→対応中→完了）。
- コンテンツをブラウザで確認する際にPlaywrightで取得したスクリーンショットなどの一時ファイルは.logsフォルダに格納してください。
 
## MkDocsセットアップ
### 1. Python仮想環境の作成

```bash
python -m venv .venv
```

### 2. 仮想環境の有効化

**Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

### 3. 依存パッケージのインストール

```bash
pip install mkdocs-material
```

## 使い方

### ローカルプレビュー（開発サーバー）

```bash
mkdocs serve --livereload
```

ブラウザで http://127.0.0.1:8000 にアクセスするとドキュメントが表示されます。
ファイルを編集すると自動的にリロードされます。

### 静的サイトのビルド

```bash
mkdocs build
```

`site/` ディレクトリにHTML一式が生成されます。
