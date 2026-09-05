"use server";

import { revalidatePath } from "next/cache";
import {
    requireMemberSession,
    hashMemberPassword,
    verifyMemberPassword,
} from "@/lib/member-auth";
import { updateMember } from "@/lib/members";
import { getEventById, requestEventRegistration } from "@/lib/events";
import {
    requestHealthCourseRegistration,
    cancelHealthCourseRegistration,
    getHealthCourseById,
    getOrCreateHealthCourseForDate,
} from "@/lib/health-courses";
import { meetsMinLevel } from "@/lib/members";
import {
    getOrCreateObedienceForDate,
    requestObedienceRegistration,
    cancelObedienceRegistration,
    markObedienceAbsent,
    getAdminsToNotifyForDay,
    DAY_LABELS,
} from "@/lib/obedience";
import { createNotification, markAllNotificationsRead } from "@/lib/notifications";

export async function preregisterForEventAction(formData: FormData) {
    const member = await requireMemberSession();

    const eventId = String(formData.get("eventId") || "");
    if (!eventId || !member._id) return;

    const event = await getEventById(eventId);
    if (!event) return;

    if (!meetsMinLevel(member.level, event.minLevel)) {
        return;
    }

    const memberName =
        [member.firstName, member.lastName].filter(Boolean).join(" ").trim() ||
        member.dogName ||
        "Adhérent";

    try {
        await requestEventRegistration(eventId, {
            memberId: member._id.toString(),
            memberName,
            memberLevel: member.level,
        });
    } catch (err) {
        console.error("Preregistration error", err);
    }

    revalidatePath("/membre");
    revalidatePath("/admin/evenements");
    revalidatePath(`/admin/evenements/${eventId}`);
}

export async function preregisterForHealthCourseAction(formData: FormData) {
    const member = await requireMemberSession();
    if (!member._id) return;

    if (!member.healthCourse) return;

    // Accept date as YYYY-MM-DD string (timezone-safe)
    const dateStr = String(formData.get("date") || "");
    if (!dateStr) return;

    // Parse as UTC noon to avoid any day-boundary timezone shifts
    const sundayDate = new Date(dateStr + "T12:00:00.000Z");
    if (Number.isNaN(sundayDate.getTime())) return;

    // Check 7-day cutoff (use UTC to stay consistent)
    const sevenDaysBefore = new Date(sundayDate);
    sevenDaysBefore.setUTCDate(sevenDaysBefore.getUTCDate() - 7);
    sevenDaysBefore.setUTCHours(23, 59, 59, 999);
    if (new Date() > sevenDaysBefore) return;

    // Auto-create session if it doesn't exist
    const session = await getOrCreateHealthCourseForDate(sundayDate);
    const sessionId = session._id!.toString();

    const memberName =
        [member.firstName, member.lastName].filter(Boolean).join(" ").trim() ||
        member.dogName ||
        "Adhérent";

    try {
        await requestHealthCourseRegistration(sessionId, {
            memberId: member._id.toString(),
            memberName,
        });
    } catch (err) {
        console.error("Health course preregistration error", err);
    }

    revalidatePath("/membre");
    revalidatePath("/admin/parcours-sante");
}

export async function cancelHealthCourseRegistrationAction(
    formData: FormData,
) {
    const member = await requireMemberSession();

    const sessionId = String(formData.get("sessionId") || "");
    if (!sessionId || !member._id) return;

    try {
        await cancelHealthCourseRegistration(
            sessionId,
            member._id.toString(),
        );
    } catch (err) {
        console.error("Health course cancel error", err);
    }

    revalidatePath("/membre");
    revalidatePath("/admin/parcours-sante");
}

// ── Obéissance actions ─────────────────────────────────────────────

function getMemberName(member: { firstName: string; lastName: string; dogName: string }) {
    return (
        [member.firstName, member.lastName].filter(Boolean).join(" ").trim() ||
        member.dogName ||
        "Adhérent"
    );
}

async function sendObedienceNotification(
    dayOfWeek: number,
    dateStr: string,
    memberName: string,
    memberId: string,
    action: "inscription" | "désinscription" | "absent",
) {
    try {
        const admins = await getAdminsToNotifyForDay(dayOfWeek);
        if (admins.length === 0) return;

        const dayLabel = DAY_LABELS[dayOfWeek] || "Jour";
        const actionLabel =
            action === "inscription"
                ? "s'est inscrit(e)"
                : action === "désinscription"
                  ? "s'est désinscrit(e)"
                  : "s'est signalé(e) absent(e)";
        const message = `${memberName} ${actionLabel} — Obéissance ${dayLabel} ${dateStr}`;
        const key = `obedience:${dateStr}:${memberId}`;

        for (const admin of admins) {
            await createNotification(admin.id, message, "/admin/obeissance", key);
        }
    } catch (err) {
        console.error("Obedience notification error", err);
    }
}

export async function preregisterForObedienceAction(formData: FormData) {
    const member = await requireMemberSession();
    if (!member._id) return;

    if (!member.obedience && !member.isAdmin) return;

    const dateStr = String(formData.get("date") || "");
    const dayOfWeek = Number(formData.get("dayOfWeek") || "0");
    const time = String(formData.get("time") || "");
    if (!dateStr || !dayOfWeek || !time) return;

    const sessionDate = new Date(dateStr + "T12:00:00.000Z");
    if (Number.isNaN(sessionDate.getTime())) return;

    const session = await getOrCreateObedienceForDate(sessionDate, dayOfWeek, time);
    const sessionId = session._id!.toString();

    const memberName = getMemberName(member);

    try {
        await requestObedienceRegistration(sessionId, {
            memberId: member._id.toString(),
            memberName,
        });

        await sendObedienceNotification(dayOfWeek, dateStr, memberName, member._id.toString(), "inscription");
    } catch (err) {
        console.error("Obedience preregistration error", err);
    }

    revalidatePath("/membre");
    revalidatePath("/admin/obeissance");
}

export async function cancelObedienceRegistrationAction(formData: FormData) {
    const member = await requireMemberSession();
    if (!member._id) return;

    const sessionId = String(formData.get("sessionId") || "");
    if (!sessionId) return;

    const memberName = getMemberName(member);

    // Get session info for notification
    const { getObedienceSessionById } = await import("@/lib/obedience");
    const session = await getObedienceSessionById(sessionId);

    try {
        await cancelObedienceRegistration(sessionId, member._id.toString());

        if (session) {
            const d = new Date(session.sessionDate);
            const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
            await sendObedienceNotification(session.dayOfWeek, dateStr, memberName, member._id.toString(), "désinscription");
        }
    } catch (err) {
        console.error("Obedience cancel error", err);
    }

    revalidatePath("/membre");
    revalidatePath("/admin/obeissance");
}

export async function markAbsentObedienceAction(formData: FormData) {
    const member = await requireMemberSession();
    if (!member._id) return;

    if (!member.obedience && !member.isAdmin) return;

    const dateStr = String(formData.get("date") || "");
    const dayOfWeek = Number(formData.get("dayOfWeek") || "0");
    const time = String(formData.get("time") || "");
    if (!dateStr || !dayOfWeek || !time) return;

    const sessionDate = new Date(dateStr + "T12:00:00.000Z");
    if (Number.isNaN(sessionDate.getTime())) return;

    const session = await getOrCreateObedienceForDate(sessionDate, dayOfWeek, time);
    const sessionId = session._id!.toString();

    const memberName = getMemberName(member);

    try {
        await markObedienceAbsent(sessionId, member._id.toString(), memberName);
        await sendObedienceNotification(dayOfWeek, dateStr, memberName, member._id.toString(), "absent");
    } catch (err) {
        console.error("Obedience absent error", err);
    }

    revalidatePath("/membre");
    revalidatePath("/admin/obeissance");
}

export async function changePasswordAction(
    formData: FormData,
): Promise<{ success: boolean; error?: string }> {
    const member = await requireMemberSession();
    if (!member._id) return { success: false, error: "Session invalide." };

    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");

    if (!currentPassword || !newPassword) {
        return { success: false, error: "Veuillez remplir tous les champs." };
    }

    if (newPassword.length < 4) {
        return {
            success: false,
            error: "Le nouveau mot de passe doit contenir au moins 4 caractères.",
        };
    }

    const ok = verifyMemberPassword(
        currentPassword,
        member.passwordSalt,
        member.passwordHash,
    );
    if (!ok) {
        return { success: false, error: "Mot de passe actuel incorrect." };
    }

    const { hash, salt } = hashMemberPassword(newPassword);
    await updateMember(member._id.toString(), {
        passwordHash: hash,
        passwordSalt: salt,
        hasChangedPassword: true,
    });

    return { success: true };
}

export async function markNotificationsReadAction() {
    const member = await requireMemberSession();
    if (!member._id || !member.isAdmin) return;
    await markAllNotificationsRead(member._id.toString());
    revalidatePath("/membre");
}
