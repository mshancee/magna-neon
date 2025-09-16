"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignOutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function SignOutButton({
  variant = "destructive",
  size = "default",
  className = "",
  showIcon = true,
  children,
}: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      // Import and call server action
      const { signOutAction } = await import("@/app/(auth)/actions");
      await signOutAction();
    } catch (error) {
      // Check if this is a redirect (successful signout)
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        // Success! The redirect will handle navigation
        return;
      }

      // If there's an error, reset the signing out state
      setIsSigningOut(false);
      console.error("Sign out error:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isSigningOut}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children || (isSigningOut ? "Signing out..." : "Sign Out")}
    </Button>
  );
}
