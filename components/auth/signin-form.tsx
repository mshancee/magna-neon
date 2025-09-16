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
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { signInSchemaSimple } from "@/lib/validations/auth";

type SignInFormData = {
  email: string;
  password: string;
};

export default function SigninForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Show error message if there's a URL error
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
    resolver: zodResolver(signInSchemaSimple),
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
      // Create FormData for server action
      const formData = new FormData();
      formData.append("email", data.email.toLowerCase().trim());
      formData.append("password", data.password);

      // Add callback URL if present in search params
      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl) {
        formData.append("callbackUrl", callbackUrl);
      }

      // Import and call server action
      const { signInAction } = await import("@/app/(auth)/actions");
      const result = await signInAction(formData);

      // If we get a result, it means there was an error
      if (result && !result.success) {
        setErrorMessage(result.error || "Invalid email or password");
      } else {
        // This shouldn't happen as successful signin redirects
        setErrorMessage("Invalid email or password");
      }
    } catch (err) {
      // Check if this is a redirect (successful signin)
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        // Success! The redirect will handle navigation
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
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-400">
              Access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-300 text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    errors.email
                      ? "ring-1 ring-red-500 border-red-500"
                      : "focus:border-orange-500"
                  }`}
                  autoComplete="email"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email.message}
                  </div>
                )}
              </div>

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
                  placeholder="Enter your password"
                  className={`bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-orange-500 h-10 rounded-lg ${
                    errors.password
                      ? "ring-1 ring-red-500 border-red-500"
                      : "focus:border-orange-500"
                  }`}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password.message}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium h-10 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>

              <div className="text-center mt-4">
                <p className="text-gray-400 text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-orange-400 hover:text-orange-300 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
