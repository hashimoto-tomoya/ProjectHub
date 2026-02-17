# mkdocs.yml 設定テンプレート

## 基本テンプレート

以下のテンプレートを元にプロジェクトに合わせて `site_name`、`site_description`、`nav` を調整する。

```yaml
site_name: {プロジェクト名} 設計ドキュメント
site_description: {プロジェクト説明}
site_url: ""

theme:
  name: material
  language: ja
  palette:
    - scheme: default
      primary: indigo
      accent: pink
      toggle:
        icon: material/brightness-7
        name: ダークモードに切り替え
    - scheme: slate
      primary: indigo
      accent: pink
      toggle:
        icon: material/brightness-4
        name: ライトモードに切り替え
  features:
    - navigation.tabs
    - navigation.sections
    - navigation.expand
    - navigation.top
    - toc.integrate
    - search.suggest
    - content.tabs.link

markdown_extensions:
  - admonition
  - pymdownx.details
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
  - pymdownx.tabbed:
      alternate_style: true
  - pymdownx.tasklist:
      custom_checkbox: true
  - pymdownx.emoji:
      emoji_index: !!python/name:material.extensions.emoji.twemoji
      emoji_generator: !!python/name:material.extensions.emoji.to_svg
  - tables
  - attr_list
  - md_in_html
  - toc:
      permalink: true

plugins:
  - search

nav:
  # scale-presets.md の該当規模のnav構成を参照して生成する
```

## nav構成のルール

- トップレベルは「ホーム」「要件定義」「方式設計」「基本設計」「詳細設計」の5エントリ
- 各フェーズ内はカテゴリ → サブカテゴリ → 個別ファイルの3階層まで
- 個別ファイルが多い場合（画面定義、テーブル定義等）はユーザー種別やドメインでグルーピングする
- ファイルパスはすべて `docs/` からの相対パス
