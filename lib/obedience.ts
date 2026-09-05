import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type ObedienceRegistrationStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "absent";

export type ObedienceRegistration = {
    memberId: string;
    memberName: string;
    requestedAt: Date;
    status: ObedienceRegistrationStatus;
};

export type ObedienceSession = {
    _id?: ObjectId;
    sessionDate: Date;
    /** 2=Mardi, 4=Jeudi, 6=Samedi */
    dayOfWeek: number;
    /** "18:30" or "13:15" */
    time: string;
    registrations: ObedienceRegistration[];
    createdAt: Date;
    updatedAt: Date;
};

/** Which days each admin receives notifications for */
export type ObedienceNotifConfig = {
    _id?: ObjectId;
    memberId: string;
    /** Days of week to notify: 2=Mardi, 4=Jeudi, 6=Samedi */
    days: number[];
};

function getDb() {
    return clientPromise.then((client) => client.db("club-canin"));
}

export async function getObedienceCollection() {
    const db = await getDb();
    return db.collection<ObedienceSession>("obedience_sessions");
}

export async function getObedienceNotifCollection() {
    const db = await getDb();
    return db.collection<ObedienceNotifConfig>("obedience_notif_config");
}

// ── Sessions CRUD ──────────────────────────────────────────────────

export async function listObedienceSessions() {
    const collection = await getObedienceCollection();
    return collection
        .find({})
        .sort({ sessionDate: 1 })
        .toArray();
}

export async function getObedienceSessionById(id: string) {
    const collection = await getObedienceCollection();
    if (!ObjectId.isValid(id)) return null;
    return collection.findOne({ _id: new ObjectId(id) });
}

/** Obedience schedule: Tue 18:30, Thu 18:30, Sat 13:15 */
const OBEDIENCE_SCHEDULE: { dayOfWeek: number; time: string }[] = [
    { dayOfWeek: 2, time: "18:30" },
    { dayOfWeek: 4, time: "18:30" },
    { dayOfWeek: 6, time: "13:15" },
];

/**
 * Get all obedience-day dates in a given month (Tue, Thu, Sat).
 */
export function getObedienceDatesOfMonth(
    year: number,
    month: number,
): { date: Date; dayOfWeek: number; time: string }[] {
    const dates: { date: Date; dayOfWeek: number; time: string }[] = [];
    const d = new Date(Date.UTC(year, month, 1));

    while (d.getUTCMonth() === month) {
        const dow = d.getUTCDay();
        const schedule = OBEDIENCE_SCHEDULE.find((s) => s.dayOfWeek === dow);
        if (schedule) {
            dates.push({
                date: new Date(d),
                dayOfWeek: dow,
                time: schedule.time,
            });
        }
        d.setUTCDate(d.getUTCDate() + 1);
    }

    return dates;
}

/**
 * Find or auto-create an obedience session for a given date.
 */
export async function getOrCreateObedienceForDate(
    sessionDate: Date,
    dayOfWeek: number,
    time: string,
) {
    const collection = await getObedienceCollection();

    const start = new Date(sessionDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCHours(23, 59, 59, 999);

    const existing = await collection.findOne({
        sessionDate: { $gte: start, $lte: end },
        dayOfWeek,
    });

    if (existing) return existing;

    const now = new Date();
    const newSession: Omit<ObedienceSession, "_id"> = {
        sessionDate: start,
        dayOfWeek,
        time,
        registrations: [],
        createdAt: now,
        updatedAt: now,
    };

    const result = await collection.insertOne(newSession);
    return { ...newSession, _id: result.insertedId };
}

export async function requestObedienceRegistration(
    sessionId: string,
    registration: Omit<ObedienceRegistration, "requestedAt" | "status">,
) {
    const collection = await getObedienceCollection();
    if (!ObjectId.isValid(sessionId)) {
        throw new Error("ID séance invalide.");
    }

    const _id = new ObjectId(sessionId);
    const session = await collection.findOne({ _id });
    if (!session) throw new Error("Séance introuvable.");

    const existing = session.registrations.find(
        (r) => r.memberId === registration.memberId,
    );

    if (existing) {
        // If previously rejected or absent, re-register as pending
        if (existing.status === "rejected" || existing.status === "absent") {
            await collection.updateOne(
                { _id, "registrations.memberId": registration.memberId },
                {
                    $set: {
                        "registrations.$.status": "approved",
                        "registrations.$.requestedAt": new Date(),
                        updatedAt: new Date(),
                    },
                },
            );
        }
        return;
    }

    await collection.updateOne(
        { _id },
        {
            $push: {
                registrations: {
                    ...registration,
                    requestedAt: new Date(),
                    status: "approved",
                },
            },
            $set: { updatedAt: new Date() },
        },
    );
}

export async function cancelObedienceRegistration(
    sessionId: string,
    memberId: string,
) {
    const collection = await getObedienceCollection();
    if (!ObjectId.isValid(sessionId)) {
        throw new Error("ID séance invalide.");
    }

    const _id = new ObjectId(sessionId);
    await collection.updateOne(
        { _id },
        {
            $pull: { registrations: { memberId } },
            $set: { updatedAt: new Date() },
        },
    );
}

export async function markObedienceAbsent(
    sessionId: string,
    memberId: string,
    memberName: string,
) {
    const collection = await getObedienceCollection();
    if (!ObjectId.isValid(sessionId)) {
        throw new Error("ID séance invalide.");
    }

    const _id = new ObjectId(sessionId);
    const session = await collection.findOne({ _id });
    if (!session) throw new Error("Séance introuvable.");

    const existing = session.registrations.find(
        (r) => r.memberId === memberId,
    );

    if (existing) {
        // Update existing registration to absent
        await collection.updateOne(
            { _id, "registrations.memberId": memberId },
            {
                $set: {
                    "registrations.$.status": "absent",
                    updatedAt: new Date(),
                },
            },
        );
    } else {
        // Add new registration as absent
        await collection.updateOne(
            { _id },
            {
                $push: {
                    registrations: {
                        memberId,
                        memberName,
                        requestedAt: new Date(),
                        status: "absent",
                    },
                },
                $set: { updatedAt: new Date() },
            },
        );
    }
}

export async function approveObedienceRegistration(
    sessionId: string,
    memberId: string,
) {
    const collection = await getObedienceCollection();
    if (!ObjectId.isValid(sessionId)) {
        throw new Error("ID séance invalide.");
    }

    await collection.updateOne(
        {
            _id: new ObjectId(sessionId),
            "registrations.memberId": memberId,
        },
        {
            $set: {
                "registrations.$.status": "approved",
                updatedAt: new Date(),
            },
        },
    );
}

export async function rejectObedienceRegistration(
    sessionId: string,
    memberId: string,
) {
    const collection = await getObedienceCollection();
    if (!ObjectId.isValid(sessionId)) {
        throw new Error("ID séance invalide.");
    }

    await collection.updateOne(
        {
            _id: new ObjectId(sessionId),
            "registrations.memberId": memberId,
        },
        {
            $set: {
                "registrations.$.status": "rejected",
                updatedAt: new Date(),
            },
        },
    );
}

// ── Notification config CRUD ───────────────────────────────────────

export async function getObedienceNotifConfigs() {
    const collection = await getObedienceNotifCollection();
    return collection.find({}).toArray();
}

export async function setObedienceNotifConfig(
    memberId: string,
    days: number[],
) {
    const collection = await getObedienceNotifCollection();
    await collection.updateOne(
        { memberId },
        { $set: { memberId, days } },
        { upsert: true },
    );
}

export async function deleteObedienceNotifConfig(memberId: string) {
    const collection = await getObedienceNotifCollection();
    await collection.deleteOne({ memberId });
}

/**
 * Get admin emails that should be notified for a given day of week.
 * Returns list of { email, name } for admins configured to receive notifs on that day.
 */
export async function getAdminsToNotifyForDay(dayOfWeek: number) {
    const configs = await getObedienceNotifConfigs();
    const memberIds = configs
        .filter((c) => c.days.includes(dayOfWeek))
        .map((c) => c.memberId);

    if (memberIds.length === 0) return [];

    const db = await getDb();
    const members = await db
        .collection("members")
        .find({
            _id: { $in: memberIds.map((id) => new ObjectId(id)) },
            isAdmin: true,
        })
        .toArray();

    return members.map((m) => ({
        id: m._id!.toString(),
        email: m.email as string,
        name: `${m.firstName || ""} ${m.lastName || ""}`.trim(),
    }));
}

export const DAY_LABELS: Record<number, string> = {
    2: "Mardi",
    4: "Jeudi",
    6: "Samedi",
};

export const DAY_TIMES: Record<number, string> = {
    2: "18:30",
    4: "18:30",
    6: "13:15",
};
