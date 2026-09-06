import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { MemberLevel } from "@/lib/levels";

// ── Types ─────────────────────────────────────────────────────────

export type AttendanceSourceType = "event" | "parcours" | "obeissance";

export type AttendanceMember = {
    memberId: string;
    memberName: string;
    level: MemberLevel;
};

export type GuestDog = {
    name: string;
    ownerName: string;
};

export type AttendanceRecord = {
    _id?: ObjectId;
    /** Which type of activity */
    sourceType: AttendanceSourceType;
    /** ObjectId string of the source (event / health-course / obedience session) */
    sourceId: string;
    /** Denormalised label shown in lists & search results */
    sessionLabel: string;
    /** Date of the session */
    sessionDate: Date;
    /** Members who were actually present (subset of registered) */
    presentMembers: AttendanceMember[];
    /** Guest dogs (non-members doing trial class) */
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
    return db.collection<AttendanceRecord>("attendance_records");
}

// ── CRUD ──────────────────────────────────────────────────────────

/**
 * Get attendance for a specific source session.
 */
export async function getAttendanceBySource(
    sourceType: AttendanceSourceType,
    sourceId: string,
) {
    const col = await getAttendanceCollection();
    return col.findOne({ sourceType, sourceId });
}

/**
 * Save (create or update) attendance for a source session.
 */
export async function saveAttendance(
    sourceType: AttendanceSourceType,
    sourceId: string,
    sessionLabel: string,
    sessionDate: Date,
    presentMembers: AttendanceMember[],
    guestDogs: GuestDog[],
) {
    const col = await getAttendanceCollection();
    const now = new Date();

    const existing = await col.findOne({ sourceType, sourceId });

    if (existing) {
        await col.updateOne(
            { _id: existing._id },
            {
                $set: {
                    sessionLabel,
                    presentMembers,
                    guestDogs,
                    updatedAt: now,
                },
            },
        );
        return existing._id;
    }

    const result = await col.insertOne({
        sourceType,
        sourceId,
        sessionLabel,
        sessionDate,
        presentMembers,
        guestDogs,
        createdAt: now,
        updatedAt: now,
    });
    return result.insertedId;
}

/**
 * List all attendance records, optionally filtered by source type.
 */
export async function listAttendanceRecords(sourceType?: AttendanceSourceType) {
    const col = await getAttendanceCollection();
    const filter = sourceType ? { sourceType } : {};
    return col.find(filter).sort({ sessionDate: -1 }).toArray();
}

/**
 * Search attendance for a specific member, optionally filtered by source type.
 */
export async function searchMemberAttendance(
    memberId: string,
    from: Date,
    to: Date,
    sourceType?: AttendanceSourceType,
) {
    const col = await getAttendanceCollection();
    const start = new Date(from);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setUTCHours(23, 59, 59, 999);

    const filter: Record<string, unknown> = {
        sessionDate: { $gte: start, $lte: end },
        "presentMembers.memberId": memberId,
    };
    if (sourceType) filter.sourceType = sourceType;

    return col.find(filter).sort({ sessionDate: 1 }).toArray();
}

/**
 * Count total sessions of a given type in a date range.
 * Counts from the actual source collections.
 */
export async function countSessionsInRange(
    from: Date,
    to: Date,
    sourceType?: AttendanceSourceType,
): Promise<number> {
    const db = await getDb();
    const start = new Date(from);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setUTCHours(23, 59, 59, 999);

    const dateFilter = { $gte: start, $lte: end };
    let total = 0;

    if (!sourceType || sourceType === "parcours") {
        total += await db
            .collection("health_courses")
            .countDocuments({ sessionDate: dateFilter });
    }
    if (!sourceType || sourceType === "obeissance") {
        total += await db
            .collection("obedience_sessions")
            .countDocuments({ sessionDate: dateFilter });
    }
    if (!sourceType || sourceType === "event") {
        total += await db
            .collection("events")
            .countDocuments({ eventDate: dateFilter, isPublished: true });
    }

    return total;
}

export const SOURCE_LABELS: Record<AttendanceSourceType, string> = {
    event: "Événement",
    parcours: "Parcours de santé",
    obeissance: "Obéissance",
};
