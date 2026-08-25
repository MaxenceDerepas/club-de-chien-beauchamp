"use server";

import { revalidatePath } from "next/cache";
import { requireMemberSession } from "@/lib/member-auth";
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
