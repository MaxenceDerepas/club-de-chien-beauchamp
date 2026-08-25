"use client";

import { useMemo, useState } from "react";
import type { MemberLevel } from "@/lib/levels";
import styles from "./health-course-calendar.module.css";

export type AdminCalendarSession = {
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

export type AdminCalendarMemberInfo = {
    dogName: string;
    dogPhotoUrl: string;
    level: MemberLevel;
    healthCourse: boolean;
    obedience: boolean;
};

const LEVEL_COLORS: Record<MemberLevel, string> = {
    chiot: "#f5d957",
    premier_cours: "#9ad84c",
    ruban_violet: "#b08fd6",
    ruban_bleu: "#11b7e5",
    ruban_blanc: "#e6e6e6",
    ruban_rouge: "#ef6b6b",
    ruban_noir: "#2b2b2b",
};

type Props = {
    sessions: AdminCalendarSession[];
    memberInfoById: Record<string, AdminCalendarMemberInfo>;
    onSelectSession?: (sessionId: string | null) => void;
    selectedSessionId?: string | null;
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

export default function AdminHealthCourseCalendar({
    sessions,
    memberInfoById,
    onSelectSession,
    selectedSessionId,
}: Props) {
    const now = new Date();
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());

    const sundays = useMemo(
        () => getSundaysOfMonth(viewYear, viewMonth),
        [viewYear, viewMonth],
    );

    const sessionsByDateKey = useMemo(() => {
        const map = new Map<string, AdminCalendarSession>();
        for (const s of sessions) {
            const d = new Date(s.sessionDate);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
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
                    Vue administrative du calendrier.
                </p>
                <p className={styles.sidebarText}>
                    Cliquez sur un dimanche programmé pour voir et gérer les
                    inscriptions.
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
                            const key = `${sunday.getFullYear()}-${sunday.getMonth()}-${sunday.getDate()}`;
                            const session = sessionsByDateKey.get(key);
                            const approved =
                                session?.registrations.filter(
                                    (r) => r.status === "approved",
                                ) ?? [];
                            const pendingCount =
                                session?.registrations.filter(
                                    (r) => r.status === "pending",
                                ).length ?? 0;
                            const isSelected =
                                session && session.id === selectedSessionId;

                            return (
                                <div key={key} className={styles.column}>
                                    <div
                                        className={`${styles.dayCell} ${isSelected ? styles.dayCellSelected : ""}`}
                                        onClick={() => {
                                            if (session && onSelectSession) {
                                                onSelectSession(
                                                    isSelected
                                                        ? null
                                                        : session.id,
                                                );
                                            }
                                        }}
                                        style={{
                                            cursor: session
                                                ? "pointer"
                                                : "default",
                                        }}
                                    >
                                        <span className={styles.dayNumber}>
                                            {sunday.getDate()}
                                        </span>
                                    </div>
                                    <div className={styles.bodyCell}>
                                        {session ? (
                                            <div
                                                className={`${styles.statusBadge} ${
                                                    pendingCount > 0
                                                        ? styles.statusPending
                                                        : styles.statusApproved
                                                }`}
                                                onClick={() => {
                                                    if (onSelectSession) {
                                                        onSelectSession(
                                                            isSelected
                                                                ? null
                                                                : session.id,
                                                        );
                                                    }
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {approved.length} validé
                                                {approved.length > 1
                                                    ? "s"
                                                    : ""}
                                                {pendingCount > 0 &&
                                                    ` · ${pendingCount} en attente`}
                                            </div>
                                        ) : (
                                            <div
                                                className={
                                                    styles.disabledBadge
                                                }
                                            >
                                                Non programmé
                                            </div>
                                        )}

                                        <div className={styles.avatarsList}>
                                            {approved.map((reg) => {
                                                const info =
                                                    memberInfoById[
                                                        reg.memberId
                                                    ];
                                                const dogName =
                                                    info?.dogName ||
                                                    reg.memberName;
                                                return (
                                                    <div
                                                        key={reg.memberId}
                                                        className={
                                                            styles.avatarItem
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                styles.avatarName
                                                            }
                                                        >
                                                            {dogName}
                                                        </span>
                                                        <div
                                                            className={
                                                                styles.avatarWrap
                                                            }
                                                        >
                                                            {info?.dogPhotoUrl ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={
                                                                        info.dogPhotoUrl
                                                                    }
                                                                    alt={
                                                                        dogName
                                                                    }
                                                                    className={
                                                                        styles.avatarImg
                                                                    }
                                                                    style={{
                                                                        borderColor:
                                                                            info
                                                                                ? LEVEL_COLORS[
                                                                                      info.level
                                                                                  ]
                                                                                : "#ef6b6b",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span
                                                                    className={
                                                                        styles.avatarFallback
                                                                    }
                                                                    style={{
                                                                        borderColor:
                                                                            info
                                                                                ? LEVEL_COLORS[
                                                                                      info.level
                                                                                  ]
                                                                                : "#ef6b6b",
                                                                    }}
                                                                >
                                                                    {dogName
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </span>
                                                            )}
                                                            {info?.healthCourse && (
                                                                <span
                                                                    className={
                                                                        styles.avatarTagHealth
                                                                    }
                                                                >
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src="/images/Tag-Parcours-de-sante.png"
                                                                        alt="Parcours de santé"
                                                                    />
                                                                </span>
                                                            )}
                                                            {info?.obedience && (
                                                                <span
                                                                    className={
                                                                        styles.avatarTagObedience
                                                                    }
                                                                >
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
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
