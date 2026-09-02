import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export const EVENT_LEVELS = [
    "chiot",
    "premier_cours",
    "ruban_violet",
    "ruban_bleu",
    "ruban_blanc",
    "ruban_rouge",
    "ruban_noir",
    "equipe",
] as const;

export type EventLevel = (typeof EVENT_LEVELS)[number];

export type EventRegistrationStatus = "pending" | "approved" | "rejected";

export type EventRegistration = {
    memberId: string;
    memberName: string;
    memberLevel: EventLevel;
    requestedAt: Date;
    status: EventRegistrationStatus;
};

export type EventRecord = {
    _id?: ObjectId;
    title: string;
    category: string;
    eventDate: Date | null;
    registrationDeadline: Date | null;
    location: string;
    description: string;
    imageUrl: string;
    minLevel: EventLevel;
    maxParticipants: number;
    isPublished: boolean;
    registrations: EventRegistration[];
    createdAt: Date;
    updatedAt: Date;
};

function getDb() {
    return clientPromise.then((client) => client.db("club-canin"));
}

let indexesCreated = false;

export async function getEventsCollection() {
    const db = await getDb();
    const collection = db.collection<EventRecord>("events");

    if (!indexesCreated) {
        indexesCreated = true;
        collection.createIndex({ createdAt: -1 }).catch(() => {});
        collection.createIndex({ eventDate: 1 }).catch(() => {});
        collection.createIndex({ title: 1 }).catch(() => {});
    }

    return collection;
}

export async function listEvents() {
    const collection = await getEventsCollection();
    return collection.find({}).sort({ eventDate: 1, createdAt: -1 }).toArray();
}

export async function listPublishedUpcomingEvents() {
    const collection = await getEventsCollection();
    const now = new Date();
    return collection
        .find({
            isPublished: true,
            $or: [{ eventDate: null }, { eventDate: { $gte: now } }],
        })
        .sort({ eventDate: 1, createdAt: -1 })
        .toArray();
}

export async function requestEventRegistration(
    eventId: string,
    registration: Omit<EventRegistration, "requestedAt" | "status">,
) {
    const collection = await getEventsCollection();
    if (!ObjectId.isValid(eventId)) {
        throw new Error("ID événement invalide.");
    }

    const _id = new ObjectId(eventId);
    const event = await collection.findOne({ _id });
    if (!event) throw new Error("Événement introuvable.");
    if (!event.isPublished) throw new Error("Événement non disponible.");

    const existing = event.registrations.find(
        (r) => r.memberId === registration.memberId,
    );
    if (existing) {
        if (existing.status === "rejected") {
            await collection.updateOne(
                { _id, "registrations.memberId": registration.memberId },
                {
                    $set: {
                        "registrations.$.status": "pending",
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
                    status: "pending",
                },
            },
            $set: { updatedAt: new Date() },
        },
    );
}

export async function getEventById(id: string) {
    const collection = await getEventsCollection();
    if (!ObjectId.isValid(id)) return null;
    return collection.findOne({ _id: new ObjectId(id) });
}

export async function createEvent(data: Omit<EventRecord, "_id">) {
    const collection = await getEventsCollection();
    const result = await collection.insertOne(data);
    return result.insertedId;
}

export async function updateEvent(
    id: string,
    data: Partial<Omit<EventRecord, "_id" | "createdAt">>,
) {
    const collection = await getEventsCollection();

    if (!ObjectId.isValid(id)) {
        throw new Error("ID événement invalide.");
    }

    await collection.updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                ...data,
                updatedAt: new Date(),
            },
        },
    );
}

export async function deleteEventById(id: string) {
    const collection = await getEventsCollection();

    if (!ObjectId.isValid(id)) {
        throw new Error("ID événement invalide.");
    }

    await collection.deleteOne({ _id: new ObjectId(id) });
}
