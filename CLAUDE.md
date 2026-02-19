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

## 4. ブランチ戦略

### ブランチの種類

| 種類 | 命名 | 役割 |
|------|------|------|
| `main` | `main` | 唯一の安定ブランチ。直接pushは禁止。CI全パス必須 |
| `feature/TNN-*` | `feature/T07-project-management` | 1タスク1ブランチ。TDDサイクルをここで回す |
| `milestone/phase-N` | `milestone/phase-1-foundation` | Phase統合検証が必要な場合のみ作成（任意） |

### ブランチ命名規則

```
feature/T{タスク番号2桁}-{内容のkebab-case}
例: feature/T01-initial-setup / feature/T07-project-management
```

### PRの粒度

- **原則：1タスク（T01〜T14）= 1PR**
- TDDの `[RED]`（テスト作成）と `[GREEN]`（実装）は**必ず同一PR**にまとめること
- サブタスクが12個超の重量タスク（T04, T08, T12等）は論理単位で2分割可

### マージ方式

- **Squash Merge のみ**（Merge commit・Rebase は禁止）
- Squashコミットメッセージ形式：`feat(T07): プロジェクト管理機能実装 (#PR番号)`

### 並列ブランチ

- 全てのfeatureブランチは **`main` から分岐**（互いから分岐しない）
- 依存タスクがmainにマージされるまで、依存先ブランチはマージしない
- 依存先マージ後は `git rebase main` で最新化してからマージ

### マイルストーン（リリースタグ）

| フェーズ | 完了タスク | タグ |
|---------|-----------|------|
| Phase 1: 基盤確立 | T01〜T06 | `v0.1.0` |
| Phase 2: コア機能 | T07, T13 | `v0.2.0` |
| Phase 3: 業務機能 | T08〜T11 | `v0.3.0` |
| Phase 4: 完成 | T12, T14 | `v1.0.0` |

### 作業標準手順

```bash
# 1. mainから分岐
git switch main && git pull origin main
git switch -c feature/T07-project-management

# 2. TDD RED → GREEN → 品質チェック → push
git commit -m "test(T07): ProjectService単体テスト [RED]"
git commit -m "feat(T07): ProjectService実装 [GREEN]"
npm run lint && npm run type-check
git push -u origin feature/T07-project-management

# 3. PR作成（draft → ready → Squash Merge）
gh pr create --draft --title "WIP: feat(T07) プロジェクト管理機能"
gh pr ready  # CI全パス確認後
# GitHubのUIで「Squash and merge」を選択

# 4. ブランチ削除（自動削除設定済みなら不要）
git branch -d feature/T07-project-management
```

### GitHub リポジトリ設定（初回のみ）

- Branch protection (main): 直接push禁止・CI全パス必須
- Delete branch after merge: 有効化
- マージ方式: Squash のみ許可（Merge commit・Rebase は無効化）

## 5. Backlog 連携ルール

実装は必ず **Tasks.md** を参照して行うこと。各タスクヘッダーに対応する Backlog 課題キー（`TECH_API-XX`）が記載されている。

### タスク開始時

- Backlog の該当課題のステータスを **処理中** に更新する

### タスク完了時

- Backlog の該当課題のステータスを **処理済み** に更新する
- 実施結果の詳細を**コメント**として追加する（**PR のリンクを必ず含める**）

### タスクの開始条件

- Tasks.md の依存タスクのチェックリストが全て完了していること
- **かつ** Backlog の依存タスク課題のステータスが **完了** であること
- 上記どちらか一方でも満たしていない場合、後続タスクの着手は **NG**

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
