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

const passwordPatternSimple = z
  .string()
  .min(1, "Password is required")
  .min(6, "Password must be at least 6 characters")
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

// Simple sign in validation schema
export const signInSchemaSimple = z.object({
  email: emailPattern,
  password: passwordPatternSimple,
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignInFormDataSimple = z.infer<typeof signInSchemaSimple>;

// Sign up validation schema with enhanced validation
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

// Simple sign up validation schema
export const signUpSchemaSimple = z
  .object({
    name: namePattern,
    email: emailPattern,
    password: passwordPatternSimple,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignUpFormDataSimple = z.infer<typeof signUpSchemaSimple>;

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

// Profile update schema
export const profileUpdateSchema = z
  .object({
    name: namePattern.optional(),
    email: emailPattern.optional(),
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .optional(),
    newPassword: passwordPattern.optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required to change password",
      path: ["currentPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
        return false;
      }
      return true;
    },
    {
      message: "New passwords do not match",
      path: ["confirmNewPassword"],
    }
  );

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// Password reset schemas
export const passwordResetRequestSchema = z.object({
  email: emailPattern,
});

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordPattern,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordResetRequestData = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
