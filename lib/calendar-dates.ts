import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// ── Types ─────────────────────────────────────────────────────────

export type CalendarDateRecord = {
    _id?: ObjectId;
    /** Display title shown on the calendar */
    title: string;
    /** Date string stored as YYYY-MM-DD */
    date: string;
    /** Optional brief description */
    description?: string;
    createdAt: Date;
    updatedAt: Date;
};

// ── Collection ────────────────────────────────────────────────────

function getDb() {
    return clientPromise.then((client) => client.db("club-canin"));
}

export async function getCalendarDatesCollection() {
    const db = await getDb();
    return db.collection<CalendarDateRecord>("calendarDates");
}

// ── CRUD ──────────────────────────────────────────────────────────

export async function listCalendarDates() {
    const col = await getCalendarDatesCollection();
    return col.find({}).sort({ date: 1 }).toArray();
}

export async function getCalendarDate(id: string) {
    const col = await getCalendarDatesCollection();
    if (!ObjectId.isValid(id)) return null;
    return col.findOne({ _id: new ObjectId(id) });
}

export async function createCalendarDate(data: {
    title: string;
    date: string;
    description?: string;
}) {
    const col = await getCalendarDatesCollection();
    const now = new Date();
    const result = await col.insertOne({
        title: data.title,
        date: data.date,
        description: data.description || undefined,
        createdAt: now,
        updatedAt: now,
    });
    return result.insertedId;
}

export async function updateCalendarDate(
    id: string,
    data: { title?: string; date?: string; description?: string },
) {
    const col = await getCalendarDatesCollection();
    if (!ObjectId.isValid(id)) return;
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) update.title = data.title;
    if (data.date !== undefined) update.date = data.date;
    if (data.description !== undefined) update.description = data.description;
    await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
}

export async function deleteCalendarDate(id: string) {
    const col = await getCalendarDatesCollection();
    if (!ObjectId.isValid(id)) return;
    await col.deleteOne({ _id: new ObjectId(id) });
}
