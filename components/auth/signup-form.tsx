"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { signUpSchema } from "@/lib/validations/auth";

// Create a local type that matches our form defaults
type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    setIsSubmitted(true);

    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("email", data.email.toLowerCase().trim());
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      // Import and call server action
      const { signUpAction } = await import("@/app/(auth)/actions");
      const result = await signUpAction(formData);

      if (!result.success) {
        console.error(result.error || "Failed to create account");
        setIsSubmitted(false);
        return;
      }

      // Redirect to signin page
      router.push("/login");
    } catch {
      console.error(
        "Network error. Please check your connection and try again."
      );
      setIsSubmitted(false);
    }
  };

  const handleInputChange = (field: keyof FormData) => {
    if (errors[field]) {
      clearErrors(field);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-black border border-gray-800 rounded-xl">
          <CardHeader className="text-center pt-8 pb-4 px-6">
            <CardTitle className="text-2xl font-bold text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-400">
              Join our developer community
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-gray-300 text-sm font-medium"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  {...register("name", {
                    onChange: () => handleInputChange("name"),
                  })}
                  placeholder="Enter your full name"
                  className={`bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-orange-500 h-10 rounded-lg ${
                    errors.name && isSubmitted
                      ? "ring-1 ring-red-500 border-red-500"
                      : "focus:border-orange-500"
                  }`}
                  autoComplete="name"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.name && isSubmitted}
                />
                {errors.name && isSubmitted && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name.message}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-300 text-sm font-medium"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    onChange: () => handleInputChange("email"),
                  })}
                  placeholder="Enter your email"
                  className={`bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-orange-500 h-10 rounded-lg ${
                    errors.email && isSubmitted
                      ? "ring-1 ring-red-500 border-red-500"
                      : "focus:border-orange-500"
                  }`}
                  autoComplete="email"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.email && isSubmitted}
                />
                {errors.email && isSubmitted && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email.message}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-300 text-sm font-medium"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    onChange: () => handleInputChange("password"),
                  })}
                  placeholder="Create a password"
                  className={`bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-orange-500 h-10 rounded-lg ${
                    errors.password && isSubmitted
                      ? "ring-1 ring-red-500 border-red-500"
                      : "focus:border-orange-500"
                  }`}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.password && isSubmitted}
                />
                {errors.password && isSubmitted && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password.message}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-300 text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    onChange: () => handleInputChange("confirmPassword"),
                  })}
                  placeholder="Confirm your password"
                  className={`bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-orange-500 h-10 rounded-lg ${
                    errors.confirmPassword && isSubmitted
                      ? "ring-1 ring-red-500 border-red-500"
                      : "focus:border-orange-500"
                  }`}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.confirmPassword && isSubmitted}
                />
                {errors.confirmPassword && isSubmitted && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword.message}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 h-10 rounded-lg transition-colors"
                >
                  {isSubmitting || isSubmitted ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-orange-400 hover:text-orange-300 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
