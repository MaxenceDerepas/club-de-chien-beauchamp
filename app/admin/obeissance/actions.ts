"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import {
    setObedienceNotifConfig,
    deleteObedienceNotifConfig,
} from "@/lib/obedience";

export async function saveObedienceNotifConfigAction(formData: FormData) {
    await requireAdminSession();

    const memberId = String(formData.get("memberId") || "");
    if (!memberId) return;

    const days: number[] = [];
    if (formData.get("day_2") === "on") days.push(2);
    if (formData.get("day_4") === "on") days.push(4);
    if (formData.get("day_6") === "on") days.push(6);

    if (days.length === 0) {
        await deleteObedienceNotifConfig(memberId);
    } else {
        await setObedienceNotifConfig(memberId, days);
    }

    revalidatePath("/admin/obeissance");
}
