import { randomBytes } from "crypto";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type PasswordResetRecord = {
    _id?: ObjectId;
    memberId: string;
    token: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
};

async function getCollection() {
    const client = await clientPromise;
    const db = client.db("club-canin");
    return db.collection<PasswordResetRecord>("password_resets");
}

/**
 * Create a password reset token for a member.
 * Invalidates any previous unused tokens for the same member.
 * Token expires after 1 hour.
 */
export async function createPasswordResetToken(
    memberId: string,
): Promise<string> {
    const collection = await getCollection();

    // Invalidate previous unused tokens for this member
    await collection.updateMany(
        { memberId, used: false },
        { $set: { used: true } },
    );

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await collection.insertOne({
        memberId,
        token,
        expiresAt,
        used: false,
        createdAt: new Date(),
    });

    return token;
}

/**
 * Validate a password reset token.
 * Returns the memberId if valid, null otherwise.
 */
export async function validatePasswordResetToken(
    token: string,
): Promise<string | null> {
    const collection = await getCollection();

    const record = await collection.findOne({
        token,
        used: false,
        expiresAt: { $gt: new Date() },
    });

    if (!record) return null;
    return record.memberId;
}

/**
 * Mark a token as used after successful password reset.
 */
export async function markTokenAsUsed(token: string): Promise<void> {
    const collection = await getCollection();
    await collection.updateOne({ token }, { $set: { used: true } });
}
