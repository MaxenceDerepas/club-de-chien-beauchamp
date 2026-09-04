import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminSession, verifySessionCookieValue } from "@/lib/admin-auth";
import { getCurrentMember } from "@/lib/member-auth";
import { getAllCourseImages } from "@/lib/course-images";
import { redirect } from "next/navigation";
import CoursePhotosManager from "./CoursePhotosManager";
import styles from "../admin.module.css";

export const metadata: Metadata = {
    title: "Photos des cours — Administration",
    robots: { index: false, follow: false },
};

export default async function CoursePhotosPage() {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(adminSession.name)?.value;
    const isAdminSession = verifySessionCookieValue(sessionValue);
    const member = await getCurrentMember();
    const isMemberAdmin = member?.isAdmin ?? false;

    if (!isAdminSession && !isMemberAdmin) {
        redirect("/admin?error=1");
    }

    const data = await getAllCourseImages();

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <CoursePhotosManager initialData={data} />
            </section>
        </main>
    );
}
