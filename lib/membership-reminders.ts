import { getMembersCollection, type MemberRecord } from "@/lib/members";
import { sendTransactionalMail } from "@/lib/mailer";

/**
 * Find active members whose membership expires in exactly `daysBeforeExpiry` days.
 * Membership = 1 year from registrationDate (rolling).
 */
async function getMembersExpiringIn(daysBeforeExpiry: number) {
    const collection = await getMembersCollection();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Target registration date: members who registered exactly
    // (365 - daysBeforeExpiry) days ago expire in daysBeforeExpiry days.
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - (365 - daysBeforeExpiry));

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return collection
        .find({
            membershipActive: true,
            email: { $ne: "" },
            registrationDate: { $gte: targetDate, $lt: nextDay },
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

function buildReminderEmail(
    member: MemberRecord,
    daysLeft: number,
): { subject: string; text: string } {
    const expiryDate = new Date(member.registrationDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const expiryLabel = formatDate(expiryDate);

    if (daysLeft <= 7) {
        return {
            subject: `Rappel : votre adhésion expire le ${expiryLabel}`,
            text: [
                `Bonjour ${member.firstName},`,
                "",
                `Votre adhésion au Club Beauchampois d'Éducation Canine expire le ${expiryLabel}, soit dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}.`,
                "",
                "Pensez à renouveler votre inscription auprès du club pour continuer à profiter des activités.",
                "",
                "À bientôt sur le terrain !",
                "Club Beauchampois d'Éducation Canine",
            ].join("\n"),
        };
    }

    return {
        subject: `Votre adhésion expire bientôt (${expiryLabel})`,
        text: [
            `Bonjour ${member.firstName},`,
            "",
            `Votre adhésion au Club Beauchampois d'Éducation Canine arrive à échéance le ${expiryLabel}, soit dans environ ${daysLeft} jours.`,
            "",
            "N'hésitez pas à venir renouveler votre inscription lors de votre prochaine visite au club.",
            "",
            "À bientôt !",
            "Club Beauchampois d'Éducation Canine",
        ].join("\n"),
    };
}

export type ReminderResult = {
    sent30: string[];
    sent7: string[];
    errors: string[];
};

/**
 * Send membership expiry reminders:
 * - 30 days before expiry
 * - 7 days before expiry
 */
export async function sendMembershipReminders(): Promise<ReminderResult> {
    const result: ReminderResult = { sent30: [], sent7: [], errors: [] };

    const batches: { days: number; key: "sent30" | "sent7" }[] = [
        { days: 30, key: "sent30" },
        { days: 7, key: "sent7" },
    ];

    for (const { days, key } of batches) {
        const members = await getMembersExpiringIn(days);

        for (const member of members) {
            const name =
                [member.firstName, member.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim() || "Adhérent";
            const { subject, text } = buildReminderEmail(member, days);

            try {
                await sendTransactionalMail({
                    to: { email: member.email, name },
                    subject,
                    text,
                });
                result[key].push(`${name} <${member.email}>`);
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                result.errors.push(`${name} <${member.email}>: ${msg}`);
            }
        }
    }

    return result;
}
