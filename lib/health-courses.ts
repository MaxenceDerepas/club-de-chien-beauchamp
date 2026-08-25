import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type HealthCourseRegistrationStatus =
    | "pending"
    | "approved"
    | "rejected";

export type HealthCourseRegistration = {
    memberId: string;
    memberName: string;
    requestedAt: Date;
    status: HealthCourseRegistrationStatus;
};

export type HealthCourseRecord = {
    _id?: ObjectId;
    title: string;
    sessionDate: Date | null;
    location: string;
    description: string;
    maxParticipants: number;
    isPublished: boolean;
    registrations: HealthCourseRegistration[];
    createdAt: Date;
    updatedAt: Date;
};

function getDb() {
    return clientPromise.then((client) => client.db("club-canin"));
}

export async function getHealthCoursesCollection() {
    const db = await getDb();
    const collection = db.collection<HealthCourseRecord>("health_courses");

    await collection.createIndex({ sessionDate: 1 });
    await collection.createIndex({ createdAt: -1 });

    return collection;
}

export async function listHealthCourses() {
    const collection = await getHealthCoursesCollection();
    return collection
        .find({})
        .sort({ sessionDate: 1, createdAt: -1 })
        .toArray();
}

export async function listPublishedUpcomingHealthCourses() {
    const collection = await getHealthCoursesCollection();
    const now = new Date();
    return collection
        .find({
            isPublished: true,
            $or: [{ sessionDate: null }, { sessionDate: { $gte: now } }],
        })
        .sort({ sessionDate: 1, createdAt: -1 })
        .toArray();
}

export async function getHealthCourseById(id: string) {
    const collection = await getHealthCoursesCollection();
    if (!ObjectId.isValid(id)) return null;
    return collection.findOne({ _id: new ObjectId(id) });
}

export async function createHealthCourse(
    data: Omit<HealthCourseRecord, "_id">,
) {
    const collection = await getHealthCoursesCollection();
    const result = await collection.insertOne(data);
    return result.insertedId;
}

export async function updateHealthCourse(
    id: string,
    data: Partial<Omit<HealthCourseRecord, "_id" | "createdAt">>,
) {
    const collection = await getHealthCoursesCollection();
    if (!ObjectId.isValid(id)) {
        throw new Error("ID séance invalide.");
    }
    await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: new Date() } },
    );
}

export async function deleteHealthCourseById(id: string) {
    const collection = await getHealthCoursesCollection();
    if (!ObjectId.isValid(id)) {
        throw new Error("ID séance invalide.");
    }
    await collection.deleteOne({ _id: new ObjectId(id) });
}

export async function requestHealthCourseRegistration(
    sessionId: string,
    registration: Omit<HealthCourseRegistration, "requestedAt" | "status">,
) {
    const collection = await getHealthCoursesCollection();
    if (!ObjectId.isValid(sessionId)) {
        throw new Error("ID séance invalide.");
    }

    const _id = new ObjectId(sessionId);
    const session = await collection.findOne({ _id });
    if (!session) throw new Error("Séance introuvable.");
    if (!session.isPublished) throw new Error("Séance non disponible.");

    const existing = session.registrations.find(
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

export async function cancelHealthCourseRegistration(
    sessionId: string,
    memberId: string,
) {
    const collection = await getHealthCoursesCollection();
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
