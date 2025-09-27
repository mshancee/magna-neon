import { Suspense } from "react";
import SetupPasswordForm from "@/components/auth/setup-password-form";
import AuthLoading from "@/components/auth/auth-loading";

export default function SetupPasswordPage() {
  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={<AuthLoading />}>
        <SetupPasswordForm />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: "Setup Password - Magna Coders",
  description:
    "Set up a password for your account to enable email/password login.",
};
