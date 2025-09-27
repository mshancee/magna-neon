"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  ArrowRight,
  Github,
  Eye,
  EyeOff,
  Mail,
  Lock,
} from "lucide-react";
import { signInSchema } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";
import Link from "next/link";

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
  const [githubLoading, setGithubLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

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
    setEmailLoading(true);

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
              "This account uses GitHub. Please sign in with GitHub below."
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
    } finally {
      setEmailLoading(false);
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
      setGithubLoading(true);
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      await signIn("github", { callbackUrl });
    } catch (error) {
      console.error("GitHub sign-in error:", error);
      setErrorMessage("Failed to sign in with GitHub. Please try again.");
      setGithubLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <section className="bg-gray-900/20 backdrop-blur-md flex items-center justify-center w-full">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-900/20 backdrop-blur-lg border-none shadow-xl rounded-3xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-[#F9E4AD] font-mono">
              SIGN IN
            </CardTitle>
            <CardDescription className="text-[#FF9940] text-base font-mono">
              Join the Magna Coders community
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#FF9940] text-sm font-mono flex items-start"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[#F9E4AD] text-sm font-medium font-mono"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#FF9940]" />
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      onChange: () => handleInputChange("email"),
                    })}
                    placeholder="your@email.com"
                    className={`pl-12 h-14 bg-gray-950/50 border border-[#E70008]/30 text-[#F9E4AD] placeholder:text-[#FF9940]/50 focus:border-[#E70008] focus:ring-[#E70008]/30 rounded-2xl text-base font-mono ${
                      errors.email
                        ? "border-[#E70008] focus:border-[#E70008]"
                        : ""
                    }`}
                    autoComplete="email"
                    disabled={isSubmitting || githubLoading || emailLoading}
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-[#FF9940] text-sm font-mono"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.email.message}
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[#F9E4AD] text-sm font-medium font-mono"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#FF9940]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      onChange: () => handleInputChange("password"),
                    })}
                    placeholder="••••••••"
                    className={`pl-12 pr-12 h-14 bg-gray-950/50 border border-[#E70008]/30 text-[#F9E4AD] placeholder:text-[#FF9940]/50 focus:border-[#E70008] focus:ring-[#E70008]/30 rounded-2xl text-base font-mono ${
                      errors.password
                        ? "border-[#E70008] focus:border-[#E70008]"
                        : ""
                    }`}
                    autoComplete="current-password"
                    disabled={isSubmitting || githubLoading || emailLoading}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#FF9940] hover:text-[#F9E4AD] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-[#FF9940] text-sm font-mono"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.password.message}
                  </motion.div>
                )}
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#E70008] hover:text-[#D60007] transition-colors font-mono"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="relative w-full h-14 bg-[#E70008] hover:bg-[#D60007] text-[#F9E4AD] font-mono text-base font-semibold rounded-2xl transition-all duration-200 overflow-hidden"
                disabled={isSubmitting || githubLoading || emailLoading}
              >
                <AnimatePresence>
                  {emailLoading ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing In...
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center gap-2"
                    >
                      Sign In
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: emailLoading ? 0 : 1.5,
                    opacity: emailLoading ? 0 : 0.3,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E70008]/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-[#FF9940] font-mono">
                  or
                </span>
              </div>
            </div>

            {/* GitHub Sign In */}
            <Button
              type="button"
              variant="outline"
              className="relative w-full h-14 bg-transparent border-none  text-[#F9E4AD] hover:bg-[#E70008]/20 hover:text-[#F9E4AD] font-mono text-base font-semibold rounded-2xl transition-all duration-200 overflow-hidden"
              onClick={handleGitHubSignIn}
              disabled={isSubmitting || githubLoading || emailLoading}
            >
              <AnimatePresence>
                {githubLoading ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing In...
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Github className="h-5 w-5" />
                    Sign In with GitHub
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: githubLoading ? 0 : 1.5,
                  opacity: githubLoading ? 0 : 0.3,
                }}
                transition={{ duration: 0.2 }}
              />
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-[#FF9940] text-sm font-mono">
                New to Magna Coders?{" "}
                <Link
                  href="/register"
                  className="text-[#E70008] hover:text-[#D60007] font-semibold transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
