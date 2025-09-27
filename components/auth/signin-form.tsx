"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Shield,
  Zap,
  Users,
  Star,
  ArrowRight,
  Chrome,
  Github,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { signInSchema } from "@/lib/validations/auth";
import Image from "next/image";
import { signIn } from "next-auth/react";

type SignInFormData = {
  email: string;
  password: string;
};

export default function SigninForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    if (urlError) {
      setErrorMessage(getErrorMessage(urlError));
    }
  }, [urlError]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const getErrorMessage = (error: string | null): string => {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid email or password. Please try again.";
      case "Configuration":
        return "There was a problem with the server configuration.";
      default:
        return error ? "An error occurred during sign in." : "";
    }
  };

  const onSubmit = async (data: SignInFormData) => {
    clearErrors();
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("email", data.email.toLowerCase().trim());
      formData.append("password", data.password);

      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl) {
        formData.append("callbackUrl", callbackUrl);
      }

      const { signInAction } = await import("@/app/(auth)/actions");
      const result = await signInAction(formData);

      if (result && !result.success) {
        if (result.error === "OAUTH_ONLY_USER") {
          setErrorMessage(
            result.message ||
              "This account was created with GitHub. Please sign in with GitHub."
          );
        } else {
          setErrorMessage(result.error || "Invalid email or password");
        }
      } else {
        setErrorMessage("Invalid email or password");
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        return;
      }

      console.error("Signin error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleInputChange = (field: keyof SignInFormData) => {
    if (errors[field]) {
      clearErrors(field);
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      await signIn("github", { callbackUrl });
    } catch (error) {
      console.error("GitHub sign-in error:", error);
      setErrorMessage("Failed to sign in with GitHub. Please try again.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Section - Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <div className="relative z-10 flex flex-col justify-center px-16 py-12 text-white w-full bg-tranparent">
          <Link href="/" className="text-2xl font-bold mb-12 flex items-center">
            <Image src="/logo.png" alt="logo" height={48} width={48} />
            Magna Coders
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-md"
          >
            <h1 className="text-4xl font-bold mb-6">Welcome back</h1>
            <p className="text-gray-300 text-lg mb-10">
              Sign in to access your personalized dashboard, manage your
              account, and continue your journey with us.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-[#E70008]/20 p-2 rounded-full mr-4">
                  <Users className="h-5 w-5 text-[#E70008]" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Join our community</h3>
                  <p className="text-gray-400">
                    Connect with thousands of users worldwide
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-[#E70008]/20 p-2 rounded-full mr-4">
                  <Shield className="h-5 w-5 text-[#E70008]" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure & Protected</h3>
                  <p className="text-gray-400">
                    Your data is encrypted and safe with us
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-[#E70008]/20 p-2 rounded-full mr-4">
                  <Star className="h-5 w-5 text-[#E70008]" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Premium Features</h3>
                  <p className="text-gray-400">
                    Access exclusive tools and content
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#E70008] to-orange-500 border-2 border-gray-900"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-gray-900"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 border-2 border-gray-900"></div>
                </div>
                <p className="text-gray-400 text-sm">
                  <span className="text-[#E70008] font-medium">1,000+</span>{" "}
                  users trust our platform
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center bg-black justify-center px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/" className="text-2xl font-bold flex items-center">
              <div className="w-10 h-10 rounded-md bg-[#E70008] flex items-center justify-center mr-3">
                <Zap className="h-6 w-6" fill="white" />
              </div>
              Magna Coders
            </Link>
          </div>

          <Card className="bg-black border-gray-900 rounded-xl shadow-lg">
            <CardHeader className="text-center pt-8 pb-4 px-6">
              <CardTitle className="text-2xl font-bold text-white">
                Sign In to Your Account
              </CardTitle>
              <CardDescription className="text-gray-500">
                Welcome back! Please enter your details
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-8">
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`mb-4 p-3 border rounded-lg text-sm flex items-start ${
                    errorMessage.includes("GitHub")
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <span>{errorMessage}</span>
                    {errorMessage.includes("GitHub") && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={handleGitHubSignIn}
                          className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                        >
                          Sign in with GitHub instead
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 text-sm font-medium"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      {...register("email", {
                        onChange: () => handleInputChange("email"),
                      })}
                      placeholder="Enter your email"
                      className={`pl-10 bg-gray-900 border-gray-900 text-gray-900 placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#E70008] h-11 rounded-lg ${
                        errors.email
                          ? "ring-1 ring-red-500 border-red-500"
                          : "focus:border-[#E70008]"
                      }`}
                      autoComplete="email"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-600 text-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.email.message}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-gray-700 text-sm font-medium"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#E70008] hover:text-[#FF333A] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        onChange: () => handleInputChange("password"),
                      })}
                      placeholder="Enter your password"
                      className={`pl-10 pr-10 bg-gray-900 border-gray-900 text-gray-900 placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#E70008] h-11 rounded-lg ${
                        errors.password
                          ? "ring-1 ring-red-500 border-red-500"
                          : "focus:border-[#E70008]"
                      }`}
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-600 text-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.password.message}
                    </motion.div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-[#E70008] hover:bg-[#FF333A] text-white font-medium h-11 rounded-lg transition-colors shadow-lg shadow-[#E70008]/20"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing In...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-black text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-10 bg-gray-900 border-gray-900 text-gray-700 hover:bg-gray-50"
                    type="button"
                    disabled={isSubmitting}
                  >
                    <Chrome className="h-4 w-4 mr-2 text-[#E70008]" />
                    Google
                  </Button>

                  <Button
                    variant="outline"
                    className="h-10 bg-gray-900 border-gray-900 text-white hover:bg-gray-800"
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleGitHubSignIn}
                  >
                    <Github className="h-4 w-4 mr-2 text-white" />
                    GitHub
                  </Button>
                </div>

                <div className="text-center mt-6">
                  <p className="text-gray-600 text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/register"
                      className="text-[#E70008] hover:text-[#FF333A] font-medium transition-colors"
                    >
                      Sign up now
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              By signing in, you agree to our{" "}
              <a href="#" className="text-[#E70008] hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#E70008] hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
