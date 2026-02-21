import { Suspense } from "react";
import { LoginForm } from "@/components/features/login-form";

export const metadata = {
  title: "ログイン | ProjectHub",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
