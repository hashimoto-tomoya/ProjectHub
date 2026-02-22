import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WbsTreeTable } from "@/components/features/wbs-tree-table";
import type { TaskResponse } from "@/lib/types/api";

// TanStack Query のモック
vi.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// next/navigation のモック
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// global fetch のモック
vi.stubGlobal("fetch", vi.fn());

const makeTasks = (): TaskResponse[] => [
  {
    id: 1,
    parentTaskId: null,
    level: 1,
    name: "大項目A",
    assigneeId: 10,
    assigneeName: "山田太郎",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    status: "進行中",
    plannedHours: 100,
    actualHours: 40,
    displayOrder: 0,
  },
  {
    id: 2,
    parentTaskId: 1,
    level: 2,
    name: "中項目A-1",
    assigneeId: 10,
    assigneeName: "山田太郎",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    status: "完了",
    plannedHours: 50,
    actualHours: 50,
    displayOrder: 0,
  },
  {
    id: 3,
    parentTaskId: 1,
    level: 2,
    name: "中項目A-2",
    assigneeId: null,
    assigneeName: null,
    startDate: "2026-02-01",
    endDate: "2026-03-31",
    status: "未着手",
    plannedHours: 50,
    actualHours: 0,
    displayOrder: 1,
  },
  {
    id: 10,
    parentTaskId: null,
    level: 1,
    name: "大項目B",
    assigneeId: null,
    assigneeName: null,
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    status: "未着手",
    plannedHours: 80,
    actualHours: 0,
    displayOrder: 1,
  },
];

describe("WbsTreeTable", () => {
  const mockOnAdd = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // 階層ツリー表示テスト
  // ============================================================

  describe("階層ツリー表示", () => {
    it("大項目・中項目が表示される", () => {
      render(
        <WbsTreeTable
          tasks={makeTasks()}
          projectId={1}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("大項目A")).toBeInTheDocument();
      expect(screen.getByText("中項目A-1")).toBeInTheDocument();
      expect(screen.getByText("中項目A-2")).toBeInTheDocument();
      expect(screen.getByText("大項目B")).toBeInTheDocument();
    });

    it("担当者名が表示される", () => {
      render(
        <WbsTreeTable
          tasks={makeTasks()}
          projectId={1}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText("山田太郎")).toHaveLength(2);
    });

    it("予定工数・実績工数が表示される", () => {
      render(
        <WbsTreeTable
          tasks={makeTasks()}
          projectId={1}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // 予定工数 100h の表示
      expect(screen.getByText("100")).toBeInTheDocument();
      // 実績工数 40h の表示
      expect(screen.getByText("40")).toBeInTheDocument();
    });

    it("空のタスク一覧の場合は適切なメッセージが表示される", () => {
      render(
        <WbsTreeTable
          tasks={[]}
          projectId={1}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/タスクがありません/i)).toBeInTheDocument();
    });
  });

  // ============================================================
  // 折りたたみテスト
  // ============================================================

  describe("折りたたみ", () => {
    it("大項目の折りたたみボタンをクリックすると子タスクが非表示になる", async () => {
      render(
        <WbsTreeTable
          tasks={makeTasks()}
          projectId={1}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // 初期状態では中項目が表示されている
      expect(screen.getByText("中項目A-1")).toBeInTheDocument();

      // 大項目Aの折りたたみボタンをクリック
      const toggleButtons = screen.getAllByRole("button", { name: /折りたたみ|展開/i });
      await userEvent.click(toggleButtons[0]);

      // 子タスクが非表示になる
      expect(screen.queryByText("中項目A-1")).not.toBeInTheDocument();
      expect(screen.queryByText("中項目A-2")).not.toBeInTheDocument();
    });

    it("折りたたみ後に再クリックすると子タスクが再表示される", async () => {
      render(
        <WbsTreeTable
          tasks={makeTasks()}
          projectId={1}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const toggleButtons = screen.getAllByRole("button", { name: /折りたたみ|展開/i });

      // 折りたたむ
      await userEvent.click(toggleButtons[0]);
      expect(screen.queryByText("中項目A-1")).not.toBeInTheDocument();

      // 再展開（ボタンを再取得）
      const expandButtons = screen.getAllByRole("button", { name: /折りたたみ|展開/i });
      await userEvent.click(expandButtons[0]);
      expect(screen.getByText("中項目A-1")).toBeInTheDocument();
    });
  });

  // ============================================================
  // タスク追加ボタン
  // ============================================================

  describe("タスク操作", () => {
    it("「+ タスク追加」ボタンをクリックすると onAdd が呼ばれる", async () => {
      render(
        <WbsTreeTable
          tasks={makeTasks()}
          projectId={1}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      await userEvent.click(screen.getByRole("button", { name: /タスク追加/i }));

      expect(mockOnAdd).toHaveBeenCalled();
    });
  });
});
