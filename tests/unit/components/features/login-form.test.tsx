import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/features/login-form";

// next-auth/react のモック
const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

// next/navigation のモック
const mockRouterPush = vi.fn();
const mockSearchParamsGet = vi.fn().mockReturnValue(null);
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsGet.mockReturnValue(null);
  });

  it("メールアドレスとパスワードの入力フォームが表示される", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
  });

  it("メールアドレスが空の場合はバリデーションエラーが表示される", async () => {
    render(<LoginForm />);

    await userEvent.clear(screen.getByLabelText("メールアドレス"));
    await userEvent.type(screen.getByLabelText("パスワード"), "Password1");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    expect(await screen.findByText("メールアドレスを入力してください")).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("パスワードが空の場合はバリデーションエラーが表示される", async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@test.local");
    await userEvent.clear(screen.getByLabelText("パスワード"));
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    expect(await screen.findByText("パスワードを入力してください")).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("認証情報が誤っている場合はエラーメッセージが表示される", async () => {
    mockSignIn.mockResolvedValue({ error: "CredentialsSignin", ok: false });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@test.local");
    await userEvent.type(screen.getByLabelText("パスワード"), "WrongPass1");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    expect(
      await screen.findByText("メールアドレスまたはパスワードが正しくありません")
    ).toBeInTheDocument();
  });

  it("正常な認証情報でログインするとプロジェクト一覧にリダイレクトされる", async () => {
    mockSignIn.mockResolvedValue({ error: null, ok: true });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@test.local");
    await userEvent.type(screen.getByLabelText("パスワード"), "Password1");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/projects");
    });
  });

  it("signIn が credentials プロバイダで呼ばれる", async () => {
    mockSignIn.mockResolvedValue({ error: null, ok: true });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@test.local");
    await userEvent.type(screen.getByLabelText("パスワード"), "Password1");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        "credentials",
        expect.objectContaining({
          email: "test@test.local",
          password: "Password1",
          redirect: false,
        })
      );
    });
  });

  it("外部URLの callbackUrl は /projects にフォールバックされる", async () => {
    mockSignIn.mockResolvedValue({ error: null, ok: true });
    mockSearchParamsGet.mockReturnValueOnce("https://phishing.com");

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@test.local");
    await userEvent.type(screen.getByLabelText("パスワード"), "Password1");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/projects");
    });
  });

  it("相対パスの callbackUrl は使用される", async () => {
    mockSignIn.mockResolvedValue({ error: null, ok: true });
    mockSearchParamsGet.mockReturnValueOnce("/projects/123");

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@test.local");
    await userEvent.type(screen.getByLabelText("パスワード"), "Password1");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/projects/123");
    });
  });

  it("ログイン処理中はボタンが無効化される", async () => {
    let resolveSignIn: (value: unknown) => void;
    mockSignIn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        })
    );

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@test.local");
    await userEvent.type(screen.getByLabelText("パスワード"), "Password1");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    // ローディング中はボタンが無効化される
    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    // クリーンアップ
    resolveSignIn!({ error: null, ok: true });
  });
});
