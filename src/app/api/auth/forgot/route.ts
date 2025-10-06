import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { generateToken, addHours } from "@/lib/tokens";
import { mailer, isMailerConfigured } from "@/app/configs/nodemailer.config";
import { passwordResetTemplate } from "@/emails/templates/password-reset";

const schema = z.object({
  email: z.string().email("Informe um email válido"),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      await prisma.userToken.deleteMany({
        where: {
          purpose: "PASSWORD_RESET",
          userId: user.id,
        },
      });

      const token = generateToken(24);
      await prisma.userToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token,
          purpose: "PASSWORD_RESET",
          expiresAt: addHours(new Date(), 2),
        },
      });

      console.log(`[reset-password] token for ${email}: ${token}`);

      if (isMailerConfigured()) {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ??
          process.env.APP_URL ??
          process.env.NEXTAUTH_URL ??
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
        const normalizedBase = baseUrl.replace(/\/$/, "");
        const resetUrl = `${normalizedBase}/auth/reset/${token}`;

        const supportEmail = process.env.CONTACT_INBOX_EMAIL ?? process.env.SMTP_EMAIL ?? undefined;

        const html = passwordResetTemplate({
          name: user.name,
          resetUrl,
          expiresInHours: 2,
          supportEmail,
        });

        try {
          await mailer.sendMail({
            from: process.env.SMTP_EMAIL,
            to: user.email,
            subject: "Seedora • Redefinição de senha",
            html,
          });
        } catch (emailError) {
          console.error("failed to send reset email", emailError);
        }
      } else {
        console.warn("Mailer not configured. Skipping password reset email");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/auth/forgot", error);
    return jsonError("Erro interno", 500);
  }
}
