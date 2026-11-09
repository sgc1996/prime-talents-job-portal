import { EmailAdapter } from "./email-adapter.interface";
import { NodemailerAdapter } from "./nodemailer-adapter";
import { ResendAdapter } from "./resend-adapter";
import { env } from "@/lib/env";

let emailAdapterInstance: EmailAdapter | null = null;

export function getEmailAdapter(): EmailAdapter {
  if (!emailAdapterInstance) {
    if (env.EMAIL_PROVIDER === "resend" && env.RESEND_API_KEY) {
      emailAdapterInstance = new ResendAdapter();
    } else {
      emailAdapterInstance = new NodemailerAdapter();
    }
  }
  return emailAdapterInstance;
}

export * from "./email-adapter.interface";

