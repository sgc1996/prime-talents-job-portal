import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface CaptchaVerificationResult {
  success: boolean;
  message?: string;
}

export interface CaptchaAdapter {
  verify(token: string, remoteIp?: string): Promise<CaptchaVerificationResult>;
}

export class CloudflareTurnstileAdapter implements CaptchaAdapter {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async verify(token: string, remoteIp?: string): Promise<CaptchaVerificationResult> {
    try {
      const formData = new URLSearchParams();
      formData.append("secret", this.secretKey);
      formData.append("response", token);
      if (remoteIp) {
        formData.append("remoteip", remoteIp);
      }

      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();
      return {
        success: Boolean(data.success),
        message: data["error-codes"]?.join(", "),
      };
    } catch (err) {
      logger.error("Turnstile verification request failed", {}, err);
      return {
        success: false,
        message: "Captcha verification service error",
      };
    }
  }
}

export class NullCaptchaAdapter implements CaptchaAdapter {
  async verify(): Promise<CaptchaVerificationResult> {
    // Pass-through when captcha is disabled
    return { success: true };
  }
}

export function getCaptchaAdapter(): CaptchaAdapter {
  if (env.CAPTCHA_ENABLED && env.CAPTCHA_SECRET_KEY) {
    return new CloudflareTurnstileAdapter(env.CAPTCHA_SECRET_KEY);
  }
  return new NullCaptchaAdapter();
}
