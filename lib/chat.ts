import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type ChatMessage = {
    _id?: ObjectId;
    eventId: string;
    senderId: string;
    senderName: string;
    senderRole: "member" | "admin";
    text: string;
    createdAt: Date;
};

function getDb() {
    return clientPromise.then((client) => client.db("club-canin"));
}

let indexesCreated = false;

export async function getChatCollection() {
    const db = await getDb();
    const collection = db.collection<ChatMessage>("chat_messages");

    if (!indexesCreated) {
        indexesCreated = true;
        collection.createIndex({ eventId: 1, createdAt: 1 }).catch(() => {});
    }

    return collection;
}

export async function getMessagesByEvent(eventId: string, limit = 100) {
    const collection = await getChatCollection();
    return collection
        .find({ eventId })
        .sort({ createdAt: 1 })
        .limit(limit)
        .toArray();
}

export async function addMessage(
    data: Omit<ChatMessage, "_id" | "createdAt">,
) {
    const collection = await getChatCollection();
    const message: Omit<ChatMessage, "_id"> = {
        ...data,
        text: data.text.trim(),
        createdAt: new Date(),
    };
    const result = await collection.insertOne(message);
    return { ...message, _id: result.insertedId };
}
