"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function ChangePasswordForm() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const currentPassword = (formData.get("currentPassword") as string) ?? "";
    const newPassword = (formData.get("newPassword") as string) ?? "";
    const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

    // クライアントサイドバリデーション
    const errors: FieldErrors = {};

    if (!currentPassword) {
      errors.currentPassword = "現在のパスワードを入力してください";
    }

    if (!newPassword) {
      errors.newPassword = "新しいパスワードを入力してください";
    } else if (newPassword.length < 8) {
      errors.newPassword = "パスワードは8文字以上で入力してください";
    } else if (!/[a-zA-Z]/.test(newPassword)) {
      errors.newPassword = "パスワードには英字を1文字以上含めてください";
    } else if (!/[0-9]/.test(newPassword)) {
      errors.newPassword = "パスワードには数字を1文字以上含めてください";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "確認パスワードを入力してください";
    } else if (newPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "新しいパスワードが一致しません";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setIsLoading(true);
    try {
      const response = await fetch("/api/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error?.message ?? "パスワードの変更に失敗しました");
        return;
      }

      if (session?.user?.mustChangePassword) {
        await update({ mustChangePassword: false });
        router.push("/projects");
      } else {
        setSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">パスワード変更</CardTitle>
        <CardDescription>現在のパスワードと新しいパスワードを入力してください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* サーバーエラー */}
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 成功メッセージ */}
            {success && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700"
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>パスワードを変更しました</span>
              </div>
            )}

            {/* 現在のパスワード */}
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">現在のパスワード</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                disabled={isLoading || success}
                aria-invalid={!!fieldErrors.currentPassword}
                aria-describedby={fieldErrors.currentPassword ? "currentPassword-error" : undefined}
              />
              {fieldErrors.currentPassword && (
                <p id="currentPassword-error" className="text-sm text-red-600">
                  {fieldErrors.currentPassword}
                </p>
              )}
            </div>

            {/* 新しいパスワード */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">新しいパスワード</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                disabled={isLoading || success}
                aria-invalid={!!fieldErrors.newPassword}
                aria-describedby={fieldErrors.newPassword ? "newPassword-error" : undefined}
              />
              {fieldErrors.newPassword && (
                <p id="newPassword-error" className="text-sm text-red-600">
                  {fieldErrors.newPassword}
                </p>
              )}
            </div>

            {/* 新しいパスワード（確認） */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isLoading || success}
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
              />
              {fieldErrors.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* 送信ボタン */}
            <Button type="submit" className="w-full" disabled={isLoading || success}>
              {isLoading ? "変更中..." : "パスワードを変更"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
