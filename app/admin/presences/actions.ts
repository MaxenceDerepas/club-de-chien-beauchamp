"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import {
    saveAttendance,
    searchMemberAttendance,
    countWeekendDays,
    type AttendanceMember,
    type GuestDog,
} from "@/lib/attendance";

export async function saveAttendanceAction(formData: FormData) {
    await requireAdminSession();

    const dateStr = String(formData.get("date") || "");
    const dayOfWeek = Number(formData.get("dayOfWeek") || "0");
    if (!dateStr) return;

    const sessionDate = new Date(dateStr + "T12:00:00.000Z");
    if (Number.isNaN(sessionDate.getTime())) return;

    // Parse present members from JSON
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

    await saveAttendance(sessionDate, dayOfWeek, presentMembers, guestDogs);
    revalidatePath("/admin/presences");
}

export async function searchAttendanceAction(
    memberId: string,
    fromStr: string,
    toStr: string,
) {
    await requireAdminSession();

    const from = new Date(fromStr + "T00:00:00.000Z");
    const to = new Date(toStr + "T23:59:59.999Z");

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        return { sessions: [], totalWeekendDays: 0, presentCount: 0, rate: 0 };
    }

    const sessions = await searchMemberAttendance(memberId, from, to);
    const totalWeekendDays = countWeekendDays(from, to);
    const presentCount = sessions.length;
    const rate = totalWeekendDays > 0 ? Math.round((presentCount / totalWeekendDays) * 100) : 0;

    return {
        sessions: sessions.map((s) => ({
            date: s.sessionDate.toISOString(),
            dayOfWeek: s.dayOfWeek,
        })),
        totalWeekendDays,
        presentCount,
        rate,
    };
}
