import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { listMembers } from "@/lib/members";
import { listAttendanceRecords, type AttendanceSourceType } from "@/lib/attendance";
import { listHealthCourses } from "@/lib/health-courses";
import { listObedienceSessions } from "@/lib/obedience";
import { listEvents } from "@/lib/events";
import AttendanceView from "./AttendanceView";
import styles from "../parcours-sante/parcours-sante.module.css";

export const dynamic = "force-dynamic";

const DAY_LABELS: Record<number, string> = {
    0: "Dimanche",
    1: "Lundi",
    2: "Mardi",
    3: "Mercredi",
    4: "Jeudi",
    5: "Vendredi",
    6: "Samedi",
};

function formatDateLabel(d: Date) {
    const dayLabel = DAY_LABELS[d.getUTCDay()] || "";
    return `${dayLabel} ${d.getUTCDate()} ${new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(d)}`;
}

export type PastSession = {
    sourceType: AttendanceSourceType;
    sourceId: string;
    sessionLabel: string;
    sessionDate: string;
    /** Registered/approved member IDs + names for this session */
    registeredMembers: { memberId: string; memberName: string }[];
    /** If attendance was already filled */
    attendanceFilled: boolean;
    presentMembers: { memberId: string; memberName: string; level: string }[];
    guestDogs: { name: string; ownerName: string }[];
};

export default async function AdminPresencesPage() {
    await requireAdminSession();

    const now = new Date();

    const [allMembers, attendanceRecords, healthCourses, obedienceSessions, events] =
        await Promise.all([
            listMembers(),
            listAttendanceRecords(),
            listHealthCourses(),
            listObedienceSessions(),
            listEvents(),
        ]);

    // Build attendance lookup: sourceType+sourceId -> record
    const attendanceMap = new Map<string, (typeof attendanceRecords)[0]>();
    for (const rec of attendanceRecords) {
        attendanceMap.set(`${rec.sourceType}:${rec.sourceId}`, rec);
    }

    const pastSessions: PastSession[] = [];

    // Health courses (parcours) — past sessions with at least one approved registration
    for (const hc of healthCourses) {
        if (!hc.sessionDate || new Date(hc.sessionDate) > now) continue;
        const id = hc._id?.toString() ?? "";
        const approved = hc.registrations.filter((r) => r.status === "approved");
        if (approved.length === 0) continue;
        const att = attendanceMap.get(`parcours:${id}`);
        pastSessions.push({
            sourceType: "parcours",
            sourceId: id,
            sessionLabel: `Parcours de santé — ${formatDateLabel(new Date(hc.sessionDate))}`,
            sessionDate: new Date(hc.sessionDate).toISOString(),
            registeredMembers: approved.map((r) => ({
                memberId: r.memberId,
                memberName: r.memberName,
            })),
            attendanceFilled: !!att,
            presentMembers: att
                ? att.presentMembers.map((pm) => ({
                      memberId: pm.memberId,
                      memberName: pm.memberName,
                      level: pm.level,
                  }))
                : [],
            guestDogs: att ? att.guestDogs.map((g) => ({ name: g.name, ownerName: g.ownerName })) : [],
        });
    }

    // Obedience sessions — past
    for (const ob of obedienceSessions) {
        if (new Date(ob.sessionDate) > now) continue;
        const id = ob._id?.toString() ?? "";
        const approved = ob.registrations.filter(
            (r) => r.status === "approved" || r.status === "absent",
        );
        if (approved.length === 0) continue;
        const att = attendanceMap.get(`obeissance:${id}`);
        pastSessions.push({
            sourceType: "obeissance",
            sourceId: id,
            sessionLabel: `Obéissance ${ob.time} — ${formatDateLabel(new Date(ob.sessionDate))}`,
            sessionDate: new Date(ob.sessionDate).toISOString(),
            registeredMembers: approved.map((r) => ({
                memberId: r.memberId,
                memberName: r.memberName,
            })),
            attendanceFilled: !!att,
            presentMembers: att
                ? att.presentMembers.map((pm) => ({
                      memberId: pm.memberId,
                      memberName: pm.memberName,
                      level: pm.level,
                  }))
                : [],
            guestDogs: att ? att.guestDogs.map((g) => ({ name: g.name, ownerName: g.ownerName })) : [],
        });
    }

    // Events — past published events
    for (const ev of events) {
        if (!ev.eventDate || new Date(ev.eventDate) > now || !ev.isPublished) continue;
        const id = ev._id?.toString() ?? "";
        const approved = ev.registrations.filter((r) => r.status === "approved");
        if (approved.length === 0) continue;
        const att = attendanceMap.get(`event:${id}`);
        pastSessions.push({
            sourceType: "event",
            sourceId: id,
            sessionLabel: `${ev.title} — ${formatDateLabel(new Date(ev.eventDate))}`,
            sessionDate: new Date(ev.eventDate).toISOString(),
            registeredMembers: approved.map((r) => ({
                memberId: r.memberId,
                memberName: r.memberName,
            })),
            attendanceFilled: !!att,
            presentMembers: att
                ? att.presentMembers.map((pm) => ({
                      memberId: pm.memberId,
                      memberName: pm.memberName,
                      level: pm.level,
                  }))
                : [],
            guestDogs: att ? att.guestDogs.map((g) => ({ name: g.name, ownerName: g.ownerName })) : [],
        });
    }

    // Sort by date descending (most recent first)
    pastSessions.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

    // All members for search
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

    // Member info for level lookup
    const memberInfoById: Record<string, { level: string; dogName: string }> = {};
    for (const m of allMembers) {
        if (!m._id) continue;
        memberInfoById[m._id.toString()] = {
            level: m.level,
            dogName: m.dogName || "",
        };
    }

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin" className={styles.backLink}>
                        ← Retour au tableau de bord
                    </Link>
                </div>

                <AttendanceView
                    pastSessions={pastSessions}
                    allMembers={allMembersList}
                    memberInfoById={memberInfoById}
                />
            </div>
        </main>
    );
}
