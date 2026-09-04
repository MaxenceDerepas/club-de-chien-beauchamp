"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminSession, verifySessionCookieValue } from "@/lib/admin-auth";
import { getCurrentMember } from "@/lib/member-auth";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import {
    getCourseImages,
    updateCourseImages,
    COURSE_IDS,
    type CourseImage,
} from "@/lib/course-images";

async function requireAdmin() {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(adminSession.name)?.value;
    const isAdminSession = verifySessionCookieValue(sessionValue);
    const member = await getCurrentMember();
    const isMemberAdmin = member?.isAdmin ?? false;
    if (!isAdminSession && !isMemberAdmin) {
        redirect("/admin?error=1");
    }
}

/**
 * Upload a new photo for a course.
 */
export async function uploadCoursePhoto(formData: FormData) {
    await requireAdmin();

    const courseId = formData.get("courseId") as string;
    if (!COURSE_IDS.includes(courseId as any)) {
        return { error: "Cours invalide." };
    }

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
        return { error: "Aucun fichier sélectionné." };
    }

    if (file.size > 10 * 1024 * 1024) {
        return { error: "Le fichier est trop volumineux (max 10 Mo)." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, `courses/${courseId}`);

    const doc = await getCourseImages(courseId);
    const images: CourseImage[] = doc?.images ?? [];
    images.push({ url: result.url, publicId: result.publicId });

    await updateCourseImages(courseId, images);

    return { success: true, image: result };
}

/**
 * Delete a photo from a course.
 */
export async function deleteCoursePhoto(formData: FormData) {
    await requireAdmin();

    const courseId = formData.get("courseId") as string;
    const publicId = formData.get("publicId") as string;

    if (!courseId || !publicId) {
        return { error: "Paramètres manquants." };
    }

    const doc = await getCourseImages(courseId);
    if (!doc) return { error: "Cours introuvable." };

    const images = doc.images.filter((img) => img.publicId !== publicId);
    await updateCourseImages(courseId, images);
    await deleteImage(publicId);

    return { success: true };
}

/**
 * Reorder photos for a course.
 * Receives a JSON string of publicId[] in the new order.
 */
export async function reorderCoursePhotos(formData: FormData) {
    await requireAdmin();

    const courseId = formData.get("courseId") as string;
    const orderJson = formData.get("order") as string;

    if (!courseId || !orderJson) {
        return { error: "Paramètres manquants." };
    }

    const order: string[] = JSON.parse(orderJson);

    const doc = await getCourseImages(courseId);
    if (!doc) return { error: "Cours introuvable." };

    // Reorder images based on the publicId order
    const imageMap = new Map(doc.images.map((img) => [img.publicId, img]));
    const reordered: CourseImage[] = [];
    for (const pid of order) {
        const img = imageMap.get(pid);
        if (img) reordered.push(img);
    }
    // Append any images not in the order list (safety)
    for (const img of doc.images) {
        if (!order.includes(img.publicId)) {
            reordered.push(img);
        }
    }

    await updateCourseImages(courseId, reordered);

    return { success: true };
}
