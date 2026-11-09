import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { EmailAdapter, SendEmailOptions } from "./email-adapter.interface";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export class ResendAdapter implements EmailAdapter {
  private resend: Resend;

  constructor() {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is required when using the Resend email adapter.");
    }
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  private loadTemplate(filename: string): string {
    const templatePath = path.join(process.cwd(), "emails", filename);
    return fs.readFileSync(templatePath, "utf-8");
  }

  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await this.resend.emails.send({
        from: env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (response.error) {
        logger.error("Resend API error", { to: options.to, error: response.error });
        return { success: false };
      }

      logger.info("Email sent via Resend", {
        to: options.to,
        subject: options.subject,
        id: response.data?.id,
      });

      return { success: true, messageId: response.data?.id };
    } catch (error) {
      logger.error("Failed to send email via Resend", { to: options.to }, error);
      return { success: false };
    }
  }

  async sendVerificationCode(to: string, code: string, recipientName = "User"): Promise<boolean> {
    const rawHtml = this.loadTemplate("verification-code.html");
    const html = rawHtml.replace("{{name}}", recipientName).replace("{{code}}", code);

    const result = await this.sendEmail({
      to,
      subject: `Your ${env.NEXT_PUBLIC_APP_NAME} Verification Code: ${code}`,
      html,
      text: `Hello ${recipientName}, your verification code is ${code}. It expires in 15 minutes.`,
    });
    return result.success;
  }

  async sendMagicLink(to: string, magicUrl: string, recipientName = "User"): Promise<boolean> {
    const rawHtml = this.loadTemplate("magic-link.html");
    const html = rawHtml.replace("{{name}}", recipientName).replaceAll("{{magicUrl}}", magicUrl);

    const result = await this.sendEmail({
      to,
      subject: `Sign in to ${env.NEXT_PUBLIC_APP_NAME}`,
      html,
      text: `Hello ${recipientName}, click this link to verify and sign in: ${magicUrl}`,
    });
    return result.success;
  }

  async sendPasswordReset(to: string, resetUrl: string, recipientName = "User"): Promise<boolean> {
    const rawHtml = this.loadTemplate("password-reset.html");
    const html = rawHtml.replace("{{name}}", recipientName).replaceAll("{{resetUrl}}", resetUrl);

    const result = await this.sendEmail({
      to,
      subject: `Reset your ${env.NEXT_PUBLIC_APP_NAME} password`,
      html,
      text: `Hello ${recipientName}, click this link to reset your password: ${resetUrl}`,
    });
    return result.success;
  }

  async sendLockoutAlert(to: string, minutes: number, recipientName = "User"): Promise<boolean> {
    const rawHtml = this.loadTemplate("lockout-alert.html");
    const html = rawHtml
      .replace("{{name}}", recipientName)
      .replace("{{minutes}}", minutes.toString());

    const result = await this.sendEmail({
      to,
      subject: `Security Alert: Your ${env.NEXT_PUBLIC_APP_NAME} account has been temporarily locked`,
      html,
      text: `Hello ${recipientName}, your account has been temporarily locked for ${minutes} minutes.`,
    });
    return result.success;
  }
}
