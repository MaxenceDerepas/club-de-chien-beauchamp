import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export { MEMBER_LEVELS, meetsMinLevel } from "@/lib/levels";
export type { MemberLevel } from "@/lib/levels";
import type { MemberLevel } from "@/lib/levels";

export type MemberRecord = {
    _id?: ObjectId;

    firstName: string;
    lastName: string;
    address: string;
    postalCode: string;
    city: string;
    phone: string;
    phoneCompany: string;
    policyNumber: string;
    email: string;

    owner1Name: string;
    owner1BirthDate: Date | null;
    owner1Email: string;

    owner2Name: string;
    owner2BirthDate: Date | null;
    owner2Email: string;

    dogName: string;
    dogBreed: string;
    dogSex: "male" | "female" | "unknown";
    dogBirthDate: Date | null;
    dogLofNumber: string;
    dogIdentificationNumber: string;
    rabiesBoosterDate: Date | null;

    level: MemberLevel;
    healthCourse: boolean;
    obedience: boolean;
    imageRightsClub: boolean;
    imageRightsExternal: boolean;
    dogPhotoUrl: string;

    registrationDate: Date;
    membershipActive: boolean;
    siteAccessEnabled: boolean;

    username: string;
    usernameLower: string;
    passwordHash: string;
    passwordSalt: string;

    isAdmin: boolean;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
};

function getDb() {
    return clientPromise.then((client) => client.db("club-canin"));
}

export async function getMembersCollection() {
    const db = await getDb();
    const collection = db.collection<MemberRecord>("members");

    await collection.createIndex({ usernameLower: 1 }, { unique: true });
    await collection.createIndex({ lastName: 1, firstName: 1 });
    await collection.createIndex({ dogName: 1 });

    return collection;
}

export async function listMembers() {
    const collection = await getMembersCollection();
    return collection.find({}).sort({ lastName: 1, firstName: 1 }).toArray();
}

export async function getMemberById(id: string) {
    const collection = await getMembersCollection();
    if (!ObjectId.isValid(id)) return null;
    return collection.findOne({ _id: new ObjectId(id) });
}

export async function createMember(data: Omit<MemberRecord, "_id">) {
    const collection = await getMembersCollection();
    const result = await collection.insertOne(data);
    return result.insertedId;
}

export async function updateMember(
    id: string,
    data: Partial<Omit<MemberRecord, "_id" | "createdAt">>,
) {
    const collection = await getMembersCollection();

    if (!ObjectId.isValid(id)) {
        throw new Error("ID membre invalide.");
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

export async function deleteMemberById(id: string) {
    const collection = await getMembersCollection();

    if (!ObjectId.isValid(id)) {
        throw new Error("ID membre invalide.");
    }

    await collection.deleteOne({ _id: new ObjectId(id) });
}
