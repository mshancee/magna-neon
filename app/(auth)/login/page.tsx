import { Suspense } from "react";
import SigninForm from "@/components/auth/signin-form";
import AuthLoading from "@/components/auth/auth-loading";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={<AuthLoading />}>
        <SigninForm />
      </Suspense>
    </div>
  );
}
