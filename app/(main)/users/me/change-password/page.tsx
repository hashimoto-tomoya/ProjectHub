import { ChangePasswordForm } from "@/components/features/change-password-form";

export const metadata = {
  title: "パスワード変更 | ProjectHub",
};

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <ChangePasswordForm />
    </div>
  );
}
