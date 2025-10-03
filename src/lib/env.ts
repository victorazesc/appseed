import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  AUTH_DISABLED: z.enum(["true", "false"]).optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_DISABLED: process.env.AUTH_DISABLED,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
});

if (!parsed.success) {
  console.warn("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw parsed.error;
}

export const env = parsed.data;

export const authDisabled = env.AUTH_DISABLED === "true";
export const resendConfigured = Boolean(env.RESEND_API_KEY);
