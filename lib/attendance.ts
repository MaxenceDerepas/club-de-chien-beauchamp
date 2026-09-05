import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { MemberLevel } from "@/lib/levels";

// ── Types ─────────────────────────────────────────────────────────

export type AttendanceMember = {
    memberId: string;
    memberName: string;
    level: MemberLevel;
};

export type GuestDog = {
    name: string;
    ownerName: string;
};

export type AttendanceSession = {
    _id?: ObjectId;
    sessionDate: Date;
    /** 6=Samedi, 0=Dimanche */
    dayOfWeek: number;
    presentMembers: AttendanceMember[];
    guestDogs: GuestDog[];
    createdAt: Date;
    updatedAt: Date;
};

// ── Collection ────────────────────────────────────────────────────

function getDb() {
    return clientPromise.then((client) => client.db("club-canin"));
}

export async function getAttendanceCollection() {
    const db = await getDb();
    return db.collection<AttendanceSession>("attendance_sessions");
}

// ── CRUD ──────────────────────────────────────────────────────────

/**
 * Get attendance session for a specific date.
 */
export async function getAttendanceByDate(date: Date) {
    const col = await getAttendanceCollection();
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCHours(23, 59, 59, 999);

    return col.findOne({ sessionDate: { $gte: start, $lte: end } });
}

/**
 * Save (create or update) attendance for a date.
 */
export async function saveAttendance(
    date: Date,
    dayOfWeek: number,
    presentMembers: AttendanceMember[],
    guestDogs: GuestDog[],
) {
    const col = await getAttendanceCollection();
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCHours(23, 59, 59, 999);

    const now = new Date();

    const existing = await col.findOne({ sessionDate: { $gte: start, $lte: end } });

    if (existing) {
        await col.updateOne(
            { _id: existing._id },
            {
                $set: {
                    presentMembers,
                    guestDogs,
                    updatedAt: now,
                },
            },
        );
        return existing._id;
    }

    const result = await col.insertOne({
        sessionDate: start,
        dayOfWeek,
        presentMembers,
        guestDogs,
        createdAt: now,
        updatedAt: now,
    });
    return result.insertedId;
}

/**
 * List attendance sessions in a date range.
 */
export async function listAttendanceSessions(from: Date, to: Date) {
    const col = await getAttendanceCollection();
    const start = new Date(from);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setUTCHours(23, 59, 59, 999);

    return col
        .find({ sessionDate: { $gte: start, $lte: end } })
        .sort({ sessionDate: 1 })
        .toArray();
}

/**
 * List all attendance sessions (for calendar overview).
 */
export async function listAllAttendanceSessions() {
    const col = await getAttendanceCollection();
    return col.find({}).sort({ sessionDate: 1 }).toArray();
}

/**
 * Search attendance for a specific member over a date range.
 * Returns sessions where the member was present.
 */
export async function searchMemberAttendance(
    memberId: string,
    from: Date,
    to: Date,
) {
    const col = await getAttendanceCollection();
    const start = new Date(from);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setUTCHours(23, 59, 59, 999);

    return col
        .find({
            sessionDate: { $gte: start, $lte: end },
            "presentMembers.memberId": memberId,
        })
        .sort({ sessionDate: 1 })
        .toArray();
}

/**
 * Count total sessions (Saturdays + Sundays) in a date range.
 * Used to compute participation rate.
 */
export function countWeekendDays(from: Date, to: Date): number {
    let count = 0;
    const d = new Date(from);
    d.setUTCHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setUTCHours(23, 59, 59, 999);

    while (d <= end) {
        const dow = d.getUTCDay();
        if (dow === 0 || dow === 6) count++;
        d.setUTCDate(d.getUTCDate() + 1);
    }
    return count;
}

export const DAY_LABELS: Record<number, string> = {
    0: "Dimanche",
    6: "Samedi",
};
