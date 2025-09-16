import { z } from "zod";

// Utility validation patterns
const emailPattern = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(255, "Email is too long")
  .transform((val) => val.toLowerCase().trim());

const passwordPattern = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

const namePattern = z
  .string()
  .min(1, "Full name is required")
  .min(2, "Full name must be at least 2 characters")
  .max(100, "Full name is too long")
  .regex(
    /^[a-zA-Z\s'.-]+$/,
    "Full name can only contain letters, spaces, apostrophes, hyphens, and periods"
  )
  .transform((val) => val.trim());

const referralCodePattern = z
  .string()
  .regex(
    /^[a-z0-9]{6,12}$/,
    "Referral code must be 6-12 characters long and contain only lowercase letters and numbers"
  )
  .optional();

// Sign in validation schema
export const signInSchema = z.object({
  email: emailPattern,
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

// Sign up validation schema
export const signUpSchema = z
  .object({
    name: namePattern,
    email: emailPattern,
    password: passwordPattern,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    referralCode: referralCodePattern,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

// API signup schema (for server-side validation) - more relaxed
export const apiSignUpSchema = z.object({
  name: namePattern,
  email: emailPattern,
  password: passwordPattern,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  referralCode: referralCodePattern,
  country: z.string().length(3).default("KE").optional(), //alpha-2
});

export type ApiSignUpData = z.infer<typeof apiSignUpSchema>;
