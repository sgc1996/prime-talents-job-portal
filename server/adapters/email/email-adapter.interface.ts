export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailAdapter {
  sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }>;
  sendVerificationCode(to: string, code: string, recipientName?: string): Promise<boolean>;
  sendMagicLink(to: string, magicUrl: string, recipientName?: string): Promise<boolean>;
  sendPasswordReset(to: string, resetUrl: string, recipientName?: string): Promise<boolean>;
  sendLockoutAlert(to: string, minutes: number, recipientName?: string): Promise<boolean>;
}

