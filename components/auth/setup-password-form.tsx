"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { z } from "zod";

const setupPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SetupPasswordFormData = z.infer<typeof setupPasswordSchema>;

export default function SetupPasswordForm() {
  const router = useRouter();
  const { status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<SetupPasswordFormData>({
    resolver: zodResolver(setupPasswordSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const onSubmit = async (data: SetupPasswordFormData) => {
    clearErrors();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to setup password");
        return;
      }

      setSuccessMessage(
        "Password setup successfully! You can now sign in with email and password."
      );

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Setup password error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleInputChange = (field: keyof SetupPasswordFormData) => {
    if (errors[field]) {
      clearErrors(field);
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-bblack flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Setup Password
            </CardTitle>
            <CardDescription className="text-gray-300">
              Add a password to enable email/password login
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm flex items-start"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm flex items-start"
              >
                <CheckCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-white text-sm font-medium"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      onChange: () => handleInputChange("password"),
                    })}
                    placeholder="Create a strong password"
                    className={`pl-10 pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 ${
                      errors.password
                        ? "border-red-400 focus:border-red-400"
                        : ""
                    }`}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
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
                    className="flex items-center gap-2 text-red-400 text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.password.message}
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-300 text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword", {
                      onChange: () => handleInputChange("confirmPassword"),
                    })}
                    placeholder="Confirm your password"
                    className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-orange-500 h-11 rounded-lg ${
                      errors.confirmPassword
                        ? "ring-1 ring-red-500 border-red-500"
                        : "focus:border-orange-500"
                    }`}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword.message}
                  </motion.div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium h-11 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up password...
                    </span>
                  ) : (
                    "Setup Password"
                  )}
                </Button>
              </div>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                <Link
                  href="/dashboard"
                  className="text-orange-400 hover:text-orange-300 font-medium"
                >
                  Skip for now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
