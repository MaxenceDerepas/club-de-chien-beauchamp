"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImage, deleteImage, extractPublicId } from "@/lib/cloudinary";
import { requireAdminSession } from "@/lib/admin-auth";
import {
    createEvent,
    deleteEventById,
    getEventById,
    updateEvent,
} from "@/lib/events";

function optionalDate(value: string) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

async function saveImageFile(file: File | null) {
    if (!file || file.size === 0) return "";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await uploadImage(buffer, "events");
    return result.url;
}

export async function createEventAction(formData: FormData) {
    await requireAdminSession();

    const title = String(formData.get("title") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const eventDate = String(formData.get("eventDate") || "").trim();
    const registrationDeadline = String(
        formData.get("registrationDeadline") || "",
    ).trim();
    const location = String(formData.get("location") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const minLevel = String(formData.get("minLevel") || "chiot") as
        | "chiot"
        | "premier_cours"
        | "ruban_violet"
        | "ruban_bleu"
        | "ruban_blanc"
        | "ruban_rouge"
        | "ruban_noir";
    const unlimitedParticipants = formData.get("unlimitedParticipants") === "on";
    const maxParticipants = unlimitedParticipants
        ? 0
        : Math.max(
              1,
              Number.parseInt(
                  String(formData.get("maxParticipants") || "1"),
                  10,
              ) || 1,
          );
    const isPublished = true;

    const imageFile = formData.get("image") as File | null;

    if (!title) {
        redirect(
            "/admin/evenements/nouveau?error=" +
                encodeURIComponent("Le titre de l’événement est obligatoire."),
        );
    }

    const imageUrl = await saveImageFile(imageFile);

    await createEvent({
        title,
        category,
        eventDate: optionalDate(eventDate),
        registrationDeadline: optionalDate(registrationDeadline),
        location,
        description,
        imageUrl,
        minLevel,
        maxParticipants,
        isPublished,
        registrations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    revalidatePath("/admin/evenements");
    redirect("/admin/evenements");
}

export async function deleteEventAction(formData: FormData) {
    await requireAdminSession();

    const id = String(formData.get("id") || "");
    if (!id) return;

    const event = await getEventById(id);
    if (event?.imageUrl) {
        const publicId = extractPublicId(event.imageUrl);
        if (publicId) { await deleteImage(publicId); }
    }

    await deleteEventById(id);
    revalidatePath("/admin/evenements");
}

export async function updateEventAction(formData: FormData) {
    await requireAdminSession();

    const id = String(formData.get("id") || "").trim();
    if (!id) {
        redirect("/admin/evenements");
    }

    const title = String(formData.get("title") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const eventDate = String(formData.get("eventDate") || "").trim();
    const registrationDeadline = String(
        formData.get("registrationDeadline") || "",
    ).trim();
    const location = String(formData.get("location") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const minLevel = String(formData.get("minLevel") || "chiot") as
        | "chiot"
        | "premier_cours"
        | "ruban_violet"
        | "ruban_bleu"
        | "ruban_blanc"
        | "ruban_rouge"
        | "ruban_noir";
    const unlimitedParticipants = formData.get("unlimitedParticipants") === "on";
    const maxParticipants = unlimitedParticipants
        ? 0
        : Math.max(
              1,
              Number.parseInt(
                  String(formData.get("maxParticipants") || "1"),
                  10,
              ) || 1,
          );

    if (!title) {
        redirect(
            `/admin/evenements/${id}/modifier?error=` +
                encodeURIComponent("Le titre de l'événement est obligatoire."),
        );
    }

    const imageFile = formData.get("image") as File | null;
    const removeImage = formData.get("removeImage") === "1";
    const existingImageUrl = String(formData.get("existingImageUrl") || "");

    let imageUrl = existingImageUrl;

    try {
        if (removeImage) {
            imageUrl = "";
        } else if (imageFile && imageFile.size > 0) {
            imageUrl = await saveImageFile(imageFile);
        }

        await updateEvent(id, {
            title,
            category,
            eventDate: optionalDate(eventDate),
            registrationDeadline: optionalDate(registrationDeadline),
            location,
            description,
            imageUrl,
            minLevel,
            maxParticipants,
        });
    } catch (err) {
        console.error("updateEventAction error:", err);
        redirect(
            `/admin/evenements/${id}/modifier?error=` +
                encodeURIComponent("Erreur lors de la sauvegarde."),
        );
    }

    revalidatePath("/admin/evenements");
    revalidatePath(`/admin/evenements/${id}`);
    revalidatePath("/membre");
    redirect(`/admin/evenements/${id}`);
}

export async function approveRegistrationAction(formData: FormData) {
    await requireAdminSession();

    const eventId = String(formData.get("eventId") || "");
    const memberId = String(formData.get("memberId") || "");

    const event = await getEventById(eventId);
    if (!event) return;

    const approvedCount = event.registrations.filter(
        (r) => r.status === "approved",
    ).length;

    if (event.maxParticipants > 0 && approvedCount >= event.maxParticipants) {
        redirect(
            `/admin/evenements/${eventId}?error=${encodeURIComponent(
                "Le nombre maximum de participants validés est atteint.",
            )}`,
        );
    }

    const registrations = event.registrations.map((registration) =>
        registration.memberId === memberId
            ? { ...registration, status: "approved" as const }
            : registration,
    );

    await updateEvent(eventId, { registrations });

    revalidatePath("/admin/evenements");
    revalidatePath(`/admin/evenements/${eventId}`);
}

export async function rejectRegistrationAction(formData: FormData) {
    await requireAdminSession();

    const eventId = String(formData.get("eventId") || "");
    const memberId = String(formData.get("memberId") || "");

    const event = await getEventById(eventId);
    if (!event) return;

    const registrations = event.registrations.map((registration) =>
        registration.memberId === memberId
            ? { ...registration, status: "rejected" as const }
            : registration,
    );

    await updateEvent(eventId, { registrations });

    revalidatePath("/admin/evenements");
    revalidatePath(`/admin/evenements/${eventId}`);
}
