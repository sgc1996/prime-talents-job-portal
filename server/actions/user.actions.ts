"use server";

import {
  changePasswordSchema,
  changeEmailSchema,
} from "@/lib/security/validation-schemas";
import { AuthService } from "@/server/services/auth.service";
import { requireAuthUser } from "@/lib/auth/session";
import { headers } from "next/headers";
import { signOut } from "@/lib/auth/auth";

function getClientIp(): string {
  const reqHeaders = headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "127.0.0.1";
  }
  return reqHeaders.get("x-real-ip") || "127.0.0.1";
}

export async function changePasswordAction(formData: unknown) {
  const user = await requireAuthUser();
  const parsed = changePasswordSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input",
    };
  }

  try {
    await AuthService.changePassword(
      user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
      getClientIp(),
    );

    // Prompt rule: "session invalidation on password change"
    await signOut({ redirectTo: "/login?message=password_changed" });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change password",
    };
  }
}

export async function changeEmailAction(formData: unknown) {
  const user = await requireAuthUser();
  const parsed = changeEmailSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid email",
    };
  }

  try {
    await AuthService.changeEmail(user.id, parsed.data.newEmail);
    // Requires re-verification
    await signOut({
      redirectTo: `/verify-email?userId=${user.id}&email=${encodeURIComponent(
        parsed.data.newEmail,
      )}`,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change email",
    };
  }
}
