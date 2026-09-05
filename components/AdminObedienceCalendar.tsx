"use client";

import { useMemo, useState } from "react";
import type { MemberLevel } from "@/lib/levels";
import styles from "./obedience-calendar.module.css";

export type AdminObedienceSession = {
    id: string;
    sessionDate: string; // ISO
    dayOfWeek: number;
    time: string;
    registrations: {
        memberId: string;
        memberName: string;
        status: "pending" | "approved" | "rejected" | "absent";
    }[];
};

export type AdminObedienceMemberInfo = {
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
    ruban_bleu: "#11b7e5",
    ruban_blanc: "#e6e6e6",
    ruban_rouge: "#ef6b6b",
    ruban_noir: "#2b2b2b",
    equipe: "#f5d957",
};

type Props = {
    sessions: AdminObedienceSession[];
    memberInfoById: Record<string, AdminObedienceMemberInfo>;
    onSelectSession?: (sessionId: string | null) => void;
    selectedSessionId?: string | null;
};

const MONTH_NAMES = [
    "JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN",
    "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE",
];

const DAY_COLUMNS = [
    { dayOfWeek: 2, label: "MARDI", time: "18:30" },
    { dayOfWeek: 4, label: "JEUDI", time: "18:30" },
    { dayOfWeek: 6, label: "SAMEDI", time: "13:15" },
];

type DayDate = {
    date: Date;
    dayOfWeek: number;
    time: string;
    weekIndex: number;
};

function getObedienceDatesOfMonth(year: number, month: number): DayDate[] {
    const dates: DayDate[] = [];
    const d = new Date(year, month, 1);
    let currentWeekStart = -1;
    let weekIndex = -1;

    while (d.getMonth() === month) {
        const dow = d.getDay();
        if (dow === 1 || currentWeekStart === -1) {
            weekIndex++;
            currentWeekStart = d.getDate();
        }
        const col = DAY_COLUMNS.find((c) => c.dayOfWeek === dow);
        if (col) {
            dates.push({
                date: new Date(d),
                dayOfWeek: dow,
                time: col.time,
                weekIndex,
            });
        }
        d.setDate(d.getDate() + 1);
    }

    return dates;
}

export default function AdminObedienceCalendar({
    sessions,
    memberInfoById,
    onSelectSession,
    selectedSessionId,
}: Props) {
    const now = new Date();
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());

    const dates = useMemo(
        () => getObedienceDatesOfMonth(viewYear, viewMonth),
        [viewYear, viewMonth],
    );

    const sessionsByDateKey = useMemo(() => {
        const map = new Map<string, AdminObedienceSession>();
        for (const s of sessions) {
            const d = new Date(s.sessionDate);
            const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
            map.set(key, s);
        }
        return map;
    }, [sessions]);

    const maxWeek = dates.length > 0
        ? Math.max(...dates.map((d) => d.weekIndex))
        : 0;

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
                    OBÉISSANCE
                </h2>
                <div className={styles.sidebarWave} />
                <div className={styles.sidebarIcon} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/Tag-Obeissance.png"
                        alt="Obéissance"
                    />
                </div>
                <p className={styles.sidebarText}>
                    Vue administrative du calendrier.
                </p>
                <p className={styles.sidebarText}>
                    Cliquez sur une séance pour voir et gérer les inscriptions.
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

                <div className={styles.calendarGrid}>
                    {DAY_COLUMNS.map((col) => (
                        <div key={col.dayOfWeek} className={styles.dayHeader}>
                            {col.label}
                            <span className={styles.dayHeaderTime}>{col.time}</span>
                        </div>
                    ))}

                    {Array.from({ length: maxWeek + 1 }, (_, weekIdx) =>
                        DAY_COLUMNS.map((col) => {
                            const dayDate = dates.find(
                                (d) =>
                                    d.weekIndex === weekIdx &&
                                    d.dayOfWeek === col.dayOfWeek,
                            );

                            if (!dayDate) {
                                return (
                                    <div
                                        key={`empty-${weekIdx}-${col.dayOfWeek}`}
                                        className={styles.cellEmpty}
                                    />
                                );
                            }

                            const key = `${dayDate.date.getFullYear()}-${dayDate.date.getMonth()}-${dayDate.date.getDate()}`;
                            const session = sessionsByDateKey.get(key);

                            const pendingCount =
                                session?.registrations.filter(
                                    (r) => r.status === "pending",
                                ).length ?? 0;
                            const approvedCount =
                                session?.registrations.filter(
                                    (r) => r.status === "approved",
                                ).length ?? 0;
                            const absentCount =
                                session?.registrations.filter(
                                    (r) => r.status === "absent",
                                ).length ?? 0;

                            const isSelected = session?.id === selectedSessionId;
                            const approved =
                                session?.registrations.filter(
                                    (r) => r.status === "approved",
                                ) ?? [];

                            return (
                                <div
                                    key={`${weekIdx}-${col.dayOfWeek}`}
                                    className={styles.cell}
                                    style={{
                                        cursor: session ? "pointer" : undefined,
                                        outline: isSelected
                                            ? "3px solid #06607b"
                                            : undefined,
                                    }}
                                    onClick={() => {
                                        if (session && onSelectSession) {
                                            onSelectSession(
                                                isSelected ? null : session.id,
                                            );
                                        }
                                    }}
                                >
                                    <div className={styles.cellDate}>
                                        {dayDate.date.getDate()}
                                    </div>

                                    {session && (pendingCount > 0 || approvedCount > 0 || absentCount > 0) && (
                                        <div style={{ fontSize: "0.75rem", fontWeight: 700, textAlign: "center", color: "#163040" }}>
                                            {approvedCount > 0 && (
                                                <span style={{ color: "#16713a" }}>
                                                    {approvedCount} validé{approvedCount > 1 ? "s" : ""}
                                                </span>
                                            )}
                                            {pendingCount > 0 && (
                                                <span style={{ color: "#8a5c00", marginLeft: approvedCount > 0 ? 6 : 0 }}>
                                                    {pendingCount} en attente
                                                </span>
                                            )}
                                            {absentCount > 0 && (
                                                <span style={{ color: "#888", marginLeft: (approvedCount > 0 || pendingCount > 0) ? 6 : 0 }}>
                                                    {absentCount} absent{absentCount > 1 ? "s" : ""}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {approved.length > 0 && (
                                        <div className={styles.avatarsList}>
                                            {approved.map((reg) => {
                                                const info = memberInfoById[reg.memberId];
                                                const dogName = info?.dogName || reg.memberName;
                                                return (
                                                    <div key={reg.memberId} className={styles.avatarItem}>
                                                        <span className={styles.avatarName}>{dogName}</span>
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
                                                                            : "#b08fd6",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span
                                                                    className={styles.avatarFallback}
                                                                    style={{
                                                                        borderColor: info
                                                                            ? LEVEL_COLORS[info.level]
                                                                            : "#b08fd6",
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
                                    )}
                                </div>
                            );
                        }),
                    )}
                </div>
            </div>
        </div>
    );
}
