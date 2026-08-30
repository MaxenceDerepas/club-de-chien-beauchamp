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
} from "@/lib/health-courses";
import { meetsMinLevel } from "@/lib/members";

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

    const sessionId = String(formData.get("sessionId") || "");
    if (!sessionId || !member._id) return;

    if (!member.healthCourse) {
        return;
    }

    const session = await getHealthCourseById(sessionId);
    if (!session || !session.sessionDate) return;

    const sevenDaysBefore = new Date(session.sessionDate);
    sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
    sevenDaysBefore.setHours(23, 59, 59, 999);
    if (new Date() > sevenDaysBefore) {
        return;
    }

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
    revalidatePath(`/admin/parcours-sante/${sessionId}`);
}

export async function cancelHealthCourseRegistrationAction(
    formData: FormData,
) {
    const member = await requireMemberSession();

    const sessionId = String(formData.get("sessionId") || "");
    if (!sessionId || !member._id) return;

    const session = await getHealthCourseById(sessionId);
    if (!session || !session.sessionDate) return;

    const sevenDaysBefore = new Date(session.sessionDate);
    sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
    sevenDaysBefore.setHours(23, 59, 59, 999);
    if (new Date() > sevenDaysBefore) {
        return;
    }

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
    });

    return { success: true };
}
