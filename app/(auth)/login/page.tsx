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

// of course, you can customize the metadata as needed
const metadata = {
  title: "Sign In - Magna coders",
  description: "Sign in to access your account on Magna coders.",
};

export { metadata };
