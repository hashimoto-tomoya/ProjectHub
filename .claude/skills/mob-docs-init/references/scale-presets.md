# プロジェクト規模別プリセット

## 規模判定基準

| 観点 | Small | Full |
|------|-------|------|
| 画面数 | ~10 | 10~ |
| 主要機能数 | ~5 | 5~ |
| 外部連携数 | 0~1 | 2~ |
| 想定ユーザー種別 | 1~2 | 2~ |
| バッチ処理数 | 0~2 | 3~ |

## Small プリセット

小規模なWebアプリケーション。MVP、社内ツール、PoC等。

### ドキュメント構成

```
docs/
├── index.md
├── 01-requirements/
│   ├── index.md
│   ├── project-overview.md          # 背景・目的・スコープを1ファイルに統合
│   ├── functional-requirements.md   # 全機能要件を1ファイルに統合
│   └── non-functional-requirements.md # 全非機能要件を1ファイルに統合
├── 02-technical-design/
│   ├── index.md
│   ├── architecture.md              # アーキテクチャ・技術スタックを1ファイルに統合
│   └── infrastructure.md            # インフラ・セキュリティ・運用を1ファイルに統合
├── 03-basic-design/
│   ├── index.md
│   ├── screen-design.md             # 画面一覧・遷移・主要画面定義を1ファイルに統合
│   ├── data-model.md                # ER図・テーブル定義を1ファイルに統合
│   └── api-design.md                # API方針・主要エンドポイントを1ファイルに統合
└── 04-detailed-design/
    ├── index.md
    ├── component-design.md          # FE/BEコンポーネント構成を1ファイルに統合
    └── testing.md                   # テスト戦略・主要テストケースを1ファイルに統合
```

### 成果物一覧テンプレート（docs/index.md用）

フェーズ1: 要件定義

| # | 成果物 | 説明 | ステータス |
|---|--------|------|-----------|
| 1 | プロジェクト概要 | project-overview.md | 未着手 |
| 2 | 機能要件 | functional-requirements.md | 未着手 |
| 3 | 非機能要件 | non-functional-requirements.md | 未着手 |

フェーズ2: 方式設計

| # | 成果物 | 説明 | ステータス |
|---|--------|------|-----------|
| 4 | アーキテクチャ方式 | architecture.md | 未着手 |
| 5 | インフラ・運用方式 | infrastructure.md | 未着手 |

フェーズ3: 基本設計

| # | 成果物 | 説明 | ステータス |
|---|--------|------|-----------|
| 6 | 画面設計 | screen-design.md | 未着手 |
| 7 | データモデル | data-model.md | 未着手 |
| 8 | API設計 | api-design.md | 未着手 |

フェーズ4: 詳細設計

| # | 成果物 | 説明 | ステータス |
|---|--------|------|-----------|
| 9 | コンポーネント設計 | component-design.md | 未着手 |
| 10 | テスト設計 | testing.md | 未着手 |

### nav構成（mkdocs.yml用）

```yaml
nav:
  - ホーム: index.md
  - 要件定義:
      - 概要: 01-requirements/index.md
      - プロジェクト概要: 01-requirements/project-overview.md
      - 機能要件: 01-requirements/functional-requirements.md
      - 非機能要件: 01-requirements/non-functional-requirements.md
  - 方式設計:
      - 概要: 02-technical-design/index.md
      - アーキテクチャ方式: 02-technical-design/architecture.md
      - インフラ・運用方式: 02-technical-design/infrastructure.md
  - 基本設計:
      - 概要: 03-basic-design/index.md
      - 画面設計: 03-basic-design/screen-design.md
      - データモデル: 03-basic-design/data-model.md
      - API設計: 03-basic-design/api-design.md
  - 詳細設計:
      - 概要: 04-detailed-design/index.md
      - コンポーネント設計: 04-detailed-design/component-design.md
      - テスト設計: 04-detailed-design/testing.md
```

---

## Full プリセット

標準的なWebアプリケーション。BtoC/BtoBのサービス、業務システム等。

### ドキュメント構成

```
docs/
├── index.md
├── 01-requirements/
│   ├── index.md
│   ├── project-overview/
│   │   ├── background.md
│   │   ├── scope.md
│   │   └── stakeholders.md
│   ├── business-requirements/
│   │   ├── business-flow.md
│   │   ├── business-rules.md
│   │   └── kpi.md
│   ├── functional-requirements/
│   │   └── {機能モジュール名}.md          # 機能ごとに1ファイル
│   ├── non-functional-requirements/
│   │   ├── performance.md
│   │   ├── availability.md
│   │   ├── scalability.md
│   │   ├── security.md
│   │   └── compliance.md
│   └── use-cases/
│       └── {ユースケース名}.md            # ユースケースごとに1ファイル
├── 02-technical-design/
│   ├── index.md
│   ├── architecture/
│   │   ├── architecture-pattern.md
│   │   ├── technology-stack.md
│   │   └── system-context.md
│   ├── infrastructure/
│   │   ├── cloud-architecture.md
│   │   ├── network.md
│   │   └── ci-cd.md
│   ├── security/
│   │   ├── authentication.md
│   │   ├── authorization.md
│   │   ├── data-protection.md
│   │   └── waf-ddos.md
│   ├── data/
│   │   ├── database-selection.md
│   │   ├── caching-strategy.md
│   │   └── file-storage.md
│   └── operations/
│       ├── monitoring.md
│       ├── logging.md
│       └── disaster-recovery.md
├── 03-basic-design/
│   ├── index.md
│   ├── system-architecture/
│   │   ├── system-overview.md
│   │   ├── module-structure.md
│   │   └── external-interfaces.md
│   ├── screen-design/
│   │   ├── screen-list.md
│   │   ├── screen-transition.md
│   │   └── screen-definitions/
│   │       └── {画面名}.md            # 画面ごとに1ファイル
│   ├── data-model/
│   │   ├── er-diagram.md
│   │   ├── master-data.md
│   │   └── table-definitions/
│   │       └── {テーブル名}.md         # テーブルごとに1ファイル
│   ├── api-design/
│   │   ├── api-overview.md
│   │   └── api-definitions/
│   │       └── {ドメイン名}-api.md     # ドメインごとに1ファイル
│   └── batch-design/
│       ├── batch-list.md
│       └── batch-definitions/
│           └── {バッチ名}.md           # バッチごとに1ファイル
└── 04-detailed-design/
    ├── index.md
    ├── component-design/
    │   ├── frontend/
    │   │   ├── component-tree.md
    │   │   ├── state-management.md
    │   │   └── routing.md
    │   └── backend/
    │       ├── domain-model.md
    │       ├── service-layer.md
    │       └── repository-layer.md
    ├── sequence-diagrams/
    │   └── {業務フロー名}.md
    ├── error-handling/
    │   ├── error-code-list.md
    │   ├── error-response-format.md
    │   └── exception-handling.md
    └── testing/
        ├── test-strategy.md
        ├── test-data.md
        └── test-cases/
            ├── unit-test.md
            ├── integration-test.md
            └── e2e-test.md
```

### 成果物一覧テンプレート（docs/index.md用）

フェーズ1: 要件定義

| # | 成果物 | 説明 | ステータス |
|---|--------|------|-----------|
| 1 | プロジェクト概要 | background.md / scope.md / stakeholders.md | 未着手 |
| 2 | ビジネス要件 | business-flow.md / business-rules.md / kpi.md | 未着手 |
| 3 | 機能要件 | {機能モジュール名}.md（機能ごとに1ファイル） | 未着手 |
| 4 | 非機能要件 | performance.md / availability.md / scalability.md / security.md / compliance.md | 未着手 |
| 5 | ユースケース | {ユースケース名}.md（ユースケースごとに1ファイル） | 未着手 |

フェーズ2: 方式設計

| # | 成果物 | 説明 | ステータス |
|---|--------|------|-----------|
| 6 | アーキテクチャ方式 | architecture-pattern.md / technology-stack.md / system-context.md | 未着手 |
| 7 | インフラ方式 | cloud-architecture.md / network.md / ci-cd.md | 未着手 |
| 8 | セキュリティ方式 | authentication.md / authorization.md / data-protection.md / waf-ddos.md | 未着手 |
| 9 | データ方式 | database-selection.md / caching-strategy.md / file-storage.md | 未着手 |
| 10 | 運用方式 | monitoring.md / logging.md / disaster-recovery.md | 未着手 |

フェーズ3: 基本設計

| # | 成果物 | 説明 | ステータス |
|---|--------|------|-----------|
| 11 | システム構成 | system-overview.md / module-structure.md / external-interfaces.md | 未着手 |
| 12 | 画面設計 | screen-list.md / screen-transition.md / 画面定義 N件 | 未着手 |
| 13 | データモデル | er-diagram.md / master-data.md / テーブル定義 N件 | 未着手 |
| 14 | API設計 | api-overview.md / API定義 N件 | 未着手 |
| 15 | バッチ設計 | batch-list.md / バッチ定義 N件 | 未着手 |

フェーズ4: 詳細設計

| # | 成果物 | 説明 | ステータス |
|---|--------|------|-----------|
| 16 | コンポーネント設計 | FE: component-tree / routing / state-management、BE: domain-model / service-layer / repository-layer | 未着手 |
| 17 | シーケンス図 | 主要業務フローのシーケンス（3~5件） | 未着手 |
| 18 | エラーハンドリング | error-code-list.md / error-response-format.md / exception-handling.md | 未着手 |
| 19 | テスト設計 | test-strategy.md / test-data.md / unit-test.md / integration-test.md / e2e-test.md | 未着手 |

### nav構成（mkdocs.yml用）

固定部分はそのまま使用し、`{...}` プレースホルダー部分をヒアリング結果に基づいて具体化する。

```yaml
nav:
  - ホーム: index.md
  - 要件定義:
      - 概要: 01-requirements/index.md
      - プロジェクト概要:
          - 背景・目的: 01-requirements/project-overview/background.md
          - スコープ定義: 01-requirements/project-overview/scope.md
          - ステークホルダー: 01-requirements/project-overview/stakeholders.md
      - ビジネス要件:
          - 業務フロー: 01-requirements/business-requirements/business-flow.md
          - ビジネスルール: 01-requirements/business-requirements/business-rules.md
          - KPI・目標指標: 01-requirements/business-requirements/kpi.md
      - 機能要件:
          # ヒアリングで特定した機能ごとに追加
          - {機能名}: 01-requirements/functional-requirements/{機能名}.md
      - 非機能要件:
          - 性能要件: 01-requirements/non-functional-requirements/performance.md
          - 可用性要件: 01-requirements/non-functional-requirements/availability.md
          - セキュリティ要件: 01-requirements/non-functional-requirements/security.md
          - 拡張性要件: 01-requirements/non-functional-requirements/scalability.md
          - 法規制・コンプライアンス: 01-requirements/non-functional-requirements/compliance.md
      - ユースケース:
          # ヒアリングで特定したユースケースごとに追加
          - {ユースケース名}: 01-requirements/use-cases/{ユースケース名}.md
  - 方式設計:
      - 概要: 02-technical-design/index.md
      - アーキテクチャ方式:
          - アーキテクチャパターン: 02-technical-design/architecture/architecture-pattern.md
          - 技術スタック選定: 02-technical-design/architecture/technology-stack.md
          - システムコンテキスト図: 02-technical-design/architecture/system-context.md
      - インフラ方式:
          - クラウド構成: 02-technical-design/infrastructure/cloud-architecture.md
          - ネットワーク設計: 02-technical-design/infrastructure/network.md
          - CI/CD方式: 02-technical-design/infrastructure/ci-cd.md
      - セキュリティ方式:
          - 認証方式: 02-technical-design/security/authentication.md
          - 認可方式: 02-technical-design/security/authorization.md
          - データ保護: 02-technical-design/security/data-protection.md
          - WAF・DDoS対策: 02-technical-design/security/waf-ddos.md
      - データ方式:
          - DB選定: 02-technical-design/data/database-selection.md
          - キャッシュ戦略: 02-technical-design/data/caching-strategy.md
          - ファイルストレージ: 02-technical-design/data/file-storage.md
      - 運用方式:
          - 監視方式: 02-technical-design/operations/monitoring.md
          - ログ方式: 02-technical-design/operations/logging.md
          - DR方式: 02-technical-design/operations/disaster-recovery.md
  - 基本設計:
      - 概要: 03-basic-design/index.md
      - システム構成:
          - システム全体像: 03-basic-design/system-architecture/system-overview.md
          - モジュール構成: 03-basic-design/system-architecture/module-structure.md
          - 外部インターフェース: 03-basic-design/system-architecture/external-interfaces.md
      - 画面設計:
          - 画面一覧: 03-basic-design/screen-design/screen-list.md
          - 画面遷移図: 03-basic-design/screen-design/screen-transition.md
          - 画面定義: 
              # ヒアリングで特定した画面ごとに追加（要件定義後に確定するため初期時点では省略可）
              - {画面名}: 03-basic-design/screen-design/screen-definitions/{画面名}.md
      - データモデル:
          - ER図: 03-basic-design/data-model/er-diagram.md
          - マスタデータ定義: 03-basic-design/data-model/master-data.md
          - テーブル定義:
              # ヒアリングで特定したテーブルごとに追加（要件定義後に確定するため初期時点では省略可）
              - {テーブル名}: 03-basic-design/data-model/table-definitions/{テーブル名}.md
      - API設計:
          - API設計方針: 03-basic-design/api-design/api-overview.md
          - API定義:
              # ヒアリングで特定したドメインごとに追加（要件定義後に確定するため初期時点では省略可）
              - {ドメイン名}API: 03-basic-design/api-design/api-definitions/{ドメイン名}-api.md
      - バッチ設計:
          - バッチ一覧: 03-basic-design/batch-design/batch-list.md
          - バッチ定義:
              # ヒアリングで特定したバッチごとに追加（要件定義後に確定するため初期時点では省略可）
              - {バッチ名}: 03-basic-design/batch-design/batch-definitions/{バッチ名}.md
  - 詳細設計:
      - 概要: 04-detailed-design/index.md
      - コンポーネント設計:
          - フロントエンド:
              - コンポーネントツリー: 04-detailed-design/component-design/frontend/component-tree.md
              - 状態管理: 04-detailed-design/component-design/frontend/state-management.md
              - ルーティング: 04-detailed-design/component-design/frontend/routing.md
          - バックエンド:
              - サービス層: 04-detailed-design/component-design/backend/service-layer.md
              - リポジトリ層: 04-detailed-design/component-design/backend/repository-layer.md
              - ドメインモデル: 04-detailed-design/component-design/backend/domain-model.md
      - シーケンス図:
          # ヒアリングで特定した主要業務フローごとに追加
          - {フロー名}: 04-detailed-design/sequence-diagrams/{フロー名}.md
      - エラーハンドリング:
          - エラーコード一覧: 04-detailed-design/error-handling/error-code-list.md
          - エラーレスポンス形式: 04-detailed-design/error-handling/error-response-format.md
          - 例外処理方針: 04-detailed-design/error-handling/exception-handling.md
      - テスト設計:
          - テスト戦略: 04-detailed-design/testing/test-strategy.md
          - テストケース:
              - 単体テスト: 04-detailed-design/testing/test-cases/unit-test.md
              - 結合テスト: 04-detailed-design/testing/test-cases/integration-test.md
              - E2Eテスト: 04-detailed-design/testing/test-cases/e2e-test.md
          - テストデータ: 04-detailed-design/testing/test-data.md
```

**動的生成のルール:**

- `# ヒアリングで...` コメント箇所はヒアリング結果に基づいてエントリを追加する
- 索引名（左側）は日本語で、ファイルパス（右側）はケバブケースで記載する
- 画面定義・テーブル定義・API定義・バッチ定義・シーケンス図の具体的なエントリ数はプロジェクトに応じて決定する
- テーブル定義・バッチ定義は要件定義の後に具体化されるため、初期時点ではプレースホルダーのみでもよい
