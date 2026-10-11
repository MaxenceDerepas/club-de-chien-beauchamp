"use client";

import { useMemo, useState, useTransition } from "react";
import type { MemberLevel } from "@/lib/levels";
import styles from "./health-course-calendar.module.css";

export type CalendarSession = {
    id: string;
    sessionDate: string; // ISO
    title: string;
    maxParticipants: number;
    registrations: {
        memberId: string;
        memberName: string;
        status: "pending" | "approved" | "rejected";
    }[];
};

export type CalendarMemberInfo = {
    dogName: string;
    dogPhotoUrl: string;
    level: MemberLevel;
    healthCourse: boolean;
    obedience: boolean;
};

const LEVEL_COLORS: Record<MemberLevel, string> = {
    chiot: "#d94f9a",
    premier_cours: "#9ad84c",
    ruban_violet: "#b08fd6",
    ring: "#f7941d",
    ruban_bleu: "#11b7e5",
    ruban_blanc: "#e6e6e6",
    ruban_rouge: "#ef6b6b",
    ruban_noir: "#2b2b2b",
    equipe: "#f5d957",
};

type Props = {
    sessions: CalendarSession[];
    currentMemberId: string;
    memberInfoById: Record<string, CalendarMemberInfo>;
    preregisterAction: (formData: FormData) => void | Promise<void>;
    cancelAction: (formData: FormData) => void | Promise<void>;
    isAdmin?: boolean;
    adminApproveAction?: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
    adminRejectAction?: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
};

const MONTH_NAMES = [
    "JANVIER",
    "FÉVRIER",
    "MARS",
    "AVRIL",
    "MAI",
    "JUIN",
    "JUILLET",
    "AOÛT",
    "SEPTEMBRE",
    "OCTOBRE",
    "NOVEMBRE",
    "DÉCEMBRE",
];

function getSundaysOfMonth(year: number, month: number): Date[] {
    const sundays: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        if (date.getDay() === 0) {
            sundays.push(new Date(date));
        }
        date.setDate(date.getDate() + 1);
    }
    return sundays;
}

export default function HealthCourseCalendar({
    sessions,
    currentMemberId,
    memberInfoById,
    preregisterAction,
    cancelAction,
    isAdmin,
    adminApproveAction,
    adminRejectAction,
}: Props) {
    const now = new Date();
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());
    const [adminPopup, setAdminPopup] = useState<{
        sessionId: string;
        memberId: string;
        dogName: string;
    } | null>(null);
    const [isPending, startTransition] = useTransition();
    const [adminError, setAdminError] = useState<string | null>(null);

    const sundays = useMemo(
        () => getSundaysOfMonth(viewYear, viewMonth),
        [viewYear, viewMonth],
    );

    const sessionsByDateKey = useMemo(() => {
        const map = new Map<string, CalendarSession>();
        for (const s of sessions) {
            const d = new Date(s.sessionDate);
            // Use UTC to match the server-stored UTC dates
            const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
            map.set(key, s);
        }
        return map;
    }, [sessions]);

    function goPrev() {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    }

    function goNext() {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    }

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>
                    PARCOURS
                    <br />
                    DE SANTÉ
                </h2>
                <div className={styles.sidebarWave} />
                <div className={styles.sidebarIcon} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/Tag-Parcours-de-sante.png"
                        alt="Parcours de santé"
                    />
                </div>
                <p className={styles.sidebarText}>
                    Choisissez un dimanche et préinscrivez-vous.
                    L&apos;équipe d&apos;éducation validera votre inscription.
                </p>
                <p className={styles.sidebarText}>
                    Les préinscriptions ferment 7 jours avant la date de la séance.
                </p>
            </aside>

            <div className={styles.main}>
                <div className={styles.monthHeader}>
                    <button
                        type="button"
                        onClick={goPrev}
                        className={styles.navArrow}
                        aria-label="Mois précédent"
                    >
                        ←
                    </button>
                    <h3 className={styles.monthTitle}>
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </h3>
                    <button
                        type="button"
                        onClick={goNext}
                        className={styles.navArrow}
                        aria-label="Mois suivant"
                    >
                        →
                    </button>
                </div>

                {sundays.length === 0 ? (
                    <p className={styles.empty}>
                        Aucun dimanche dans ce mois.
                    </p>
                ) : (
                    <div className={styles.grid}>
                        {sundays.map((sunday) => {
                            // Use local date parts to match UTC-stored session keys
                            const key = `${sunday.getFullYear()}-${sunday.getMonth()}-${sunday.getDate()}`;
                            const session = sessionsByDateKey.get(key);
                            const myReg = session?.registrations.find(
                                (r) => r.memberId === currentMemberId,
                            );
                            const approved =
                                session?.registrations.filter(
                                    (r) => r.status === "approved",
                                ) ?? [];
                            const pending =
                                session?.registrations.filter(
                                    (r) => r.status === "pending",
                                ) ?? [];
                            const today = new Date(new Date().setHours(0, 0, 0, 0));
                            const isPast = sunday < today;
                            const sevenDaysBefore = new Date(sunday);
                            sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
                            sevenDaysBefore.setHours(23, 59, 59, 999);
                            const isClosedForRegistration = !isPast && new Date() > sevenDaysBefore;

                            // Send date as YYYY-MM-DD to avoid timezone shift
                            const sundayDateStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, "0")}-${String(sunday.getDate()).padStart(2, "0")}`;

                            return (
                                <div
                                    key={key}
                                    className={styles.column}
                                >
                                    <div className={styles.dayCell}>
                                        <span className={styles.dayNumber}>
                                            {sunday.getDate()}
                                        </span>
                                    </div>
                                    <div className={styles.bodyCell}>
                                        {myReg ? (
                                            <>
                                                <div
                                                    className={`${styles.statusBadge} ${
                                                        myReg.status === "approved"
                                                            ? styles.statusApproved
                                                            : myReg.status === "rejected"
                                                              ? styles.statusRejected
                                                              : styles.statusPending
                                                    }`}
                                                >
                                                    {myReg.status === "approved"
                                                        ? "Sélectionné(e)"
                                                        : myReg.status === "rejected"
                                                          ? "Non sélectionné(e)"
                                                          : "⏳ Préinscrit(e)"}
                                                </div>
                                                {(myReg.status === "pending" ||
                                                    myReg.status === "approved") &&
                                                    !isPast &&
                                                    session && (
                                                    <form action={cancelAction}>
                                                        <input
                                                            type="hidden"
                                                            name="sessionId"
                                                            value={session.id}
                                                        />
                                                        <button
                                                            type="submit"
                                                            className={styles.cancelButton}
                                                        >
                                                            Se désinscrire
                                                        </button>
                                                    </form>
                                                )}
                                            </>
                                        ) : isPast ? (
                                            <div className={styles.disabledBadge}>
                                                Séance passée
                                            </div>
                                        ) : isClosedForRegistration ? (
                                            <div className={styles.disabledBadge}>
                                                Préinscriptions fermées
                                            </div>
                                        ) : (
                                            <form action={preregisterAction}>
                                                <input
                                                    type="hidden"
                                                    name="date"
                                                    value={sundayDateStr}
                                                />
                                                <button
                                                    type="submit"
                                                    className={styles.registerButton}
                                                >
                                                    Se préinscrire
                                                </button>
                                            </form>
                                        )}

                                        <div className={styles.avatarsList}>
                                            {approved.map((reg) => {
                                                const info = memberInfoById[reg.memberId];
                                                const dogName = info?.dogName || reg.memberName;
                                                return (
                                                    <div
                                                        key={reg.memberId}
                                                        className={styles.avatarItem}
                                                    >
                                                        <span className={styles.avatarName}>
                                                            {dogName}
                                                        </span>
                                                        <div className={styles.avatarWrap}>
                                                            {info?.dogPhotoUrl ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={info.dogPhotoUrl}
                                                                    alt={dogName}
                                                                    className={styles.avatarImg}
                                                                    style={{
                                                                        borderColor: info
                                                                            ? LEVEL_COLORS[info.level]
                                                                            : "#ef6b6b",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span
                                                                    className={styles.avatarFallback}
                                                                    style={{
                                                                        borderColor: info
                                                                            ? LEVEL_COLORS[info.level]
                                                                            : "#ef6b6b",
                                                                    }}
                                                                >
                                                                    {dogName.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                            {info?.healthCourse && (
                                                                <span className={styles.avatarTagHealth}>
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src="/images/Tag-Parcours-de-sante.png"
                                                                        alt="Parcours de santé"
                                                                    />
                                                                </span>
                                                            )}
                                                            {info?.obedience && (
                                                                <span className={styles.avatarTagObedience}>
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src="/images/Tag-Obeissance.png"
                                                                        alt="Obéissance"
                                                                    />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {pending.map((reg) => {
                                                const info = memberInfoById[reg.memberId];
                                                const dogName = info?.dogName || reg.memberName;
                                                const isClickable = isAdmin && session;
                                                return (
                                                    <div
                                                        key={reg.memberId}
                                                        className={`${styles.avatarItem} ${styles.avatarPending} ${isClickable ? styles.avatarClickable : ""}`}
                                                        onClick={isClickable ? () => {
                                                            setAdminError(null);
                                                            setAdminPopup({
                                                                sessionId: session!.id,
                                                                memberId: reg.memberId,
                                                                dogName,
                                                            });
                                                        } : undefined}
                                                        role={isClickable ? "button" : undefined}
                                                        tabIndex={isClickable ? 0 : undefined}
                                                        title={isClickable ? `Gérer ${dogName}` : undefined}
                                                    >
                                                        <span className={styles.avatarName}>
                                                            {dogName}
                                                        </span>
                                                        <div className={styles.avatarWrap}>
                                                            {info?.dogPhotoUrl ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={info.dogPhotoUrl}
                                                                    alt={dogName}
                                                                    className={styles.avatarImg}
                                                                    style={{
                                                                        borderColor: "#b0b0b0",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span
                                                                    className={styles.avatarFallback}
                                                                    style={{
                                                                        borderColor: "#b0b0b0",
                                                                    }}
                                                                >
                                                                    {dogName.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Admin popup for approve/reject */}
            {adminPopup && isAdmin && adminApproveAction && adminRejectAction && (
                <>
                    <div
                        className={styles.adminPopupBackdrop}
                        onClick={() => setAdminPopup(null)}
                    />
                    <div className={styles.adminPopup}>
                        <p className={styles.adminPopupTitle}>
                            {adminPopup.dogName}
                        </p>
                        {adminError && (
                            <p className={styles.adminPopupError}>{adminError}</p>
                        )}
                        <div className={styles.adminPopupButtons}>
                            <button
                                type="button"
                                className={styles.adminApproveBtn}
                                disabled={isPending}
                                onClick={() => {
                                    startTransition(async () => {
                                        const fd = new FormData();
                                        fd.set("courseId", adminPopup.sessionId);
                                        fd.set("memberId", adminPopup.memberId);
                                        const result = await adminApproveAction(fd);
                                        if (result.success) {
                                            setAdminPopup(null);
                                            setAdminError(null);
                                        } else {
                                            setAdminError(result.error || "Erreur");
                                        }
                                    });
                                }}
                            >
                                ✅ Valider
                            </button>
                            <button
                                type="button"
                                className={styles.adminRejectBtn}
                                disabled={isPending}
                                onClick={() => {
                                    startTransition(async () => {
                                        const fd = new FormData();
                                        fd.set("courseId", adminPopup.sessionId);
                                        fd.set("memberId", adminPopup.memberId);
                                        const result = await adminRejectAction(fd);
                                        if (result.success) {
                                            setAdminPopup(null);
                                            setAdminError(null);
                                        } else {
                                            setAdminError(result.error || "Erreur");
                                        }
                                    });
                                }}
                            >
                                ❌ Refuser
                            </button>
                        </div>
                        <button
                            type="button"
                            className={styles.adminPopupClose}
                            onClick={() => setAdminPopup(null)}
                        >
                            Fermer
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
