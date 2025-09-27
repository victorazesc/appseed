// Configuração de transporte
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com", // servidor SMTP da Hostinger
    port: 465,                  // 465 (SSL) ou 587 (STARTTLS)
    secure: true,               // true para 465, false para 587
    auth: {
        user: process.env.SMTP_EMAIL, // seu e-mail completo da Hostinger
        pass: process.env.SMTP_PASS,  // sua senha ou app password
    },
});

export default transporter;