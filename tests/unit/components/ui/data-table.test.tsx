import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type Item = { id: number; name: string; status: string };

const columns: ColumnDef<Item, string>[] = [
  {
    accessorKey: "name",
    header: "名前",
  },
  {
    accessorKey: "status",
    header: "ステータス",
  },
];

const makeData = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `アイテム${i + 1}`,
    status: i % 2 === 0 ? "完了" : "未着手",
  }));

describe("DataTable", () => {
  it("データが表示される", () => {
    render(<DataTable columns={columns} data={makeData(3)} />);
    expect(screen.getByText("アイテム1")).toBeInTheDocument();
    expect(screen.getByText("アイテム2")).toBeInTheDocument();
    expect(screen.getByText("アイテム3")).toBeInTheDocument();
  });

  it("データが0件のとき「データがありません」を表示する", () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });

  it("ヘッダーが表示される", () => {
    render(<DataTable columns={columns} data={makeData(1)} />);
    expect(screen.getByText("名前")).toBeInTheDocument();
    expect(screen.getByText("ステータス")).toBeInTheDocument();
  });

  describe("ページネーション", () => {
    it("pageSize を超えるデータがある場合にページネーションが表示される", () => {
      render(<DataTable columns={columns} data={makeData(15)} pageSize={10} />);
      expect(screen.getByLabelText("次のページ")).toBeInTheDocument();
    });

    it("データ件数が pageSize 以下の場合はページネーションが表示されない", () => {
      render(<DataTable columns={columns} data={makeData(5)} pageSize={10} />);
      expect(screen.queryByLabelText("次のページ")).not.toBeInTheDocument();
    });

    it("「次のページ」ボタンクリックで次ページに遷移する", async () => {
      render(<DataTable columns={columns} data={makeData(15)} pageSize={10} />);
      // 初期状態では1ページ目のデータ
      expect(screen.getByText("アイテム1")).toBeInTheDocument();
      expect(screen.queryByText("アイテム11")).not.toBeInTheDocument();
      // 次ページへ
      await userEvent.click(screen.getByLabelText("次のページ"));
      expect(screen.queryByText("アイテム1")).not.toBeInTheDocument();
      expect(screen.getByText("アイテム11")).toBeInTheDocument();
    });

    it("「前のページ」ボタンクリックで前ページに戻る", async () => {
      render(<DataTable columns={columns} data={makeData(15)} pageSize={10} />);
      await userEvent.click(screen.getByLabelText("次のページ"));
      await userEvent.click(screen.getByLabelText("前のページ"));
      expect(screen.getByText("アイテム1")).toBeInTheDocument();
    });

    it("pagination=false のときページネーションUIが表示されない", () => {
      render(<DataTable columns={columns} data={makeData(15)} pagination={false} pageSize={20} />);
      expect(screen.getByText("アイテム1")).toBeInTheDocument();
      expect(screen.getByText("アイテム15")).toBeInTheDocument();
      expect(screen.queryByLabelText("次のページ")).not.toBeInTheDocument();
    });
  });
});
