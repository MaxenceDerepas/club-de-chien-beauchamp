import clientPromise from "./mongodb";

const DB_NAME = "club-canin";
const CONTENTS_COLLECTION = "contents";
const HOMEPAGE_ANNOUNCEMENT_KEY = "homepage_announcement";
const MEMBER_ANNOUNCEMENT_KEY = "member_announcement";

export async function getHomepageAnnouncement() {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const doc = await db.collection(CONTENTS_COLLECTION).findOne({
        key: HOMEPAGE_ANNOUNCEMENT_KEY,
    });

    return {
        enabled: doc?.enabled ?? false,
        text: doc?.text ?? "",
    };
}

export async function saveHomepageAnnouncement(input: {
    text: string;
    enabled: boolean;
}) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection(CONTENTS_COLLECTION).updateOne(
        { key: HOMEPAGE_ANNOUNCEMENT_KEY },
        {
            $set: {
                key: HOMEPAGE_ANNOUNCEMENT_KEY,
                text: String(input.text || "").trim(),
                enabled: Boolean(input.enabled),
                updatedAt: new Date(),
            },
        },
        { upsert: true },
    );
}

export async function getMemberAnnouncement() {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const doc = await db.collection(CONTENTS_COLLECTION).findOne({
        key: MEMBER_ANNOUNCEMENT_KEY,
    });

    return {
        enabled: doc?.enabled ?? false,
        text: doc?.text ?? "",
    };
}

export async function saveMemberAnnouncement(input: {
    text: string;
    enabled: boolean;
}) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection(CONTENTS_COLLECTION).updateOne(
        { key: MEMBER_ANNOUNCEMENT_KEY },
        {
            $set: {
                key: MEMBER_ANNOUNCEMENT_KEY,
                text: String(input.text || "").trim(),
                enabled: Boolean(input.enabled),
                updatedAt: new Date(),
            },
        },
        { upsert: true },
    );
}
