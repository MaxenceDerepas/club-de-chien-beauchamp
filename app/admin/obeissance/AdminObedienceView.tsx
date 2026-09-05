"use client";

import { useState } from "react";
import Link from "next/link";
import AdminObedienceCalendar, {
    type AdminObedienceSession,
    type AdminObedienceMemberInfo,
} from "@/components/AdminObedienceCalendar";
import type { MemberLevel } from "@/lib/members";
import styles from "../parcours-sante/parcours-sante.module.css";

const LEVEL_COLORS: Record<MemberLevel, string> = {
    chiot: "#d94f9a",
    premier_cours: "#9ad84c",
    ruban_violet: "#b08fd6",
    ruban_bleu: "#11b7e5",
    ruban_blanc: "#e6e6e6",
    ruban_rouge: "#ef6b6b",
    ruban_noir: "#2b2b2b",
    equipe: "#f5d957",
};

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

function renderAvatar(displayName: string, info: AdminObedienceMemberInfo | undefined, levelColor: string) {
    return (
        <div className={styles.registrationCardAvatarWrap}>
            {info?.dogPhotoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={info.dogPhotoUrl}
                    alt={displayName}
                    className={styles.registrationCardAvatar}
                    style={{ borderColor: levelColor }}
                />
            ) : (
                <span
                    className={styles.registrationCardInitial}
                    style={{ background: levelColor }}
                >
                    {displayName.charAt(0).toUpperCase() || "?"}
                </span>
            )}
            {info?.healthCourse && (
                <span className={styles.registrationCardTagHealth} title="Parcours de santé">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/Tag-Parcours-de-sante.png" alt="Parcours de santé" />
                </span>
            )}
            {info?.obedience && (
                <span className={styles.registrationCardTagObedience} title="Obéissance">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/Tag-Obeissance.png" alt="Obéissance" />
                </span>
            )}
        </div>
    );
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
                                    const displayName = info?.dogName || reg.memberName;
                                    const levelColor = info?.level ? LEVEL_COLORS[info.level] : "#1cc8f5";
                                    return (
                                        <div
                                            key={reg.memberId}
                                            className={`${styles.registrationCard} ${styles.registrationCardApproved}`}
                                        >
                                            <div className={styles.registrationCardInfo}>
                                                {renderAvatar(displayName, info, levelColor)}
                                                <div>
                                                    <div className={styles.registrationCardName}>
                                                        {displayName}
                                                    </div>
                                                    {info?.dogName && (
                                                        <div className={styles.registrationCardLevel}>
                                                            ({reg.memberName})
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
                                {absent.map((reg) => {
                                    const info = memberInfoById[reg.memberId];
                                    const displayName = info?.dogName || reg.memberName;
                                    const levelColor = info?.level ? LEVEL_COLORS[info.level] : "#1cc8f5";
                                    return (
                                        <div
                                            key={reg.memberId}
                                            className={styles.registrationCard}
                                            style={{ background: "#fff8e6" }}
                                        >
                                            <div className={styles.registrationCardInfo}>
                                                {renderAvatar(displayName, info, levelColor)}
                                                <div>
                                                    <div className={styles.registrationCardName}>
                                                        {displayName}
                                                    </div>
                                                    <div className={styles.registrationCardLevel}>
                                                        {info?.dogName ? `(${reg.memberName}) · ` : ""}Absent(e)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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
