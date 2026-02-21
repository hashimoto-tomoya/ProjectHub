import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const defaultProps = {
  open: true,
  title: "確認タイトル",
  description: "本当に実行しますか？",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe("ConfirmDialog", () => {
  it("open=true のとき、タイトルと説明が表示される", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("確認タイトル")).toBeInTheDocument();
    expect(screen.getByText("本当に実行しますか？")).toBeInTheDocument();
  });

  it("open=false のとき、ダイアログが表示されない", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("確認タイトル")).not.toBeInTheDocument();
  });

  it("確認ボタンをクリックすると onConfirm が呼ばれる", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByText("確認"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンをクリックすると onCancel が呼ばれる", async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByText("キャンセル"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("confirmLabel prop でボタンラベルをカスタマイズできる", () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="削除する" />);
    expect(screen.getByText("削除する")).toBeInTheDocument();
  });

  it("cancelLabel prop でボタンラベルをカスタマイズできる", () => {
    render(<ConfirmDialog {...defaultProps} cancelLabel="戻る" />);
    expect(screen.getByText("戻る")).toBeInTheDocument();
  });
});
