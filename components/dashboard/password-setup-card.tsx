"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Github, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PasswordSetupCard() {
  const { data: session } = useSession();
  const [authMethods, setAuthMethods] = useState<{
    hasPassword: boolean;
    hasGitHub: boolean;
    loading: boolean;
  }>({
    hasPassword: false,
    hasGitHub: false,
    loading: true,
  });

  useEffect(() => {
    const checkAuthMethods = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/user/auth-methods");
        const data = await response.json();

        setAuthMethods({
          hasPassword: data.hasPassword,
          hasGitHub: data.hasGitHub,
          loading: false,
        });
      } catch (error) {
        console.error("Error checking auth methods:", error);
        setAuthMethods((prev) => ({ ...prev, loading: false }));
      }
    };

    checkAuthMethods();
  }, [session?.user?.id]);

  if (authMethods.loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user has both methods, show success state
  if (authMethods.hasPassword && authMethods.hasGitHub) {
    return (
      <Card className="bg-green-900/20 border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-5 w-5" />
            Account Security Complete
          </CardTitle>
          <CardDescription className="text-green-300">
            You can sign in with both GitHub and email/password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-400">
              <Github className="h-4 w-4" />
              <span className="text-sm">GitHub Connected</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Password Set</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user only has GitHub, suggest password setup
  if (authMethods.hasGitHub && !authMethods.hasPassword) {
    return (
      <Card className="bg-orange-900/20 border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-400">
            <AlertCircle className="h-5 w-5" />
            Enhance Your Account Security
          </CardTitle>
          <CardDescription className="text-orange-300">
            Add a password to enable email/password sign-in as a backup option
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-400">
                <Github className="h-4 w-4" />
                <span className="text-sm">GitHub Connected</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Lock className="h-4 w-4" />
                <span className="text-sm">No Password Set</span>
              </div>
            </div>
            <Link href="/setup-password">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                <Lock className="h-4 w-4 mr-2" />
                Set Up Password
              </Button>
            </Link>
            <p className="text-xs text-gray-400">
              This will allow you to sign in with your email and password in
              addition to GitHub
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user only has password, suggest GitHub linking
  if (authMethods.hasPassword && !authMethods.hasGitHub) {
    return (
      <Card className="bg-blue-900/20 border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Github className="h-5 w-5" />
            Connect GitHub Account
          </CardTitle>
          <CardDescription className="text-blue-300">
            Link your GitHub account for faster sign-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-400">
                <Lock className="h-4 w-4" />
                <span className="text-sm">Password Set</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Github className="h-4 w-4" />
                <span className="text-sm">GitHub Not Connected</span>
              </div>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                // Trigger GitHub OAuth for account linking
                window.location.href =
                  "/api/auth/signin/github?callbackUrl=/dashboard";
              }}
            >
              <Github className="h-4 w-4 mr-2" />
              Connect GitHub
            </Button>
            <p className="text-xs text-gray-400">
              This will allow you to sign in with GitHub in addition to
              email/password
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
