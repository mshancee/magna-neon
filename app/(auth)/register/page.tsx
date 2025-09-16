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

// of course, you can customize the metadata as needed
const metadata = {
  title: "Register - Magna coders",
  description: "Create a new account on Magna coders",
};

export { metadata };
