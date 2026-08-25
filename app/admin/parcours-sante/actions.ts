"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import {
    createHealthCourse,
    deleteHealthCourseById,
    getHealthCourseById,
    updateHealthCourse,
} from "@/lib/health-courses";

function optionalDate(value: string) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export async function createHealthCourseAction(formData: FormData) {
    await requireAdminSession();

    const title = String(formData.get("title") || "").trim();
    const sessionDate = String(formData.get("sessionDate") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const unlimitedParticipants =
        formData.get("unlimitedParticipants") === "on";
    const maxParticipants = unlimitedParticipants
        ? 0
        : Math.max(
              1,
              Number.parseInt(
                  String(formData.get("maxParticipants") || "10"),
                  10,
              ) || 10,
          );
    const isPublished = true;

    if (!title) {
        redirect(
            "/admin/parcours-sante/nouveau?error=" +
                encodeURIComponent(
                    "Le titre du parcours de santé est obligatoire.",
                ),
        );
    }

    await createHealthCourse({
        title,
        sessionDate: optionalDate(sessionDate),
        location,
        description,
        maxParticipants,
        isPublished,
        registrations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    revalidatePath("/admin/parcours-sante");
    redirect("/admin/parcours-sante");
}

export async function deleteHealthCourseAction(formData: FormData) {
    await requireAdminSession();

    const id = String(formData.get("id") || "");
    if (!id) return;

    await deleteHealthCourseById(id);
    revalidatePath("/admin/parcours-sante");
}

export async function approveHealthCourseRegistrationAction(
    formData: FormData,
) {
    await requireAdminSession();

    const courseId = String(formData.get("courseId") || "");
    const memberId = String(formData.get("memberId") || "");

    const course = await getHealthCourseById(courseId);
    if (!course) return;

    const approvedCount = course.registrations.filter(
        (r) => r.status === "approved",
    ).length;

    if (course.maxParticipants > 0 && approvedCount >= course.maxParticipants) {
        redirect(
            `/admin/parcours-sante/${courseId}?error=${encodeURIComponent(
                "Le nombre maximum de participants validés est atteint.",
            )}`,
        );
    }

    const registrations = course.registrations.map((registration) =>
        registration.memberId === memberId
            ? { ...registration, status: "approved" as const }
            : registration,
    );

    await updateHealthCourse(courseId, { registrations });

    revalidatePath("/admin/parcours-sante");
    revalidatePath(`/admin/parcours-sante/${courseId}`);
}

export async function rejectHealthCourseRegistrationAction(
    formData: FormData,
) {
    await requireAdminSession();

    const courseId = String(formData.get("courseId") || "");
    const memberId = String(formData.get("memberId") || "");

    const course = await getHealthCourseById(courseId);
    if (!course) return;

    const registrations = course.registrations.map((registration) =>
        registration.memberId === memberId
            ? { ...registration, status: "rejected" as const }
            : registration,
    );

    await updateHealthCourse(courseId, { registrations });

    revalidatePath("/admin/parcours-sante");
    revalidatePath(`/admin/parcours-sante/${courseId}`);
}
