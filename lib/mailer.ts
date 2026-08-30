const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function getApiKey(): string {
    const key = process.env.BREVO_API_KEY;
    if (!key) {
        throw new Error("Missing environment variable: BREVO_API_KEY");
    }
    return key;
}

function getSender(): { name: string; email: string } {
    return {
        name:
            process.env.BREVO_SENDER_NAME ||
            "Club Beauchampois d'Éducation Canine",
        email:
            process.env.BREVO_SENDER_EMAIL ||
            "clubcaninbeauchamp@hotmail.com",
    };
}

async function brevoSend(payload: Record<string, unknown>): Promise<void> {
    const res = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
            "api-key": getApiKey(),
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Brevo API error ${res.status}: ${body}`);
    }
}

// ── Emails groupés (admin → adhérents) ──────────────────────────────

export type SendBulkMailOptions = {
    subject: string;
    text: string;
    html?: string;
    bcc: string[];
    replyTo?: string;
};

export async function sendBulkMail({
    subject,
    text,
    html,
    bcc,
    replyTo,
}: SendBulkMailOptions) {
    if (bcc.length === 0) {
        throw new Error("Aucun destinataire.");
    }

    const sender = getSender();

    const payload: Record<string, unknown> = {
        sender,
        // Brevo requires at least one "to"; we send to ourselves and BCC the rest
        to: [{ email: sender.email, name: sender.name }],
        bcc: bcc.map((email) => ({ email })),
        subject,
        textContent: text,
    };

    if (html) {
        payload.htmlContent = html;
    }

    if (replyTo) {
        payload.replyTo = { email: replyTo };
    }

    await brevoSend(payload);
}

// ── Email transactionnel (individuel) ───────────────────────────────

export type SendTransactionalMailOptions = {
    to: { email: string; name?: string };
    subject: string;
    text: string;
    html?: string;
    replyTo?: string;
};

export async function sendTransactionalMail({
    to,
    subject,
    text,
    html,
    replyTo,
}: SendTransactionalMailOptions) {
    const sender = getSender();

    const payload: Record<string, unknown> = {
        sender,
        to: [{ email: to.email, name: to.name || to.email }],
        subject,
        textContent: text,
    };

    if (html) {
        payload.htmlContent = html;
    }

    if (replyTo) {
        payload.replyTo = { email: replyTo };
    }

    await brevoSend(payload);
}
