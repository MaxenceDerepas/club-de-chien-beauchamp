import { getMembersCollection, type MemberRecord } from "@/lib/members";
import { sendTransactionalMail } from "@/lib/mailer";

/**
 * Find active members whose renewalDate is exactly 30 days from now.
 * renewalDate IS the expiry date (not registrationDate + 1 year).
 */
async function getMembersRenewingIn30Days() {
    const collection = await getMembersCollection();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(today);
    target.setDate(target.getDate() + 30);

    const nextDay = new Date(target);
    nextDay.setDate(nextDay.getDate() + 1);

    return collection
        .find({
            membershipActive: true,
            email: { $ne: "" },
            renewalDate: { $ne: null, $gte: target, $lt: nextDay },
        })
        .toArray();
}

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function buildRenewalEmail(member: MemberRecord): {
    subject: string;
    text: string;
} {
    const renewalDate = member.renewalDate!;
    const renewalLabel = formatDate(renewalDate);

    // Date limite = renewalDate + 1 mois
    const deadline = new Date(renewalDate);
    deadline.setMonth(deadline.getMonth() + 1);
    const deadlineLabel = formatDate(deadline);

    const dogName = member.dogName || "votre chien";
    const isRing = member.level === "ring";

    const subject = `CLUB CANIN : renouvellement adhésion ${member.dogName || ""}`.trim();

    if (isRing) {
        return {
            subject,
            text: [
                "Bonjour,",
                "",
                `Comme voté lors de l'Assemblée Générale de 2024, l'adhésion de ${dogName} arrivant à terme le ${renewalLabel}, nous vous informons que vous pouvez d'ores et déjà régler le renouvellement (100€) si vous le souhaitez ; et au plus tard le ${deadlineLabel}.`,
                "",
                "Lors de votre renouvellement, pensez à apporter votre carte d'adhérent, l'attestation d'assurance à jour et également les copies des dernières vaccinations de votre chien.",
                "",
                "Bonne journée à vous.",
                "",
                "Cordialement,",
                "Hervé",
            ].join("\n"),
        };
    }

    return {
        subject,
        text: [
            "Bonjour,",
            "",
            `Comme voté lors de l'Assemblée Générale de 2024, l'adhésion de ${dogName} arrivant à terme le ${renewalLabel}, nous vous informons que vous pouvez d'ores et déjà régler le renouvellement (190€) si vous le souhaitez ; et au plus tard le ${deadlineLabel}.`,
            "",
            "Après cette date, il s'agira d'une nouvelle inscription (au tarif de 230€) et non plus d'un renouvellement.",
            "",
            "Lors de votre renouvellement, pensez à apporter votre carte d'adhérent, l'attestation d'assurance à jour et également les copies des dernières vaccinations de votre chien.",
            "",
            "Bonne journée à vous.",
            "",
            "Cordialement,",
            "Hervé",
        ].join("\n"),
    };
}

export type ReminderResult = {
    sent: string[];
    errors: string[];
};

/**
 * Send membership renewal reminders:
 * - Single email, 30 days before renewalDate
 * - Different content for Ring-level members (100€ vs 190€)
 */
export async function sendMembershipReminders(): Promise<ReminderResult> {
    const result: ReminderResult = { sent: [], errors: [] };

    const members = await getMembersRenewingIn30Days();

    for (const member of members) {
        const name =
            [member.firstName, member.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() || "Adhérent";
        const { subject, text } = buildRenewalEmail(member);

        try {
            await sendTransactionalMail({
                to: { email: member.email, name },
                subject,
                text,
            });
            result.sent.push(`${name} <${member.email}>`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            result.errors.push(`${name} <${member.email}>: ${msg}`);
        }
    }

    return result;
}
