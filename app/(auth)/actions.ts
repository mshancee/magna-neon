"use server";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/drizzle";
import { users } from "@/drizzle/schema";
import { signInSchema, apiSignUpSchema } from "@/lib/validations/auth";
import { signIn, signOut } from "@/auth";
import { getLocationDataFromRequest } from "@/utils/location-detector";

export async function signUpAction(formData: FormData) {
  try {
    const headersList = await headers();
    // generate unique referral code
    function generateReferralCode(): string {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
    // Detect location data from IP address
    const request = {
      headers: {
        get: (name: string) => headersList.get(name),
      },
    } as unknown as NextRequest;
    const locationData = await getLocationDataFromRequest(request);

    // Extract and validate form data
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      referralCode: (formData.get("referralCode") as string) || undefined,
    };

    // Validate input
    const validatedData = apiSignUpSchema.parse(rawData);

    // Check if user already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("An account with this email already exists");
    }

    // Generate unique identifiers
    const referralCode = await generateReferralCode();

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user with comprehensive location data
    const [newUser] = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        referralCode,
        countryCode: locationData.countryCode,
        country: locationData.country,
        status: "inactive",
        role: "user",
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    if (!newUser) {
      throw new Error("Failed to create user account");
    }

    return {
      success: true,
      message: "Account created successfully!",
      user: newUser,
      onboarding: {
        initialLevel: "bronze",
        referralUsed: !!validatedData.referralCode,
      },
    };
  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function signInAction(formData: FormData) {
  try {
    // Extract and validate form data
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      callbackUrl: formData.get("callbackUrl") as string,
    };

    const validatedData = signInSchema.parse({
      email: rawData.email,
      password: rawData.password,
    });

    // Determine redirect URL - use callback URL if provided and safe, otherwise default to "/dashboard"
    let redirectTo = "/dashboard";
    if (rawData.callbackUrl && rawData.callbackUrl.startsWith("/")) {
      redirectTo = rawData.callbackUrl;
    }

    // Attempt sign in with redirect
    // Note: This will throw a NEXT_REDIRECT error on success, which is expected
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirectTo,
      redirect: true,
    });

    // This line should never be reached if signin is successful
    return {
      success: true,
      message: "Signed in successfully!",
    };
  } catch (error) {
    // Check if this is a NextJS redirect (successful signin)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      // This is actually a successful signin, let the redirect happen
      throw error;
    }

    console.error("Signin error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("OAUTH_ONLY_USER")) {
        return {
          success: false,
          error: "OAUTH_ONLY_USER",
          message:
            "This account was created with GitHub. Please sign in with GitHub or set up a password first.",
        };
      }
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
export async function signOutAction() {
  try {
    await signOut({ redirectTo: "/" });
  } catch (error) {
    // Redirect errors are expected, let them through
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Signout error:", error);
    throw new Error("Failed to sign out");
  }
}
