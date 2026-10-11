"use server";

import { getMembersCollection } from "@/lib/members";
import { createPasswordResetToken } from "@/lib/password-reset";
import { sendTransactionalMail } from "@/lib/mailer";

export type ForgotPasswordState = {
    error?: string;
    success?: boolean;
};

export async function requestPasswordResetAction(
    _prevState: ForgotPasswordState,
    formData: FormData,
): Promise<ForgotPasswordState> {
    const identifier = String(formData.get("identifier") ?? "").trim().toLowerCase();

    if (!identifier) {
        return { error: "Veuillez saisir votre identifiant." };
    }

    try {
        const collection = await getMembersCollection();
        const member = await collection.findOne({ usernameLower: identifier });

        // Always show success to avoid username enumeration
        if (!member || !member._id || !member.siteAccessEnabled) {
            return { success: true };
        }

        // Find the member's email — use email, owner1Email, or owner2Email
        const memberEmail =
            member.email?.trim() ||
            member.owner1Email?.trim() ||
            member.owner2Email?.trim();

        if (!memberEmail) {
            // No email on file — can't send reset
            return { success: true };
        }

        const token = await createPasswordResetToken(member._id.toString());

        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            (process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : "https://www.clubcaninbeauchamp.fr");
        const resetUrl = `${baseUrl}/login/reinitialiser/${token}`;

        const memberName =
            member.firstName || member.dogName || member.username || "Adhérent";

        await sendTransactionalMail({
            to: { email: memberEmail, name: memberName },
            subject:
                "Réinitialisation de votre mot de passe — Club Beauchampois d'Éducation Canine",
            text: [
                `Bonjour ${memberName},`,
                "",
                "Vous avez demandé la réinitialisation de votre mot de passe.",
                "",
                "Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :",
                resetUrl,
                "",
                "Ce lien est valable pendant 1 heure.",
                "",
                "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.",
                "",
                "Cordialement,",
                "Club Beauchampois d'Éducation Canine",
            ].join("\n"),
            html: [
                `<p>Bonjour ${memberName},</p>`,
                "<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>",
                "<p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>",
                `<p style="text-align:center;margin:24px 0">`,
                `<a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:#06607b;color:#ffffff;text-decoration:none;font-weight:700;border-radius:6px;font-size:1rem">`,
                "Réinitialiser mon mot de passe</a></p>",
                "<p style=\"font-size:0.85rem;color:#888\">Ce lien est valable pendant 1 heure.</p>",
                "<p style=\"font-size:0.85rem;color:#888\">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.</p>",
                "<p>Cordialement,<br>Club Beauchampois d'Éducation Canine</p>",
            ].join("\n"),
        });
    } catch (err) {
        console.error("Password reset request error:", err);
        // Don't expose errors — always show success
    }

    return { success: true };
}
