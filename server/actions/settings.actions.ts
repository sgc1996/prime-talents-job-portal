"use server";

import { requireRoleUser } from "@/lib/auth/session";
import { SystemSettingsRepository } from "@/server/repositories/system-settings.repository";
import { revalidatePath } from "next/cache";

export async function toggleEmployerRegistrationAction(enabled: boolean) {
  await requireRoleUser(["SUPER_ADMIN"]);

  await SystemSettingsRepository.setSetting(
    "public_employer_registration",
    enabled ? "true" : "false",
    "Enable public registration and posting for third-party employers"
  );

  SystemSettingsRepository.clearCache();

  revalidatePath("/");
  revalidatePath("/register");
  revalidatePath("/admin/settings");

  return {
    success: true,
    enabled,
    message: enabled
      ? "Public Employer Registration enabled! Third-party employers can now register on the platform."
      : "Public Employer Registration disabled! Jobs are now exclusively managed in-house via the Admin Panel.",
  };
}
