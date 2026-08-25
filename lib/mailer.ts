import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

function getEnv(name: string) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export function getMailTransporter(): Transporter {
    if (cachedTransporter) return cachedTransporter;

    const host = getEnv("SMTP_HOST");
    const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
    });

    return cachedTransporter;
}

export type SendMailOptions = {
    subject: string;
    text: string;
    bcc: string[];
    replyTo?: string;
};

export async function sendBulkMail({
    subject,
    text,
    bcc,
    replyTo,
}: SendMailOptions) {
    if (bcc.length === 0) {
        throw new Error("Aucun destinataire.");
    }

    const from =
        process.env.SMTP_FROM ||
        `"Club canin" <${process.env.SMTP_USER ?? "no-reply@localhost"}>`;

    const transporter = getMailTransporter();

    await transporter.sendMail({
        from,
        to: from,
        bcc,
        subject,
        text,
        replyTo,
    });
}
