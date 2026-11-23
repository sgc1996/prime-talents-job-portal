import { Metadata } from "next";
import { RegisterView } from "@/components/auth/register-view";
import { SystemSettingsRepository } from "@/server/repositories/system-settings.repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Register on Prime Hire to start exploring career opportunities.",
};

export default async function RegisterPage() {
  const allowEmployerRegistration =
    await SystemSettingsRepository.isPublicEmployerRegistrationEnabled();

  return <RegisterView allowEmployerRegistration={allowEmployerRegistration} />;
}
