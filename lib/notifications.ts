import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";

export type AdminNotification = {
    _id?: ObjectId;
    /** Admin member ID who should see this notification */
    recipientId: string;
    /** Unique key identifying the underlying action (e.g. "obedience:inscription:sessionId:memberId") */
    key: string;
    /** Short message */
    message: string;
    /** Link to navigate to */
    link: string;
    /** Whether the notification has been read */
    read: boolean;
    createdAt: Date;
};

async function getCollection() {
    const client = await clientPromise;
    return client.db("club-canin").collection<AdminNotification>("admin_notifications");
}

export async function createNotification(
    recipientId: string,
    message: string,
    link: string,
    key: string,
) {
    const collection = await getCollection();
    await collection.insertOne({
        recipientId,
        key,
        message,
        link,
        read: false,
        createdAt: new Date(),
    });
}

export async function getUnreadNotifications(recipientId: string) {
    const collection = await getCollection();
    return collection
        .find({ recipientId, read: false })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();
}

export async function countUnreadNotifications(recipientId: string) {
    const collection = await getCollection();
    return collection.countDocuments({ recipientId, read: false });
}

export async function markNotificationRead(notificationId: string) {
    const collection = await getCollection();
    if (!ObjectId.isValid(notificationId)) return;
    await collection.updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { read: true } },
    );
}

export async function markAllNotificationsRead(recipientId: string) {
    const collection = await getCollection();
    await collection.updateMany(
        { recipientId, read: false },
        { $set: { read: true } },
    );
}

/** Mark all notifications with a given key as read, for ALL recipients */
export async function markNotificationsByKeyRead(key: string) {
    const collection = await getCollection();
    await collection.updateMany(
        { key, read: false },
        { $set: { read: true } },
    );
}
