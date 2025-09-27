"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "OAuthSignin":
        return "Error in constructing an authorization URL.";
      case "OAuthCallback":
        return "Error in handling the response from an OAuth provider.";
      case "OAuthCreateAccount":
        return "Could not create OAuth provider user in the database.";
      case "EmailCreateAccount":
        return "Could not create email provider user in the database.";
      case "Callback":
        return "Error in the OAuth callback handler route.";
      case "OAuthAccountNotLinked":
        return "The email on the account is already linked, but not with this OAuth account.";
      case "EMAIL_MISMATCH":
        return "The GitHub account email doesn't match your current account email. Please use a GitHub account with the same email address.";
      case "EmailSignin":
        return "Sending the e-mail with the verification token failed.";
      case "CredentialsSignin":
        return "The authorize callback returned null in the Credentials provider.";
      case "SessionRequired":
        return "The content of this page requires you to be signed in at all times.";
      default:
        return "An unknown error occurred.";
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-red-400">Authentication Error</CardTitle>
          <CardDescription className="text-gray-400">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Error code: {error || "Unknown"}
            </p>
            <div className="space-y-2">
              <Link href="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Try Again
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
