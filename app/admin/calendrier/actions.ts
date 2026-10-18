"use server";

import { requireAdminSession } from "@/lib/admin-auth";
import {
    createCalendarDate,
    updateCalendarDate,
    deleteCalendarDate,
} from "@/lib/calendar-dates";
import { revalidatePath } from "next/cache";

export type CalendarDateState = {
    error?: string;
    success?: boolean;
};

export async function createCalendarDateAction(
    _prevState: CalendarDateState,
    formData: FormData,
): Promise<CalendarDateState> {
    await requireAdminSession();
    const title = String(formData.get("title") ?? "").trim();
    const date = String(formData.get("date") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!title) return { error: "Le titre est requis." };
    if (!date) return { error: "La date est requise." };

    await createCalendarDate({
        title,
        date,
        description: description || undefined,
    });

    revalidatePath("/admin/calendrier");
    revalidatePath("/membre");
    return { success: true };
}

export async function updateCalendarDateAction(
    _prevState: CalendarDateState,
    formData: FormData,
): Promise<CalendarDateState> {
    await requireAdminSession();
    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const date = String(formData.get("date") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!id) return { error: "Identifiant manquant." };
    if (!title) return { error: "Le titre est requis." };
    if (!date) return { error: "La date est requise." };

    await updateCalendarDate(id, {
        title,
        date,
        description: description || undefined,
    });

    revalidatePath("/admin/calendrier");
    revalidatePath("/membre");
    return { success: true };
}

export async function deleteCalendarDateAction(
    formData: FormData,
): Promise<void> {
    await requireAdminSession();
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await deleteCalendarDate(id);
    revalidatePath("/admin/calendrier");
    revalidatePath("/membre");
}
