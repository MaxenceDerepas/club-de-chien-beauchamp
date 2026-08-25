import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { listHealthCourses } from "@/lib/health-courses";
import { listMembers } from "@/lib/members";
import {
    approveHealthCourseRegistrationAction,
    rejectHealthCourseRegistrationAction,
    deleteHealthCourseAction,
} from "./actions";
import AdminParcoursView from "./AdminParcoursView";
import type { AdminCalendarMemberInfo } from "@/components/AdminHealthCourseCalendar";
import styles from "./parcours-sante.module.css";

export const dynamic = "force-dynamic";

export default async function AdminHealthCoursesPage() {
    await requireAdminSession();
    const courses = await listHealthCourses();
    const allMembers = await listMembers();

    const memberInfoById: Record<string, AdminCalendarMemberInfo> = {};
    for (const m of allMembers) {
        if (!m._id) continue;
        const id = m._id.toString();
        memberInfoById[id] = {
            dogName: m.dogName || "",
            dogPhotoUrl: m.dogPhotoUrl || "",
            level: m.level,
            healthCourse: m.healthCourse ?? false,
            obedience: m.obedience ?? false,
        };
    }

    const sessions = courses
        .filter((c) => c.sessionDate)
        .map((c) => ({
            id: c._id?.toString() ?? "",
            sessionDate: new Date(c.sessionDate as Date).toISOString(),
            title: c.title,
            maxParticipants: c.maxParticipants,
            registrations: c.registrations.map((r) => ({
                memberId: r.memberId,
                memberName: r.memberName,
                status: r.status,
            })),
        }));

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin" className={styles.backLink}>
                        ← Retour au tableau de bord
                    </Link>

                    <Link
                        href="/admin/parcours-sante/nouveau"
                        className={styles.primaryLink}
                    >
                        Créer un parcours de santé
                    </Link>
                </div>

                <AdminParcoursView
                    sessions={sessions}
                    memberInfoById={memberInfoById}
                    approveAction={approveHealthCourseRegistrationAction}
                    rejectAction={rejectHealthCourseRegistrationAction}
                    deleteAction={deleteHealthCourseAction}
                />
            </div>
        </main>
    );
}
