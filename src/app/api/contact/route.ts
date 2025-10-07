import { NextResponse } from "next/server";
import { ActivityPriority, ActivityStatus, ActivityType } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { mailer, isMailerConfigured } from "@/app/configs/nodemailer.config";
import { prisma } from "@/lib/prisma";

const DEFAULT_FROM_EMAIL = process.env.SMTP_EMAIL ?? "";
const DEFAULT_FROM_NAME = process.env.SMTP_FROM_NAME ?? "AppSeed";
const INBOX_EMAIL = process.env.CONTACT_INBOX_EMAIL ?? DEFAULT_FROM_EMAIL;
const CONFIRMATION_ENABLED = process.env.SEND_CONTACT_CONFIRMATION !== "false";
const CONTACT_PIPELINE_WEBHOOK_URL = process.env.CONTACT_PIPELINE_WEBHOOK_URL;

interface ContactPayload {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  message?: string;
}

type SanitizedPayload = Required<ContactPayload>;

export async function POST(request: Request) {
  try {
    const payload: ContactPayload = await request.json();
    const sanitized = sanitizePayload(payload);

    if (!sanitized.name || !sanitized.email || !sanitized.message) {
      return NextResponse.json(
        { message: "Por favor preencha nome, e-mail e detalhes do projeto." },
        { status: 400 },
      );
    }

    if (!INBOX_EMAIL) {
      console.error("CONTACT_INBOX_EMAIL or SMTP_EMAIL must be configured.");
      return NextResponse.json(
        { message: "Configuração de e-mail ausente." },
        { status: 500 },
      );
    }

    await createOrUpdateLead(sanitized);
    await dispatchPipelineWebhook(sanitized);

    const fromEmail = DEFAULT_FROM_EMAIL || INBOX_EMAIL;
    const from = DEFAULT_FROM_NAME ? `${DEFAULT_FROM_NAME} <${fromEmail}>` : fromEmail;

    const htmlBody = leadNotificationTemplate(sanitized);

    if (isMailerConfigured()) {
      await mailer.sendMail({
        from,
        to: INBOX_EMAIL,
        subject: `Novo lead - ${sanitized.name}`,
        replyTo: `${sanitized.name} <${sanitized.email}>`,
        html: htmlBody,
        headers: {
          "List-Unsubscribe": "<mailto:unsubscribe@appseed.com.br>, <https://appseed.com.br/unsubscribe>",
        },
      });

      if (CONFIRMATION_ENABLED && sanitized.email) {
        await mailer.sendMail({
          from,
          to: sanitized.email,
          subject: "Recebemos sua mensagem",
          html: leadConfirmationTemplate({ name: sanitized.name }),
          headers: {
            "List-Unsubscribe": "<mailto:unsubscribe@appseed.com.br>, <https://appseed.com.br/unsubscribe>",
          },
        });
      }
    } else {
      console.info("[contact] Email não enviado, transporte não configurado.", {
        to: INBOX_EMAIL,
        subject: `Novo lead - ${sanitized.name}`,
      });
    }

    return NextResponse.json({ message: "Mensagem enviada com sucesso." });
  } catch (error) {
    console.error("Contact API error", error);
    return NextResponse.json(
      { message: "Não foi possível enviar sua mensagem." },
      { status: 500 },
    );
  }
}

function sanitizePayload(payload: ContactPayload): SanitizedPayload {
  return {
    name: payload.name?.toString().trim() ?? "",
    email: payload.email?.toString().trim() ?? "",
    company: payload.company?.toString().trim() ?? "",
    phone: payload.phone?.toString().trim() ?? "",
    projectType: payload.projectType?.toString().trim() ?? "",
    budget: payload.budget?.toString().trim() ?? "",
    timeline: payload.timeline?.toString().trim() ?? "",
    message: payload.message?.toString().trim() ?? "",
  };
}

async function createOrUpdateLead(data: SanitizedPayload) {
  const pipeline = await prisma.pipeline.findFirst({
    where: { archived: false },
    orderBy: { createdAt: "asc" },
    include: { stages: { orderBy: { position: "asc" } } },
  });

  if (!pipeline) {
    throw new Error("Nenhum pipeline configurado.");
  }

  const stage =
    pipeline.stages.find((entry) => entry.name === "Lead Novo") ?? pipeline.stages[0];

  if (!stage) {
    throw new Error("Nenhuma etapa disponível no pipeline.");
  }

  const activityContent = buildActivityContent(data);
  const leadMatchFilters: Prisma.LeadWhereInput[] = [];
  if (data.email) {
    leadMatchFilters.push({ email: data.email });
  }
  if (data.phone) {
    leadMatchFilters.push({ phone: data.phone });
  }

  const existingLead = leadMatchFilters.length
    ? await prisma.lead.findFirst({
        where: {
          archived: false,
          OR: leadMatchFilters,
        },
        include: {
          pipeline: {
            select: { workspaceId: true },
          },
        },
      })
    : null;

  if (existingLead) {
    await prisma.activity.create({
      data: {
        workspaceId: existingLead.pipeline.workspaceId,
        leadId: existingLead.id,
        type: ActivityType.note,
        title: activityContent.slice(0, 140),
        content: activityContent,
        status: ActivityStatus.OPEN,
        priority: ActivityPriority.MEDIUM,
      },
    });
    return existingLead;
  }

  await prisma.lead.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      pipelineId: pipeline.id,
      stageId: stage.id,
      activities: {
        create: {
          type: ActivityType.note,
          title: activityContent.slice(0, 140),
          content: activityContent,
          workspaceId: pipeline.workspaceId,
          status: ActivityStatus.OPEN,
          priority: ActivityPriority.MEDIUM,
        },
      },
    },
  });
}

async function dispatchPipelineWebhook(data: SanitizedPayload) {
  if (!CONTACT_PIPELINE_WEBHOOK_URL) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      company: data.company ?? null,
      origin: "contact_form",
      stage: "Lead Novo",
      metadata: {
        projectType: data.projectType ?? null,
        budget: data.budget ?? null,
        timeline: data.timeline ?? null,
        message: data.message ?? null,
      },
    };

    const response = await fetch(CONTACT_PIPELINE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error("contact webhook failed", await response.text());
    }
  } catch (error) {
    console.error("contact webhook error", error);
  }
}

function buildActivityContent(data: SanitizedPayload) {
  const lines = [
    "Lead criado via formulário de contato.",
    data.projectType ? `Tipo de projeto: ${data.projectType}` : null,
    data.budget ? `Orçamento estimado: ${data.budget}` : null,
    data.timeline ? `Prazo desejado: ${data.timeline}` : null,
    data.company ? `Empresa: ${data.company}` : null,
    data.phone ? `Telefone: ${data.phone}` : null,
    "",
    "Mensagem:",
    data.message,
  ].filter(Boolean);

  return lines.join("\n");
}

function leadNotificationTemplate(payload: SanitizedPayload): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:12px 18px; background:#ffffff; border-bottom:1px solid #e2e8f0; font-family:'Segoe UI',Helvetica,Arial,sans-serif; font-size:14px; color:#1f2937;">${escapeHtml(label)
    }</td>
      <td style="padding:12px 18px; background:#ffffff; border-bottom:1px solid #e2e8f0; font-family:'Segoe UI',Helvetica,Arial,sans-serif; font-size:14px; color:#0f172a; font-weight:500;">${escapeHtml(value || "-").replace(/\n/g, "<br />")
    }</td>
    </tr>`;

  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charSet="UTF-8" />
      <title>Novo lead AppSeed</title>
    </head>
    <body style="margin:0;background:#0f172a;padding:32px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(16,185,129,0.35);">
              <tr>
                <td style="padding:28px 32px;background:linear-gradient(135deg,#10b981,#047857);color:#ecfdf5;">
                  <h1 style="margin:0;font-size:24px;font-weight:700;">Novo lead do site</h1>
                  <p style="margin:8px 0 0 0;font-size:14px;color:rgba(236,253,245,0.85);">Recebemos uma nova mensagem pelo formulário de contato.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 0;background:#f8fafc;">
                  <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0 12px;">
                    <tr>
                      <td style="padding:0 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
                          ${row("Nome", payload.name)}
                          ${row("E-mail", payload.email)}
                          ${row("Empresa", payload.company)}
                          ${row("Telefone", payload.phone)}
                          ${row("Tipo de projeto", payload.projectType)}
                          ${row("Orçamento previsto", payload.budget)}
                          ${row("Prazo desejado", payload.timeline)}
                          ${row("Detalhes do projeto", payload.message)}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px;background:#ffffff;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">
                  <p style="margin:0;">Este e-mail foi enviado automaticamente pelo site da AppSeed.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function leadConfirmationTemplate({ name }: { name: string }): string {
  const firstName = name.split(" ")[0] || "";
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charSet="UTF-8" />
      <title>Recebemos sua mensagem</title>
    </head>
    <body style="margin:0;background:#f8fafc;padding:32px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" width="520" style="max-width:520px;width:100%;background:#ffffff;border-radius:28px;overflow-hidden;box-shadow:0 24px 48px -32px rgba(15,23,42,0.35);">
              <tr>
                <td style="padding:32px 36px;background:#0f172a;color:#ecfdf5;text-align:left;">
                  <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                    <tr>
                      <td align="center" valign="middle" style="padding:0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="44" height="44" style="width:44px;height:44px;border-collapse:collapse;">
                          <tr>
                            <td align="center" valign="middle" bgcolor="#E6F7F1"
                                style="width:44px;height:44px;border-radius:14px;">
                              <img src="https://www.appseed.com.br/appseed_logo.png"
                                  alt="AppSeed" width="28" height="24"
                                  style="display:block;margin:0 auto;">
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="padding-left:18px;vertical-align:middle;">
                        <p style="margin:0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(236,253,245,0.65);">AppSeed</p>
                        <h1 style="margin:6px 0 0 0;font-size:24px;font-weight:700;color:#ecfdf5;">Recebemos sua mensagem</h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 36px;color:#0f172a;font-size:15px;line-height:1.6;">
                  <p>Olá ${escapeHtml(firstName)},</p>
                  <p>
                    Agradecemos o seu contato com a AppSeed. Nosso time já recebeu a sua mensagem e em até 24 horas um especialista irá retornar com os próximos passos.
                  </p>
                  <p>
                    Se quiser adiantar o papo, é só responder este e-mail ou chamar a gente pelo telefone/WhatsApp.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 36px 36px 36px;">
                  <table cellpadding="0" cellspacing="0" width="100%" style="border-radius:16px;background:#ecfdf5;padding:20px 24px;">
                    <tr>
                      <td style="color:#047857;font-size:14px;line-height:1.5;">
                        <strong>AppSeed</strong><br />
                        contato@appseed.com.br<br />
                        +55 47 9 9671-8866
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 36px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center;">
                  Este e-mail foi enviado automaticamente pelo site da AppSeed.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
