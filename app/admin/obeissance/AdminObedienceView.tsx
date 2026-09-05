"use client";

import { useState } from "react";
import Link from "next/link";
import AdminObedienceCalendar, {
    type AdminObedienceSession,
    type AdminObedienceMemberInfo,
} from "@/components/AdminObedienceCalendar";
import styles from "../parcours-sante/parcours-sante.module.css";

type Registration = {
    memberId: string;
    memberName: string;
    status: "pending" | "approved" | "rejected" | "absent";
};

type Props = {
    sessions: AdminObedienceSession[];
    memberInfoById: Record<string, AdminObedienceMemberInfo>;
};

const DAY_LABELS: Record<number, string> = {
    2: "Mardi",
    4: "Jeudi",
    6: "Samedi",
};

function formatDate(iso: string, dayOfWeek: number) {
    const d = new Date(iso);
    const dayLabel = DAY_LABELS[dayOfWeek] || "";
    return `${dayLabel} ${d.getUTCDate()} ${new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(d)}`;
}

export default function AdminObedienceView({
    sessions,
    memberInfoById,
}: Props) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedSession = sessions.find((s) => s.id === selectedId) ?? null;

    const approved: Registration[] =
        selectedSession?.registrations.filter((r) => r.status === "approved") ??
        [];
    const absent: Registration[] =
        selectedSession?.registrations.filter((r) => r.status === "absent") ??
        [];

    return (
        <>
            <AdminObedienceCalendar
                sessions={sessions}
                memberInfoById={memberInfoById}
                onSelectSession={setSelectedId}
                selectedSessionId={selectedId}
            />

            {selectedSession && (
                <section className={styles.card} style={{ marginTop: 24 }}>
                    <div className={styles.badge}>
                        INSCRIPTIONS — {formatDate(selectedSession.sessionDate, selectedSession.dayOfWeek)} à {selectedSession.time}
                    </div>

                    {selectedSession.registrations.length === 0 && (
                        <div className={styles.empty}>
                            Aucune inscription pour cette séance.
                        </div>
                    )}

                    {/* Inscrits */}
                    {approved.length > 0 && (
                        <div className={styles.registrationSection}>
                            <h2 className={styles.registrationTitle}>
                                Inscrits ({approved.length})
                            </h2>
                            <div className={styles.registrationCards}>
                                {approved.map((reg) => {
                                    const info = memberInfoById[reg.memberId];
                                    const name = info?.dogName || reg.memberName;
                                    return (
                                        <div
                                            key={reg.memberId}
                                            className={`${styles.registrationCard} ${styles.registrationCardApproved}`}
                                        >
                                            <div className={styles.registrationCardInfo}>
                                                <span className={styles.registrationCardInitial}>
                                                    {name.charAt(0).toUpperCase() || "?"}
                                                </span>
                                                <div>
                                                    <div className={styles.registrationCardName}>
                                                        {reg.memberName}
                                                    </div>
                                                    {info?.dogName && (
                                                        <div className={styles.registrationCardLevel}>
                                                            {info.dogName}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Absents */}
                    {absent.length > 0 && (
                        <div className={styles.registrationSection}>
                            <h2 className={styles.registrationTitle}>
                                Absent(e)s ({absent.length})
                            </h2>
                            <div className={styles.registrationCards}>
                                {absent.map((reg) => (
                                    <div
                                        key={reg.memberId}
                                        className={styles.registrationCard}
                                        style={{ background: "#fff8e6" }}
                                    >
                                        <div className={styles.registrationCardInfo}>
                                            <span className={styles.registrationCardInitial}>
                                                {reg.memberName?.charAt(0).toUpperCase() || "?"}
                                            </span>
                                            <div>
                                                <div className={styles.registrationCardName}>
                                                    {reg.memberName}
                                                </div>
                                                <div className={styles.registrationCardLevel}>
                                                    Absent(e)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

            <div style={{ marginTop: 24, textAlign: "right" }}>
                <Link
                    href="/admin/obeissance/notifications"
                    style={{
                        color: "#ffffff",
                        fontWeight: 700,
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                    }}
                >
                    Configurer les notifications →
                </Link>
            </div>
        </>
    );
}
