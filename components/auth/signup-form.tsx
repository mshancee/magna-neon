"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { signUpSchema } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    setEmailLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("email", data.email.toLowerCase().trim());
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      const { signUpAction } = await import("@/app/(auth)/actions");
      const result = await signUpAction(formData);

      if (!result.success) {
        setErrorMessage(result.error || "Failed to create account");
        if (result.error?.includes("already exists")) {
          setErrorMessage(
            "Account already exists. Try signing in or using GitHub below."
          );
        }
        setEmailLoading(false);
        return;
      }

      router.push("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setEmailLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData) => {
    if (errors[field]) {
      clearErrors(field);
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleGitHubSignUp = async () => {
    try {
      setGithubLoading(true);
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("GitHub sign-up error:", error);
      setErrorMessage("Failed to sign up with GitHub. Please try again.");
      setGithubLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <section className="bg-gray-950/90 backdrop-blur-md flex items-center justify-center w-full">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-900/20 backdrop-blur-lg border-none shadow-xl rounded-3xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-[#F9E4AD] font-mono">
              Create Account
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
              {/* Full Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-[#F9E4AD] text-sm font-medium font-mono"
                >
                  Name
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#FF9940]" />
                  <Input
                    id="name"
                    type="text"
                    {...register("name", {
                      onChange: () => handleInputChange("name"),
                    })}
                    placeholder="Your name"
                    className={`pl-12 h-14 bg-gray-950/50 border border-[#E70008]/30 text-[#F9E4AD] placeholder:text-[#FF9940]/50 focus:border-[#E70008] focus:ring-[#E70008]/30 rounded-2xl text-base font-mono ${
                      errors.name
                        ? "border-[#E70008] focus:border-[#E70008]"
                        : ""
                    }`}
                    autoComplete="name"
                    disabled={isSubmitting || githubLoading || emailLoading}
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-[#FF9940] text-sm font-mono"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.name.message}
                  </motion.div>
                )}
              </div>

              {/* Email */}
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

              {/* Password */}
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
                    autoComplete="new-password"
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
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-[#F9E4AD] text-sm font-medium font-mono"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#FF9940]" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword", {
                      onChange: () => handleInputChange("confirmPassword"),
                    })}
                    placeholder="••••••••"
                    className={`pl-12 pr-12 h-14 bg-gray-950/50 border border-[#E70008]/30 text-[#F9E4AD] placeholder:text-[#FF9940]/50 focus:border-[#E70008] focus:ring-[#E70008]/30 rounded-2xl text-base font-mono ${
                      errors.confirmPassword
                        ? "border-[#E70008] focus:border-[#E70008]"
                        : ""
                    }`}
                    autoComplete="new-password"
                    disabled={isSubmitting || githubLoading || emailLoading}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#FF9940] hover:text-[#F9E4AD] transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-[#FF9940] text-sm font-mono"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword.message}
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
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
                      Creating Account...
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center gap-2"
                    >
                      Create Account
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

            {/* GitHub Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="relative w-full h-14 bg-transparent border-none text-[#F9E4AD] hover:bg-[#E70008]/20 hover:text-[#F9E4AD] font-mono text-base font-semibold rounded-2xl transition-all duration-200 overflow-hidden"
              onClick={handleGitHubSignUp}
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
                    Signing Up...
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Github className="h-5 w-5" />
                    Sign Up with GitHub
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

            {/* Sign In Link */}
            <div className="text-center pt-4">
              <p className="text-[#FF9940] text-sm font-mono">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#E70008] hover:text-[#D60007] font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
