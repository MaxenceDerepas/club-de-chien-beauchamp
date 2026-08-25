"use client";

import { useState } from "react";
import AdminHealthCourseCalendar, {
    type AdminCalendarSession,
    type AdminCalendarMemberInfo,
} from "@/components/AdminHealthCourseCalendar";
import styles from "./parcours-sante.module.css";

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
    deleteAction: (formData: FormData) => void | Promise<void>;
};

function formatDate(iso: string) {
    return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(iso));
}

export default function AdminParcoursView({
    sessions,
    memberInfoById,
    approveAction,
    rejectAction,
    deleteAction,
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
                                    const name =
                                        info?.dogName || reg.memberName;
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
                                                <span
                                                    className={
                                                        styles.registrationCardInitial
                                                    }
                                                >
                                                    {name
                                                        .charAt(0)
                                                        .toUpperCase() || "?"}
                                                </span>
                                                <div>
                                                    <div
                                                        className={
                                                            styles.registrationCardName
                                                        }
                                                    >
                                                        {reg.memberName}
                                                    </div>
                                                    {info?.dogName && (
                                                        <div
                                                            className={
                                                                styles.registrationCardLevel
                                                            }
                                                        >
                                                            {info.dogName}
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
                                {pending.map((reg) => (
                                    <div
                                        key={reg.memberId}
                                        className={styles.registrationCard}
                                    >
                                        <div
                                            className={
                                                styles.registrationCardInfo
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.registrationCardInitial
                                                }
                                            >
                                                {reg.memberName
                                                    ?.charAt(0)
                                                    .toUpperCase() || "?"}
                                            </span>
                                            <div>
                                                <div
                                                    className={
                                                        styles.registrationCardName
                                                    }
                                                >
                                                    {reg.memberName}
                                                </div>
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
                                ))}
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
                                {rejected.map((reg) => (
                                    <div
                                        key={reg.memberId}
                                        className={`${styles.registrationCard} ${styles.registrationCardRejected}`}
                                    >
                                        <div
                                            className={
                                                styles.registrationCardInfo
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.registrationCardInitial
                                                }
                                            >
                                                {reg.memberName
                                                    ?.charAt(0)
                                                    .toUpperCase() || "?"}
                                            </span>
                                            <div>
                                                <div
                                                    className={
                                                        styles.registrationCardName
                                                    }
                                                >
                                                    {reg.memberName}
                                                </div>
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
                                ))}
                            </div>
                        </div>
                    )}
                    <div className={styles.deleteRow}>
                        <form action={deleteAction}>
                            <input
                                type="hidden"
                                name="id"
                                value={selectedSession.id}
                            />
                            <button
                                type="submit"
                                className={styles.deleteButton}
                            >
                                Supprimer cette séance
                            </button>
                        </form>
                    </div>
                </section>
            )}
        </>
    );
}
