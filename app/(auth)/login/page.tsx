import { Suspense } from "react";
import SigninForm from "@/components/auth/signin-form";
import AuthLoading from "@/components/auth/auth-loading";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex justify-center px-4 bg-black">
      <Image
        src="/images/background.jpg"
        alt="Background"
        fill
        priority
        className="absolute inset-0 object-cover opacity-20 transition-opacity duration-500"
      />
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
