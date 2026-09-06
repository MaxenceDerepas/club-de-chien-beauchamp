"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import {
    saveAttendance,
    searchMemberAttendance,
    countSessionsInRange,
    type AttendanceMember,
    type AttendanceSourceType,
    type GuestDog,
} from "@/lib/attendance";

export async function saveAttendanceAction(formData: FormData) {
    await requireAdminSession();

    const sourceType = String(formData.get("sourceType") || "") as AttendanceSourceType;
    const sourceId = String(formData.get("sourceId") || "");
    const sessionLabel = String(formData.get("sessionLabel") || "");
    const dateStr = String(formData.get("sessionDate") || "");

    if (!sourceType || !sourceId || !dateStr) return;

    const sessionDate = new Date(dateStr);
    if (Number.isNaN(sessionDate.getTime())) return;

    const membersJson = String(formData.get("presentMembers") || "[]");
    const guestsJson = String(formData.get("guestDogs") || "[]");

    let presentMembers: AttendanceMember[] = [];
    let guestDogs: GuestDog[] = [];

    try {
        presentMembers = JSON.parse(membersJson);
        guestDogs = JSON.parse(guestsJson);
    } catch {
        return;
    }

    await saveAttendance(sourceType, sourceId, sessionLabel, sessionDate, presentMembers, guestDogs);
    revalidatePath("/admin/presences");
}

export async function searchAttendanceAction(
    memberId: string,
    fromStr: string,
    toStr: string,
    sourceType?: AttendanceSourceType,
) {
    await requireAdminSession();

    const from = new Date(fromStr + "T00:00:00.000Z");
    const to = new Date(toStr + "T23:59:59.999Z");

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        return { sessions: [], totalSessions: 0, presentCount: 0, rate: 0 };
    }

    const sessions = await searchMemberAttendance(memberId, from, to, sourceType);
    const totalSessions = await countSessionsInRange(from, to, sourceType);
    const presentCount = sessions.length;
    const rate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    return {
        sessions: sessions.map((s) => ({
            date: s.sessionDate.toISOString(),
            sourceType: s.sourceType,
            sessionLabel: s.sessionLabel,
        })),
        totalSessions,
        presentCount,
        rate,
    };
}
