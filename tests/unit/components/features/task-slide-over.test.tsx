import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskSlideOver } from "@/components/features/task-slide-over";
import type { TaskResponse } from "@/lib/types/api";

// TanStack Query のモック
const mockMutate = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

// global fetch のモック
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const sampleTask: TaskResponse = {
  id: 1,
  parentTaskId: null,
  level: 1,
  name: "既存タスク名",
  assigneeId: null,
  assigneeName: null,
  startDate: "2026-01-01",
  endDate: "2026-03-31",
  status: "未着手",
  plannedHours: 10,
  actualHours: 0,
  displayOrder: 0,
};

describe("TaskSlideOver", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // 登録モードのテスト
  // ============================================================

  describe("登録モード（task=undefined）", () => {
    it("スライドオーバーが開いているとき「タスク登録」タイトルが表示される", () => {
      render(
        <TaskSlideOver open={true} projectId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      );

      expect(screen.getByText("タスク登録")).toBeInTheDocument();
    });

    it("必須項目（タスク名）が空のまま送信するとバリデーションエラーが表示される", async () => {
      render(
        <TaskSlideOver open={true} projectId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      );

      const saveButton = screen.getByRole("button", { name: /保存/i });
      await userEvent.click(saveButton);

      expect(screen.getByText(/タスク名を入力してください/i)).toBeInTheDocument();
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("タスク名を入力して保存ボタンをクリックすると mutate が呼ばれる", async () => {
      render(
        <TaskSlideOver open={true} projectId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      );

      await userEvent.type(screen.getByLabelText(/タスク名/i), "新しいタスク");
      await userEvent.click(screen.getByRole("button", { name: /保存/i }));

      expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ name: "新しいタスク" }));
    });

    it("キャンセルボタンクリックで onClose が呼ばれる", async () => {
      render(
        <TaskSlideOver open={true} projectId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      );

      await userEvent.click(screen.getByRole("button", { name: /キャンセル/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // ============================================================
  // 編集モードのテスト
  // ============================================================

  describe("編集モード（task が指定されている）", () => {
    it("「タスク編集」タイトルが表示される", () => {
      render(
        <TaskSlideOver
          open={true}
          projectId={1}
          task={sampleTask}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText("タスク編集")).toBeInTheDocument();
    });

    it("既存タスク名がフォームに初期値として表示される", () => {
      render(
        <TaskSlideOver
          open={true}
          projectId={1}
          task={sampleTask}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/タスク名/i) as HTMLInputElement;
      expect(nameInput.value).toBe("既存タスク名");
    });

    it("既存の予定工数がフォームに初期値として表示される", () => {
      render(
        <TaskSlideOver
          open={true}
          projectId={1}
          task={sampleTask}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const hoursInput = screen.getByLabelText(/予定工数/i) as HTMLInputElement;
      expect(Number(hoursInput.value)).toBe(10);
    });
  });

  // ============================================================
  // 非表示テスト
  // ============================================================

  it("open=false のときは表示されない", () => {
    render(
      <TaskSlideOver open={false} projectId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    expect(screen.queryByText("タスク登録")).not.toBeInTheDocument();
  });
});
