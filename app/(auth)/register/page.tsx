import { Suspense } from "react";
import SignupForm from "@/components/auth/signup-form";
import AuthLoading from "@/components/auth/auth-loading";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={<AuthLoading />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
