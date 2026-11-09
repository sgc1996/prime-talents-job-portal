import { z } from "zod";
import { passwordSchema } from "./password-policy";

export const candidateRegisterSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: passwordSchema,
  phone: z
    .string()
    .regex(/^(\+94|0)?7[0-9]{8}$/, "Please enter a valid Sri Lankan mobile number")
    .optional()
    .or(z.literal("")),
  captchaToken: z.string().optional(),
});

export const employerRegisterSchema = z.object({
  name: z.string().min(2, "Representative name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid company email address").toLowerCase(),
  password: passwordSchema,
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(150),
  companySlug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  phone: z
    .string()
    .regex(/^(\+94|0)?[0-9]{9}$/, "Please enter a valid Sri Lankan contact number")
    .optional()
    .or(z.literal("")),
  captchaToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  callbackUrl: z.string().optional(),
});

export const verifyCodeSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  code: z
    .string()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^[0-9]{6}$/, "Code must contain digits only"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  captchaToken: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address").toLowerCase(),
});

