"use server";

import {
  candidateRegisterSchema,
  employerRegisterSchema,
  verifyCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/security/validation-schemas";
import { AuthService } from "@/server/services/auth.service";
import { VerificationService } from "@/server/services/verification.service";
import { UserRepository } from "@/server/repositories/user.repository";
import { SystemSettingsRepository } from "@/server/repositories/system-settings.repository";
import { checkRateLimit } from "@/lib/rate-limit/limiter";
import { getCaptchaAdapter } from "@/lib/security/captcha-adapter";
import { signOut } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";

function getClientIp(): string {
  const reqHeaders = headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "127.0.0.1";
  }
  return reqHeaders.get("x-real-ip") || "127.0.0.1";
}

function getUserAgent(): string {
  return headers().get("user-agent") || "unknown";
}

export async function registerCandidateAction(formData: unknown) {
  const ip = getClientIp();
  const rateLimit = checkRateLimit(`register:${ip}`, 10, 600);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many registration attempts. Please try again later.",
    };
  }

  const parsed = candidateRegisterSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input",
    };
  }

  const captchaAdapter = getCaptchaAdapter();
  if (parsed.data.captchaToken) {
    const captchaResult = await captchaAdapter.verify(parsed.data.captchaToken, ip);
    if (!captchaResult.success) {
      return { success: false, error: "Captcha verification failed" };
    }
  }

  try {
    const user = await AuthService.registerCandidate({
      email: parsed.data.email,
      name: parsed.data.name,
      password: parsed.data.password,
      phone: parsed.data.phone,
      ip,
      userAgent: getUserAgent(),
    });

    return {
      success: true,
      userId: user.id,
      email: user.email,
    };
  } catch (error) {
    logger.error("Candidate registration failed", { email: parsed.data.email }, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

export async function registerEmployerAction(formData: unknown) {
  const isPublicRegistrationEnabled =
    await SystemSettingsRepository.isPublicEmployerRegistrationEnabled();
  if (!isPublicRegistrationEnabled) {
    return {
      success: false,
      error:
        "Public employer registration is currently closed. Job vacancies are published exclusively in-house by Prime Hire.",
    };
  }

  const ip = getClientIp();
  const rateLimit = checkRateLimit(`register:${ip}`, 10, 600);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many registration attempts. Please try again later.",
    };
  }

  const parsed = employerRegisterSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input",
    };
  }

  const captchaAdapter = getCaptchaAdapter();
  if (parsed.data.captchaToken) {
    const captchaResult = await captchaAdapter.verify(parsed.data.captchaToken, ip);
    if (!captchaResult.success) {
      return { success: false, error: "Captcha verification failed" };
    }
  }

  try {
    const user = await AuthService.registerEmployer({
      email: parsed.data.email,
      name: parsed.data.name,
      password: parsed.data.password,
      phone: parsed.data.phone,
      companyName: parsed.data.companyName,
      companySlug: parsed.data.companySlug,
      ip,
      userAgent: getUserAgent(),
    });

    return {
      success: true,
      userId: user.id,
      email: user.email,
    };
  } catch (error) {
    logger.error("Employer registration failed", { email: parsed.data.email }, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

export async function verifyCodeAction(formData: unknown) {
  const ip = getClientIp();
  const rateLimit = checkRateLimit(`verify:${ip}`, 15, 600);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many verification attempts. Please wait a few minutes.",
    };
  }

  const parsed = verifyCodeSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid verification code",
    };
  }

  const result = await VerificationService.verifyCode(parsed.data.userId, parsed.data.code);
  if (!result.success) {
    return {
      success: false,
      error: result.message || "Failed to verify code",
    };
  }

  return { success: true };
}

export async function resendVerificationCodeAction(userId: string) {
  const ip = getClientIp();
  const rateLimit = checkRateLimit(`resend-code:${userId}:${ip}`, 3, 300);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Please wait a moment before requesting another verification code.",
    };
  }

  const user = await UserRepository.findById(userId);
  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.status === "ACTIVE" && user.emailVerifiedAt) {
    return { success: false, error: "Email is already verified. Please sign in." };
  }

  const sent = await VerificationService.sendVerificationEmail(user.id, user.email, user.name);
  if (!sent) {
    return {
      success: false,
      error: "Verification code was sent recently. Please check your inbox or wait 60 seconds.",
    };
  }

  return { success: true };
}

export async function forgotPasswordAction(formData: unknown) {
  const ip = getClientIp();
  const rateLimit = checkRateLimit(`forgot-password:${ip}`, 5, 900);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many requests. Please try again later.",
    };
  }

  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid email",
    };
  }

  // SECURITY: Always return success to prevent email enumeration
  await VerificationService.sendPasswordResetEmail(parsed.data.email);

  return {
    success: true,
    message: "If an account exists with that email, a password reset link has been sent.",
  };
}

export async function resetPasswordAction(formData: unknown) {
  const ip = getClientIp();
  const rateLimit = checkRateLimit(`reset-password:${ip}`, 10, 900);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many attempts. Please try again later.",
    };
  }

  const parsed = resetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input",
    };
  }

  try {
    await AuthService.resetPassword(parsed.data.token, parsed.data.password, ip);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Password reset failed",
    };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
