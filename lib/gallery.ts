import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type GalleryPhoto = {
    id: string;
    imageUrl: string;
    createdAt: Date;
};

export type GalleryAlbum = {
    _id?: ObjectId;
    title: string;
    /** "all" = visible par tous les adhérents, "event" = visible par les inscrits à l'événement */
    visibility: "all" | "event";
    /** Si visibility === "event", l'ID de l'événement lié */
    eventId?: string;
    /** Titre de l'événement (pour affichage sans lookup) */
    eventTitle?: string;
    coverUrl?: string;
    photos: GalleryPhoto[];
    createdAt: Date;
};

function getDb() {
    return clientPromise.then((client) => client.db("club-canin"));
}

let indexesCreated = false;

export async function getGalleryCollection() {
    const db = await getDb();
    const collection = db.collection<GalleryAlbum>("gallery_albums");

    if (!indexesCreated) {
        indexesCreated = true;
        collection.createIndex({ createdAt: -1 }).catch(() => {});
    }

    return collection;
}

export async function listAlbums() {
    const collection = await getGalleryCollection();
    return collection.find({}).sort({ createdAt: -1 }).toArray();
}

export async function getAlbumById(id: string) {
    const collection = await getGalleryCollection();
    if (!ObjectId.isValid(id)) return null;
    return collection.findOne({ _id: new ObjectId(id) });
}

export async function createAlbum(
    data: Omit<GalleryAlbum, "_id" | "photos">,
) {
    const collection = await getGalleryCollection();
    const result = await collection.insertOne({ ...data, photos: [] });
    return result.insertedId;
}

export async function deleteAlbumById(id: string) {
    const collection = await getGalleryCollection();
    if (!ObjectId.isValid(id)) throw new Error("ID album invalide.");
    await collection.deleteOne({ _id: new ObjectId(id) });
}

export async function addPhotoToAlbum(
    albumId: string,
    photo: GalleryPhoto,
) {
    const collection = await getGalleryCollection();
    if (!ObjectId.isValid(albumId)) throw new Error("ID album invalide.");
    await collection.updateOne(
        { _id: new ObjectId(albumId) },
        { $push: { photos: photo } },
    );
}

export async function removePhotoFromAlbum(
    albumId: string,
    photoId: string,
) {
    const collection = await getGalleryCollection();
    if (!ObjectId.isValid(albumId)) throw new Error("ID album invalide.");
    await collection.updateOne(
        { _id: new ObjectId(albumId) },
        { $pull: { photos: { id: photoId } } },
    );
}

export async function updateAlbumCover(albumId: string, coverUrl: string) {
    const collection = await getGalleryCollection();
    if (!ObjectId.isValid(albumId)) throw new Error("ID album invalide.");
    await collection.updateOne(
        { _id: new ObjectId(albumId) },
        { $set: { coverUrl } },
    );
}
