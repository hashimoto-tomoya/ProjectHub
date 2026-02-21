import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePasswordForm } from "@/components/features/change-password-form";

// next/navigation のモック
const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

// global fetch のモック
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("現在のパスワード・新しいパスワード・確認パスワードのフォームが表示される", () => {
    render(<ChangePasswordForm />);

    expect(screen.getByLabelText("現在のパスワード")).toBeInTheDocument();
    expect(screen.getByLabelText("新しいパスワード")).toBeInTheDocument();
    expect(screen.getByLabelText("新しいパスワード（確認）")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "パスワードを変更" })).toBeInTheDocument();
  });

  it("現在のパスワードが空の場合はバリデーションエラーが表示される", async () => {
    render(<ChangePasswordForm />);

    await userEvent.type(screen.getByLabelText("新しいパスワード"), "NewPass12");
    await userEvent.type(screen.getByLabelText("新しいパスワード（確認）"), "NewPass12");
    await userEvent.click(screen.getByRole("button", { name: "パスワードを変更" }));

    expect(await screen.findByText("現在のパスワードを入力してください")).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("新しいパスワードがポリシーを満たさない場合はエラーが表示される（8文字未満）", async () => {
    render(<ChangePasswordForm />);

    await userEvent.type(screen.getByLabelText("現在のパスワード"), "CurrentP1");
    await userEvent.type(screen.getByLabelText("新しいパスワード"), "Short1");
    await userEvent.type(screen.getByLabelText("新しいパスワード（確認）"), "Short1");
    await userEvent.click(screen.getByRole("button", { name: "パスワードを変更" }));

    expect(await screen.findByText("パスワードは8文字以上で入力してください")).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("新しいパスワードが数字のみの場合はエラーが表示される", async () => {
    render(<ChangePasswordForm />);

    await userEvent.type(screen.getByLabelText("現在のパスワード"), "CurrentP1");
    await userEvent.type(screen.getByLabelText("新しいパスワード"), "12345678");
    await userEvent.type(screen.getByLabelText("新しいパスワード（確認）"), "12345678");
    await userEvent.click(screen.getByRole("button", { name: "パスワードを変更" }));

    expect(
      await screen.findByText("パスワードには英字を1文字以上含めてください")
    ).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("確認パスワードが一致しない場合はエラーが表示される", async () => {
    render(<ChangePasswordForm />);

    await userEvent.type(screen.getByLabelText("現在のパスワード"), "CurrentP1");
    await userEvent.type(screen.getByLabelText("新しいパスワード"), "NewPass12");
    await userEvent.type(screen.getByLabelText("新しいパスワード（確認）"), "DifferentP1");
    await userEvent.click(screen.getByRole("button", { name: "パスワードを変更" }));

    expect(await screen.findByText("新しいパスワードが一致しません")).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("API からエラーが返った場合（現在のPW誤り）はエラーメッセージが表示される", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: "現在のパスワードが正しくありません" } }),
    });

    render(<ChangePasswordForm />);

    await userEvent.type(screen.getByLabelText("現在のパスワード"), "WrongPass1");
    await userEvent.type(screen.getByLabelText("新しいパスワード"), "NewPass12");
    await userEvent.type(screen.getByLabelText("新しいパスワード（確認）"), "NewPass12");
    await userEvent.click(screen.getByRole("button", { name: "パスワードを変更" }));

    expect(await screen.findByText("現在のパスワードが正しくありません")).toBeInTheDocument();
  });

  it("成功時にサクセスメッセージが表示される", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
    });

    render(<ChangePasswordForm />);

    await userEvent.type(screen.getByLabelText("現在のパスワード"), "CurrentP1");
    await userEvent.type(screen.getByLabelText("新しいパスワード"), "NewPass12");
    await userEvent.type(screen.getByLabelText("新しいパスワード（確認）"), "NewPass12");
    await userEvent.click(screen.getByRole("button", { name: "パスワードを変更" }));

    expect(await screen.findByText("パスワードを変更しました")).toBeInTheDocument();
  });

  it("PUT /api/users/me/password が正しいデータで呼ばれる", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
    });

    render(<ChangePasswordForm />);

    await userEvent.type(screen.getByLabelText("現在のパスワード"), "CurrentP1");
    await userEvent.type(screen.getByLabelText("新しいパスワード"), "NewPass12");
    await userEvent.type(screen.getByLabelText("新しいパスワード（確認）"), "NewPass12");
    await userEvent.click(screen.getByRole("button", { name: "パスワードを変更" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: "CurrentP1",
          newPassword: "NewPass12",
        }),
      });
    });
  });
});
