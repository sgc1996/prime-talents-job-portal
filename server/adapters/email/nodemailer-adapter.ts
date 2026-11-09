import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { EmailAdapter, SendEmailOptions } from "./email-adapter.interface";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export class NodemailerAdapter implements EmailAdapter {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASSWORD
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASSWORD,
            }
          : undefined,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private loadTemplate(filename: string): string {
    const templatePath = path.join(process.cwd(), "emails", filename);
    return fs.readFileSync(templatePath, "utf-8");
  }

  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      logger.info("Email sent via Nodemailer/SMTP", {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error("Failed to send email via Nodemailer", { to: options.to }, error);
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

