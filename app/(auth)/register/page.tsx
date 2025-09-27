import { Suspense } from "react";
import SignupForm from "@/components/auth/signup-form";
import AuthLoading from "@/components/auth/auth-loading";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="min-h-screen px-4 flex justify-center bg-black">
      <Image
        src="/images/background.jpg"
        alt="Background"
        fill
        priority
        className="absolute inset-0 object-cover opacity-20 transition-opacity duration-500"
      />
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
