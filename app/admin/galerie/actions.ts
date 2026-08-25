"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import {
    createAlbum,
    deleteAlbumById,
    getAlbumById,
    addPhotoToAlbum,
    removePhotoFromAlbum,
    updateAlbumCover,
} from "@/lib/gallery";
import { getEventById } from "@/lib/events";
// TODO: Activer Cloudinary quand le compte sera créé
// import { uploadImage, deleteImage, extractPublicId } from "@/lib/cloudinary";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";

function revalidateGallery() {
    revalidatePath("/admin/galerie");
    revalidatePath("/membre");
}

export async function createAlbumAction(
    _prevState: { success?: boolean; error?: string } | null,
    formData: FormData,
) {
    await requireAdminSession();

    const title = String(formData.get("title") || "").trim();
    const visibility = String(formData.get("visibility") || "all") as
        | "all"
        | "event";
    const eventId = String(formData.get("eventId") || "").trim();

    if (!title) {
        return { error: "Le titre de l'album est requis." };
    }

    if (visibility === "event" && !eventId) {
        return { error: "Veuillez sélectionner un événement." };
    }

    let eventTitle = "";
    if (visibility === "event" && eventId) {
        const event = await getEventById(eventId);
        if (!event) {
            return { error: "Événement introuvable." };
        }
        eventTitle = event.title;
    }

    try {
        await createAlbum({
            title,
            visibility,
            ...(visibility === "event" ? { eventId, eventTitle } : {}),
            createdAt: new Date(),
        });
        revalidateGallery();
        return { success: true };
    } catch (err) {
        console.error("Create album error", err);
        return { error: "Erreur lors de la création." };
    }
}

export async function deleteAlbumAction(formData: FormData) {
    await requireAdminSession();

    const albumId = String(formData.get("albumId") || "");
    if (!albumId) return;

    const album = await getAlbumById(albumId);
    if (album) {
        // TODO: Activer Cloudinary quand le compte sera créé
        // for (const photo of album.photos) {
        //     const publicId = extractPublicId(photo.imageUrl);
        //     if (publicId) { await deleteImage(publicId); }
        // }
        for (const photo of album.photos) {
            try {
                const filePath = path.join(process.cwd(), "public", photo.imageUrl);
                await unlink(filePath);
            } catch (err: any) {
                if (err?.code !== "ENOENT") console.error("Delete photo file error", err);
            }
        }
    }

    await deleteAlbumById(albumId);
    revalidateGallery();
}

export async function uploadSinglePhotoAction(
    albumId: string,
    formData: FormData,
): Promise<{ success?: boolean; error?: string; imageUrl?: string }> {
    await requireAdminSession();

    const file = formData.get("photo") as File | null;

    if (!albumId) return { error: "Album introuvable." };
    if (!file || file.size === 0) return { error: "Fichier vide." };

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
        return { error: `Format non accepté : ${file.name}. Utilisez JPG, PNG ou WebP.` };
    }

    if (file.size > 10 * 1024 * 1024) {
        return { error: `${file.name} dépasse 10 Mo.` };
    }

    try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");
        await mkdir(uploadDir, { recursive: true });

        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const photoId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const filename = `gallery-${photoId}.${ext}`;
        const filePath = path.join(uploadDir, filename);

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        // TODO: Activer Cloudinary quand le compte sera créé
        // const uploaded = await uploadImage(buffer, "gallery");
        // const imageUrl = uploaded.url;
        const imageUrl = `/uploads/gallery/${filename}`;

        await addPhotoToAlbum(albumId, {
            id: photoId,
            imageUrl,
            createdAt: new Date(),
        });

        // Set as cover if first photo
        const album = await getAlbumById(albumId);
        if (album && album.photos.length <= 1) {
            await updateAlbumCover(albumId, imageUrl);
        }

        revalidateGallery();
        return { success: true, imageUrl };
    } catch (err) {
        console.error("Upload photo error", err);
        return { error: "Erreur lors de l'upload." };
    }
}

export async function deletePhotoFromAlbumAction(formData: FormData) {
    await requireAdminSession();

    const albumId = String(formData.get("albumId") || "");
    const photoId = String(formData.get("photoId") || "");
    const imageUrl = String(formData.get("imageUrl") || "");

    if (!albumId || !photoId) return;

    // TODO: Activer Cloudinary quand le compte sera créé
    // if (imageUrl) {
    //     const publicId = extractPublicId(imageUrl);
    //     if (publicId) { await deleteImage(publicId); }
    // }
    if (imageUrl) {
        try {
            const filePath = path.join(process.cwd(), "public", imageUrl);
            await unlink(filePath);
        } catch (err: any) {
            if (err?.code !== "ENOENT") console.error("Delete photo file error", err);
        }
    }

    await removePhotoFromAlbum(albumId, photoId);

    // Update cover if needed
    const album = await getAlbumById(albumId);
    if (album) {
        if (album.coverUrl === imageUrl) {
            const newCover = album.photos[0]?.imageUrl || "";
            await updateAlbumCover(albumId, newCover);
        }
    }

    revalidateGallery();
}

export async function setCoverAction(formData: FormData) {
    await requireAdminSession();

    const albumId = String(formData.get("albumId") || "");
    const imageUrl = String(formData.get("imageUrl") || "");

    if (!albumId || !imageUrl) return;

    await updateAlbumCover(albumId, imageUrl);
    revalidateGallery();
}
