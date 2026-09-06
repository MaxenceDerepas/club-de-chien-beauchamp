import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// ── Types ─────────────────────────────────────────────────────────

export type DocumentItem = {
    _id?: ObjectId;
    /** Display name — becomes the link text on the member page */
    name: string;
    /** Cloudinary URL */
    fileUrl: string;
    /** Cloudinary public_id for deletion */
    publicId: string;
    /** Original filename for reference */
    originalFilename: string;
    /** Sort order within category */
    order: number;
};

export type DocumentCategory = {
    _id?: ObjectId;
    /** Display name of the category */
    name: string;
    /** Icon key used in the member page */
    icon: "heart" | "education" | "document";
    /** Sort order among categories */
    order: number;
    /** Documents in this category */
    documents: DocumentItem[];
    createdAt: Date;
    updatedAt: Date;
};

// ── Collection ────────────────────────────────────────────────────

function getDb() {
    return clientPromise.then((client) => client.db("club-canin"));
}

export async function getDocumentsCollection() {
    const db = await getDb();
    return db.collection<DocumentCategory>("document_categories");
}

// ── CRUD ──────────────────────────────────────────────────────────

export async function listDocumentCategories() {
    const col = await getDocumentsCollection();
    return col.find({}).sort({ order: 1 }).toArray();
}

export async function getDocumentCategory(id: string) {
    const col = await getDocumentsCollection();
    if (!ObjectId.isValid(id)) return null;
    return col.findOne({ _id: new ObjectId(id) });
}

export async function createDocumentCategory(
    name: string,
    icon: DocumentCategory["icon"],
) {
    const col = await getDocumentsCollection();
    const maxOrder = await col
        .find({})
        .sort({ order: -1 })
        .limit(1)
        .toArray();
    const order = maxOrder.length > 0 ? maxOrder[0].order + 1 : 0;
    const now = new Date();
    const result = await col.insertOne({
        name,
        icon,
        order,
        documents: [],
        createdAt: now,
        updatedAt: now,
    });
    return result.insertedId;
}

export async function updateDocumentCategory(
    id: string,
    data: { name?: string; icon?: DocumentCategory["icon"] },
) {
    const col = await getDocumentsCollection();
    if (!ObjectId.isValid(id)) return;
    await col.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: new Date() } },
    );
}

export async function deleteDocumentCategory(id: string) {
    const col = await getDocumentsCollection();
    if (!ObjectId.isValid(id)) return;
    await col.deleteOne({ _id: new ObjectId(id) });
}

export async function addDocumentToCategory(
    categoryId: string,
    doc: Omit<DocumentItem, "_id" | "order">,
) {
    const col = await getDocumentsCollection();
    if (!ObjectId.isValid(categoryId)) return;

    const cat = await col.findOne({ _id: new ObjectId(categoryId) });
    const maxOrder =
        cat && cat.documents.length > 0
            ? Math.max(...cat.documents.map((d) => d.order)) + 1
            : 0;

    await col.updateOne(
        { _id: new ObjectId(categoryId) },
        {
            $push: {
                documents: {
                    _id: new ObjectId(),
                    ...doc,
                    order: maxOrder,
                },
            },
            $set: { updatedAt: new Date() },
        },
    );
}

export async function removeDocumentFromCategory(
    categoryId: string,
    documentId: string,
) {
    const col = await getDocumentsCollection();
    if (!ObjectId.isValid(categoryId) || !ObjectId.isValid(documentId)) return;

    await col.updateOne(
        { _id: new ObjectId(categoryId) },
        {
            $pull: { documents: { _id: new ObjectId(documentId) } },
            $set: { updatedAt: new Date() },
        },
    );
}

export async function updateDocumentInCategory(
    categoryId: string,
    documentId: string,
    data: { name?: string },
) {
    const col = await getDocumentsCollection();
    if (!ObjectId.isValid(categoryId) || !ObjectId.isValid(documentId)) return;

    const updateFields: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) {
        updateFields["documents.$.name"] = data.name;
    }

    await col.updateOne(
        {
            _id: new ObjectId(categoryId),
            "documents._id": new ObjectId(documentId),
        },
        { $set: updateFields },
    );
}
