const styles = {
  wrapper: "background-color:#0f172a;padding:32px 0;font-family:'Inter','Segoe UI',system-ui,sans-serif;color:#e2e8f0;",
  container: "max-width:520px;margin:0 auto;background-color:#0b1120;border:1px solid rgba(226,232,240,0.1);border-radius:18px;padding:40px 48px;",
  logo: "display:flex;align-items:center;gap:10px;margin-bottom:32px;",
  logoMark:
    "display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background-image:linear-gradient(135deg,#22c55e,#16a34a);color:#0f172a;font-weight:600;font-size:16px;",
  title: "font-size:24px;font-weight:600;margin:0 0 12px;color:#f1f5f9;",
  paragraph: "font-size:15px;line-height:1.6;color:#cbd5f5;margin:0 0 16px;",
  buttonWrapper: "margin:32px 0;text-align:center;",
  button:
    "display:inline-block;background-image:linear-gradient(135deg,#22c55e,#16a34a);color:#0f172a;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;",
  footer: "font-size:12px;color:#64748b;margin-top:32px;text-align:center;line-height:1.5;",
  codeBox:
    "margin:24px 0;padding:18px 20px;background-color:rgba(148,163,184,0.12);border-radius:14px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:13px;color:#94a3b8;",
};

export type PasswordResetTemplateParams = {
  name?: string | null;
  resetUrl: string;
  expiresInHours?: number;
  supportEmail?: string;
};

export function passwordResetTemplate({
  name,
  resetUrl,
  expiresInHours = 2,
  supportEmail,
}: PasswordResetTemplateParams) {
  const firstName = name?.split(" ")[0] ?? "Olá";
  const safeUrl = resetUrl;
  const supportLine = supportEmail
    ? `Precisa de ajuda? Fale conosco em <a href=\"mailto:${supportEmail}\" style=\"color:#22c55e;text-decoration:none;\">${supportEmail}</a>.`
    : "Se você não solicitou esta alteração, ignore esta mensagem.";

  return `
  <div style="${styles.wrapper}">
    <table role="presentation" style="${styles.container}">
      <tr>
        <td>
          <div style="${styles.logo}">
            <span style="${styles.logoMark}">S</span>
            <span style="color:#f8fafc;font-weight:600;font-size:16px;">Seedora</span>
          </div>
          <h1 style="${styles.title}">${firstName}, vamos redefinir sua senha</h1>
          <p style="${styles.paragraph}">
            Recebemos um pedido para atualizar a senha da sua conta. Para concluir o processo, clique no botão abaixo.
            O link ficará válido pelos próximos ${expiresInHours} ${expiresInHours === 1 ? "hora" : "horas"}.
          </p>
          <div style="${styles.buttonWrapper}">
            <a href="${safeUrl}" style="${styles.button}" target="_blank" rel="noopener noreferrer">
              Redefinir minha senha
            </a>
          </div>
          <p style="${styles.paragraph}">
            Caso o botão acima não funcione, copie e cole o endereço abaixo no seu navegador:
          </p>
          <div style="${styles.codeBox}">${safeUrl}</div>
          <p style="${styles.paragraph}">${supportLine}</p>
          <p style="${styles.footer}">
            Esta mensagem foi enviada automaticamente pela Seedora porque alguém solicitou uma alteração de senha.
            Se não foi você, nenhuma ação é necessária.
          </p>
        </td>
      </tr>
    </table>
  </div>
  `;
}
