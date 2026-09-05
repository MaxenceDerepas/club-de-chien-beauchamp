import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { listObedienceSessions } from "@/lib/obedience";
import { listMembers } from "@/lib/members";
import {
    approveObedienceRegistrationAction,
    rejectObedienceRegistrationAction,
} from "./actions";
import AdminObedienceView from "./AdminObedienceView";
import type { AdminObedienceMemberInfo } from "@/components/AdminObedienceCalendar";
import styles from "../parcours-sante/parcours-sante.module.css";

export const dynamic = "force-dynamic";

export default async function AdminObediencePage() {
    await requireAdminSession();
    const courses = await listObedienceSessions();
    const allMembers = await listMembers();

    const memberInfoById: Record<string, AdminObedienceMemberInfo> = {};
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
            dayOfWeek: c.dayOfWeek ?? 2,
            time: c.time ?? "18:30",
            registrations: (c.registrations ?? []).map((r: { memberId: string; memberName: string; status: string }) => ({
                memberId: r.memberId,
                memberName: r.memberName,
                status: r.status as "pending" | "approved" | "rejected" | "absent",
            })),
        }));

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin" className={styles.backLink}>
                        ← Retour au tableau de bord
                    </Link>
                </div>

                <AdminObedienceView
                    sessions={sessions}
                    memberInfoById={memberInfoById}
                    approveAction={approveObedienceRegistrationAction}
                    rejectAction={rejectObedienceRegistrationAction}
                />
            </div>
        </main>
    );
}
