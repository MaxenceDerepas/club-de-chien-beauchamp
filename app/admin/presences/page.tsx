import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { listMembers } from "@/lib/members";
import { listAllAttendanceSessions } from "@/lib/attendance";
import { MEMBER_LEVELS } from "@/lib/levels";
import AttendanceView from "./AttendanceView";
import styles from "../parcours-sante/parcours-sante.module.css";

export const dynamic = "force-dynamic";

const LEVEL_LABELS: Record<string, string> = {
    chiot: "Chiots",
    premier_cours: "Premiers cours",
    ruban_violet: "Ruban Violet",
    ruban_bleu: "Ruban Bleu",
    ruban_blanc: "Ruban Blanc",
    ruban_rouge: "Ruban Rouge",
    ruban_noir: "Ruban Noir",
    equipe: "Équipe",
};

export default async function AdminPresencesPage() {
    await requireAdminSession();

    const [allMembers, allSessions] = await Promise.all([
        listMembers(),
        listAllAttendanceSessions(),
    ]);

    const activeMembers = allMembers
        .filter((m) => m.membershipActive && m._id)
        .map((m) => ({
            id: m._id!.toString(),
            name: [m.firstName, m.lastName].filter(Boolean).join(" ").trim() || m.dogName || "Adhérent",
            dogName: m.dogName || "",
            level: m.level,
        }))
        .sort((a, b) => {
            const ia = MEMBER_LEVELS.indexOf(a.level);
            const ib = MEMBER_LEVELS.indexOf(b.level);
            if (ia !== ib) return ia - ib;
            return a.name.localeCompare(b.name, "fr");
        });

    // All members for search (including inactive for historical lookup)
    const allMembersList = allMembers
        .filter((m) => m._id)
        .map((m) => ({
            id: m._id!.toString(),
            name: [m.firstName, m.lastName].filter(Boolean).join(" ").trim() || m.dogName || "Adhérent",
            dogName: m.dogName || "",
            level: m.level,
            active: m.membershipActive ?? false,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    const sessionsData = allSessions.map((s) => ({
        id: s._id!.toString(),
        sessionDate: s.sessionDate.toISOString(),
        dayOfWeek: s.dayOfWeek,
        presentCount: s.presentMembers.length,
        guestCount: s.guestDogs.length,
        presentMembers: s.presentMembers.map((pm) => ({
            memberId: pm.memberId,
            memberName: pm.memberName,
            level: pm.level,
        })),
        guestDogs: s.guestDogs.map((g) => ({
            name: g.name,
            ownerName: g.ownerName,
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

                <AttendanceView
                    activeMembers={activeMembers}
                    allMembers={allMembersList}
                    sessions={sessionsData}
                    levelLabels={LEVEL_LABELS}
                />
            </div>
        </main>
    );
}
