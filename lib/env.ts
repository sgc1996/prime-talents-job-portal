import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().default("WorkLanka"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().default("support@worklanka.lk"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Authentication
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters long for security"),
  AUTH_URL: z.string().url().optional().default("http://localhost:3000"),

  // Google OAuth
  GOOGLE_OAUTH_ENABLED: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Email
  EMAIL_PROVIDER: z.enum(["nodemailer", "resend"]).default("nodemailer"),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z
    .string()
    .optional()
    .default("1025")
    .transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
  EMAIL_FROM: z.string().default("WorkLanka <noreply@worklanka.lk>"),
  RESEND_API_KEY: z.string().optional(),

  // Security / Captcha
  CAPTCHA_ENABLED: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
  CAPTCHA_SITE_KEY: z.string().optional(),
  CAPTCHA_SECRET_KEY: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_MAX_ATTEMPTS: z
    .string()
    .optional()
    .default("5")
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_WINDOW_SECONDS: z
    .string()
    .optional()
    .default("900")
    .transform((val) => parseInt(val, 10)),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const formattedErrors = error.errors
      .map((err) => `  - ${err.path.join(".")}: ${err.message}`)
      .join("\n");
    console.error(
      `\n❌ Invalid Environment Variables Configuration:\n${formattedErrors}\n\nPlease check your .env file against .env.example.\n`,
    );
  } else {
    console.error("❌ Failed to parse environment variables:", error);
  }
  // Allow builds to succeed without crashing if during static analysis or test,
  // but in runtime or strict dev fail fast
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid environment configuration. Aborting startup.");
  }
  parsedEnv = (process.env as unknown) as Env;
}

export const env = parsedEnv;

