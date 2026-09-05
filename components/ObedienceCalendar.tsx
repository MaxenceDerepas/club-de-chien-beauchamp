"use client";

import { useMemo, useState } from "react";
import type { MemberLevel } from "@/lib/levels";
import styles from "./obedience-calendar.module.css";

export type ObedienceCalendarSession = {
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

export type ObedienceMemberInfo = {
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
    sessions: ObedienceCalendarSession[];
    currentMemberId: string;
    memberInfoById: Record<string, ObedienceMemberInfo>;
    preregisterAction: (formData: FormData) => void | Promise<void>;
    cancelAction: (formData: FormData) => void | Promise<void>;
    absentAction: (formData: FormData) => void | Promise<void>;
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
    // Track week index: first week = 0
    let currentWeekStart = -1;
    let weekIndex = -1;

    while (d.getMonth() === month) {
        const dow = d.getDay();
        // New week starts on Monday (1)
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

export default function ObedienceCalendar({
    sessions,
    currentMemberId,
    memberInfoById,
    preregisterAction,
    cancelAction,
    absentAction,
}: Props) {
    const now = new Date();
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());

    const dates = useMemo(
        () => getObedienceDatesOfMonth(viewYear, viewMonth),
        [viewYear, viewMonth],
    );

    const sessionsByDateKey = useMemo(() => {
        const map = new Map<string, ObedienceCalendarSession>();
        for (const s of sessions) {
            const d = new Date(s.sessionDate);
            const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
            map.set(key, s);
        }
        return map;
    }, [sessions]);

    // Group dates by week for grid rendering
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
                    Choisissez une séance et préinscrivez-vous.
                    L&apos;équipe d&apos;éducation validera votre inscription.
                </p>
                <p className={styles.sidebarText}>
                    Si vous savez que vous ne pourrez pas venir,
                    marquez-vous comme absent(e).
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
                    {/* Column headers */}
                    {DAY_COLUMNS.map((col) => (
                        <div key={col.dayOfWeek} className={styles.dayHeader}>
                            {col.label}
                            <span className={styles.dayHeaderTime}>{col.time}</span>
                        </div>
                    ))}

                    {/* Week rows */}
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
                            const myReg = session?.registrations.find(
                                (r) => r.memberId === currentMemberId,
                            );
                            const approved =
                                session?.registrations.filter(
                                    (r) => r.status === "approved",
                                ) ?? [];

                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const isPast = dayDate.date < today;

                            const dateStr = `${dayDate.date.getFullYear()}-${String(dayDate.date.getMonth() + 1).padStart(2, "0")}-${String(dayDate.date.getDate()).padStart(2, "0")}`;

                            return (
                                <div
                                    key={`${weekIdx}-${col.dayOfWeek}`}
                                    className={`${styles.cell} ${isPast ? styles.cellPast : ""}`}
                                >
                                    <div className={styles.cellDate}>
                                        {dayDate.date.getDate()}
                                    </div>

                                    {myReg ? (
                                        <>
                                            <div
                                                className={`${styles.statusBadge} ${
                                                    myReg.status === "approved"
                                                        ? styles.statusApproved
                                                        : myReg.status === "rejected"
                                                          ? styles.statusRejected
                                                          : myReg.status === "absent"
                                                            ? styles.statusAbsent
                                                            : styles.statusPending
                                                }`}
                                            >
                                                {myReg.status === "approved"
                                                    ? "Validé(e)"
                                                    : myReg.status === "rejected"
                                                      ? "Non validé(e)"
                                                      : myReg.status === "absent"
                                                        ? "Absent(e)"
                                                        : "⏳ Préinscrit(e)"}
                                            </div>
                                            {!isPast && myReg.status !== "absent" && myReg.status !== "rejected" && (
                                                <>
                                                    <form action={cancelAction}>
                                                        <input type="hidden" name="sessionId" value={session!.id} />
                                                        <button type="submit" className={styles.cancelButton}>
                                                            Se désinscrire
                                                        </button>
                                                    </form>
                                                    <form action={absentAction}>
                                                        <input type="hidden" name="date" value={dateStr} />
                                                        <input type="hidden" name="dayOfWeek" value={String(dayDate.dayOfWeek)} />
                                                        <input type="hidden" name="time" value={dayDate.time} />
                                                        <button type="submit" className={styles.absentButton}>
                                                            Absent(e)
                                                        </button>
                                                    </form>
                                                </>
                                            )}
                                            {!isPast && myReg.status === "absent" && (
                                                <form action={preregisterAction}>
                                                    <input type="hidden" name="date" value={dateStr} />
                                                    <input type="hidden" name="dayOfWeek" value={String(dayDate.dayOfWeek)} />
                                                    <input type="hidden" name="time" value={dayDate.time} />
                                                    <button type="submit" className={styles.registerButton}>
                                                        Se réinscrire
                                                    </button>
                                                </form>
                                            )}
                                        </>
                                    ) : isPast ? (
                                        <div className={styles.disabledBadge}>
                                            Passée
                                        </div>
                                    ) : (
                                        <form action={preregisterAction}>
                                            <input type="hidden" name="date" value={dateStr} />
                                            <input type="hidden" name="dayOfWeek" value={String(dayDate.dayOfWeek)} />
                                            <input type="hidden" name="time" value={dayDate.time} />
                                            <button type="submit" className={styles.registerButton}>
                                                Se préinscrire
                                            </button>
                                        </form>
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
                                                            {info?.healthCourse && (
                                                                <span className={styles.avatarTagHealth}>
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src="/images/Tag-Parcours-de-sante.png" alt="Parcours de santé" />
                                                                </span>
                                                            )}
                                                            {info?.obedience && (
                                                                <span className={styles.avatarTagObedience}>
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src="/images/Tag-Obeissance.png" alt="Obéissance" />
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
