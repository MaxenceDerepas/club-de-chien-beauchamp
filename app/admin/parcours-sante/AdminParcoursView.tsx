"use client";

import { useState } from "react";
import AdminHealthCourseCalendar, {
    type AdminCalendarSession,
    type AdminCalendarMemberInfo,
} from "@/components/AdminHealthCourseCalendar";
import type { MemberLevel } from "@/lib/members";
import styles from "./parcours-sante.module.css";

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
    status: "pending" | "approved" | "rejected";
};

type Props = {
    sessions: AdminCalendarSession[];
    memberInfoById: Record<string, AdminCalendarMemberInfo>;
    approveAction: (formData: FormData) => void | Promise<void>;
    rejectAction: (formData: FormData) => void | Promise<void>;
};

function formatDate(iso: string) {
    return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(iso));
}

function renderAvatar(displayName: string, info: AdminCalendarMemberInfo | undefined, levelColor: string) {
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

export default function AdminParcoursView({
    sessions,
    memberInfoById,
    approveAction,
    rejectAction,
}: Props) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedSession = sessions.find((s) => s.id === selectedId) ?? null;

    const pending: Registration[] =
        selectedSession?.registrations.filter((r) => r.status === "pending") ??
        [];
    const approved: Registration[] =
        selectedSession?.registrations.filter((r) => r.status === "approved") ??
        [];
    const rejected: Registration[] =
        selectedSession?.registrations.filter((r) => r.status === "rejected") ??
        [];

    return (
        <>
            <AdminHealthCourseCalendar
                sessions={sessions}
                memberInfoById={memberInfoById}
                onSelectSession={setSelectedId}
                selectedSessionId={selectedId}
            />

            {selectedSession && (
                <section className={styles.card} style={{ marginTop: 24 }}>
                    <div className={styles.badge}>
                        INSCRIPTIONS — {formatDate(selectedSession.sessionDate)}
                    </div>

                    {selectedSession.registrations.length === 0 && (
                        <div className={styles.empty}>
                            Aucune demande d&apos;inscription pour cette séance.
                        </div>
                    )}

                    {/* Validées */}
                    {approved.length > 0 && (
                        <div className={styles.registrationSection}>
                            <h2 className={styles.registrationTitle}>
                                Validées ({approved.length})
                            </h2>
                            <div className={styles.registrationCards}>
                                {approved.map((reg) => {
                                    const info = memberInfoById[reg.memberId];
                                    const displayName =
                                        info?.dogName || reg.memberName;
                                    const levelColor = info?.level ? LEVEL_COLORS[info.level] : "#1cc8f5";
                                    return (
                                        <div
                                            key={reg.memberId}
                                            className={`${styles.registrationCard} ${styles.registrationCardApproved}`}
                                        >
                                            <div
                                                className={
                                                    styles.registrationCardInfo
                                                }
                                            >
                                                {renderAvatar(displayName, info, levelColor)}
                                                <div>
                                                    <div
                                                        className={
                                                            styles.registrationCardName
                                                        }
                                                    >
                                                        {displayName}
                                                    </div>
                                                    {info?.dogName && (
                                                        <div
                                                            className={
                                                                styles.registrationCardLevel
                                                            }
                                                        >
                                                            ({reg.memberName})
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <form action={rejectAction}>
                                                <input
                                                    type="hidden"
                                                    name="courseId"
                                                    value={selectedSession.id}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="memberId"
                                                    value={reg.memberId}
                                                />
                                                <button
                                                    type="submit"
                                                    className={
                                                        styles.rejectButton
                                                    }
                                                >
                                                    Désinscrire
                                                </button>
                                            </form>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* En attente */}
                    {pending.length > 0 && (
                        <div className={styles.registrationSection}>
                            <h2 className={styles.registrationTitle}>
                                En attente de validation ({pending.length})
                            </h2>
                            <div className={styles.registrationCards}>
                                {pending.map((reg) => {
                                    const info = memberInfoById[reg.memberId];
                                    const displayName = info?.dogName || reg.memberName;
                                    const levelColor = info?.level ? LEVEL_COLORS[info.level] : "#1cc8f5";
                                    return (
                                    <div
                                        key={reg.memberId}
                                        className={styles.registrationCard}
                                    >
                                        <div
                                            className={
                                                styles.registrationCardInfo
                                            }
                                        >
                                            {renderAvatar(displayName, info, levelColor)}
                                            <div>
                                                <div
                                                    className={
                                                        styles.registrationCardName
                                                    }
                                                >
                                                    {displayName}
                                                </div>
                                                {info?.dogName && (
                                                    <div className={styles.registrationCardLevel}>
                                                        ({reg.memberName})
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                styles.registrationCardActions
                                            }
                                        >
                                            <form action={approveAction}>
                                                <input
                                                    type="hidden"
                                                    name="courseId"
                                                    value={selectedSession.id}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="memberId"
                                                    value={reg.memberId}
                                                />
                                                <button
                                                    type="submit"
                                                    className={
                                                        styles.approveButton
                                                    }
                                                >
                                                    Valider
                                                </button>
                                            </form>
                                            <form action={rejectAction}>
                                                <input
                                                    type="hidden"
                                                    name="courseId"
                                                    value={selectedSession.id}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="memberId"
                                                    value={reg.memberId}
                                                />
                                                <button
                                                    type="submit"
                                                    className={
                                                        styles.rejectButton
                                                    }
                                                >
                                                    Refuser
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Refusées */}
                    {rejected.length > 0 && (
                        <div className={styles.registrationSection}>
                            <h2 className={styles.registrationTitle}>
                                Refusées ({rejected.length})
                            </h2>
                            <div className={styles.registrationCards}>
                                {rejected.map((reg) => {
                                    const info = memberInfoById[reg.memberId];
                                    const displayName = info?.dogName || reg.memberName;
                                    const levelColor = info?.level ? LEVEL_COLORS[info.level] : "#1cc8f5";
                                    return (
                                    <div
                                        key={reg.memberId}
                                        className={`${styles.registrationCard} ${styles.registrationCardRejected}`}
                                    >
                                        <div
                                            className={
                                                styles.registrationCardInfo
                                            }
                                        >
                                            {renderAvatar(displayName, info, levelColor)}
                                            <div>
                                                <div
                                                    className={
                                                        styles.registrationCardName
                                                    }
                                                >
                                                    {displayName}
                                                </div>
                                                {info?.dogName && (
                                                    <div className={styles.registrationCardLevel}>
                                                        ({reg.memberName})
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <form action={approveAction}>
                                            <input
                                                type="hidden"
                                                name="courseId"
                                                value={selectedSession.id}
                                            />
                                            <input
                                                type="hidden"
                                                name="memberId"
                                                value={reg.memberId}
                                            />
                                            <button
                                                type="submit"
                                                className={
                                                    styles.approveButton
                                                }
                                            >
                                                Valider
                                            </button>
                                        </form>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>
            )}
        </>
    );
}
