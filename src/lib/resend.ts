import { Resend } from "resend";
import { env, resendConfigured } from "./env";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

const resendClient = resendConfigured ? new Resend(env.RESEND_API_KEY) : null;
const defaultFrom = env.RESEND_FROM_EMAIL ?? "AppSeed CRM <no-reply@appseed.dev>";

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  if (!resendClient) {
    console.info("[resend:stub]", { to, subject });
    return { id: "stubbed", to, subject };
  }

  const response = await resendClient.emails.send({
    from: defaultFrom,
    to,
    subject,
    html,
  });

  if (response.error) {
    throw new Error(response.error.message ?? "Failed to send email");
  }

  return response.data ?? { id: "queued", to, subject };
}
