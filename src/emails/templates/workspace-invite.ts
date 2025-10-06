const styles = {
  wrapper: "background-color:#0f172a;padding:32px 0;font-family:'Inter','Segoe UI',system-ui,sans-serif;color:#e2e8f0;",
  container: "max-width:520px;margin:0 auto;background-color:#0b1120;border:1px solid rgba(226,232,240,0.1);border-radius:18px;padding:40px 48px;",
  logo: "display:flex;align-items:center;gap:10px;margin-bottom:32px;",
  logoMark:
    "display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background-image:linear-gradient(135deg,#6366f1,#22d3ee);color:#0f172a;font-weight:600;font-size:16px;",
  title: "font-size:24px;font-weight:600;margin:0 0 12px;color:#f1f5f9;",
  paragraph: "font-size:15px;line-height:1.6;color:#cbd5f5;margin:0 0 16px;",
  badge: "display:inline-block;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;background-color:rgba(96,165,250,0.16);color:#60a5fa;margin-top:4px;",
  buttonWrapper: "margin:32px 0;text-align:center;",
  button:
    "display:inline-block;background-image:linear-gradient(135deg,#6366f1,#22d3ee);color:#0f172a;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;",
  footer: "font-size:12px;color:#64748b;margin-top:32px;text-align:center;line-height:1.5;",
  codeBox:
    "margin:24px 0;padding:18px 20px;background-color:rgba(148,163,184,0.12);border-radius:14px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:13px;color:#94a3b8;",
};

export type WorkspaceInviteTemplateParams = {
  inviteeName?: string | null;
  inviterName?: string | null;
  workspaceName: string;
  acceptUrl: string;
  expiresInHours?: number;
  supportEmail?: string;
  role: string;
};

export function workspaceInviteTemplate({
  inviteeName,
  inviterName,
  workspaceName,
  acceptUrl,
  expiresInHours = 48,
  supportEmail,
  role,
}: WorkspaceInviteTemplateParams) {
  const greetingName = inviteeName?.split(" ")[0] ?? "Olá";
  const inviter = inviterName ? `${inviterName} convidou você` : "Você foi convidado";
  const supportLine = supportEmail
    ? `Dúvidas? Escreva para <a href=\"mailto:${supportEmail}\" style=\"color:#22d3ee;text-decoration:none;\">${supportEmail}</a>.`
    : "Se você não solicitou este convite, ignore este e-mail.";

  return `
  <div style="${styles.wrapper}">
    <table role="presentation" style="${styles.container}">
      <tr>
        <td>
          <div style="${styles.logo}">
            <span style="${styles.logoMark}">S</span>
            <span style="color:#f8fafc;font-weight:600;font-size:16px;">Seedora</span>
          </div>
          <h1 style="${styles.title}">${greetingName}, ${inviter}</h1>
          <p style="${styles.paragraph}">
            Você recebeu acesso ao workspace <strong>${workspaceName}</strong> com o papel abaixo:
          </p>
          <span style="${styles.badge}">${role}</span>
          <p style="${styles.paragraph}">
            Clique no botão para aceitar o convite. O link é válido por ${expiresInHours} ${expiresInHours === 1 ? "hora" : "horas"}.
          </p>
          <div style="${styles.buttonWrapper}">
            <a href="${acceptUrl}" style="${styles.button}" target="_blank" rel="noopener noreferrer">
              Aceitar convite
            </a>
          </div>
          <p style="${styles.paragraph}">Se preferir, copie o endereço abaixo no navegador:</p>
          <div style="${styles.codeBox}">${acceptUrl}</div>
          <p style="${styles.paragraph}">${supportLine}</p>
          <p style="${styles.footer}">
            Você está recebendo este e-mail porque sua conta Seedora foi convidada para um workspace.
            Se não reconhecer o convite, é seguro ignorar.
          </p>
        </td>
      </tr>
    </table>
  </div>
  `;
}
