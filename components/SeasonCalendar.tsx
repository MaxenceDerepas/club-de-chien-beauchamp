"use client";

import { useState } from "react";
import styles from "./season-calendar.module.css";

export type SeasonEvent = {
    id: string;
    title: string;
    eventDate: string; // ISO string
};

type Props = {
    events: SeasonEvent[];
};

const MONTH_NAMES = [
    "Septembre", "Octobre", "Novembre", "Décembre",
    "Janvier", "Février", "Mars", "Avril",
    "Mai", "Juin", "Juillet", "Août",
];

const MONTH_THEMES: Record<string, { bg: string; text: string }> = {
    Septembre: { bg: "#c9b99a", text: "#4a3728" },
    Octobre: { bg: "#f0b87e", text: "#5a3210" },
    Novembre: { bg: "#4a6fa5", text: "#ffffff" },
    Décembre: { bg: "#e8a0a0", text: "#5a2020" },
    Janvier: { bg: "#b0b5b8", text: "#2a2a2a" },
    Février: { bg: "#a0d0d0", text: "#1a4040" },
    Mars: { bg: "#a8d5a2", text: "#1a4020" },
    Avril: { bg: "#f5e6a0", text: "#5a4a10" },
    Mai: { bg: "#f0a8c0", text: "#5a1030" },
    Juin: { bg: "#87ceeb", text: "#1a3050" },
    Juillet: { bg: "#f0c878", text: "#5a4010" },
    Août: { bg: "#e8c8a0", text: "#4a3020" },
};

const DAY_HEADERS = ["L", "M", "M", "J", "V", "S", "D"];

function getSeasonYear(): { startYear: number; endYear: number } {
    const now = new Date();
    const month = now.getMonth(); // 0-based
    // Season starts in September (month 8)
    if (month >= 8) {
        return { startYear: now.getFullYear(), endYear: now.getFullYear() + 1 };
    }
    return { startYear: now.getFullYear() - 1, endYear: now.getFullYear() };
}

function getMonthData(monthName: string, seasonStart: number, seasonEnd: number) {
    const monthIndex = MONTH_NAMES.indexOf(monthName);
    // Sept=0 → actual month 8, Oct=1 → 9, ... Dec=3 → 11, Jan=4 → 0, ...
    const actualMonth = (monthIndex + 8) % 12;
    const year = monthIndex < 4 ? seasonStart : seasonEnd;

    const firstDay = new Date(year, actualMonth, 1);
    const daysInMonth = new Date(year, actualMonth + 1, 0).getDate();

    // Monday = 0, Sunday = 6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    return { year, actualMonth, daysInMonth, startDayOfWeek };
}

function isSameDay(d1: Date, d2Year: number, d2Month: number, d2Day: number): boolean {
    return (
        d1.getFullYear() === d2Year &&
        d1.getMonth() === d2Month &&
        d1.getDate() === d2Day
    );
}

export default function SeasonCalendar({ events }: Props) {
    const [open, setOpen] = useState(false);
    const { startYear, endYear } = getSeasonYear();

    // Parse events into Date objects
    const parsedEvents = events.map((e) => ({
        ...e,
        date: new Date(e.eventDate),
    }));

    // Find events for a specific day
    function getEventsForDay(year: number, month: number, day: number) {
        return parsedEvents.filter((e) => isSameDay(e.date, year, month, day));
    }

    const seasonLabel = `Saison ${startYear}-${endYear}`;

    if (!open) {
        return (
            <button
                className={styles.widgetButton}
                onClick={() => setOpen(true)}
                title="Calendrier de la saison"
                aria-label="Ouvrir le calendrier de la saison"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.widgetIcon}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className={styles.widgetLabel}>Calendrier</span>
            </button>
        );
    }

    return (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.seasonTitle}>{seasonLabel}</h2>
                    <button
                        className={styles.closeButton}
                        onClick={() => setOpen(false)}
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.monthsGrid}>
                    {MONTH_NAMES.map((monthName) => {
                        const theme = MONTH_THEMES[monthName];
                        const { year, actualMonth, daysInMonth, startDayOfWeek } =
                            getMonthData(monthName, startYear, endYear);

                        // Build calendar cells
                        const cells: (number | null)[] = [];
                        for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
                        for (let d = 1; d <= daysInMonth; d++) cells.push(d);

                        // Today
                        const today = new Date();
                        const isCurrentMonth =
                            today.getFullYear() === year && today.getMonth() === actualMonth;
                        const todayDate = today.getDate();

                        return (
                            <div
                                key={monthName}
                                className={styles.monthCard}
                                style={{
                                    backgroundColor: theme.bg,
                                    color: theme.text,
                                }}
                            >
                                <h3 className={styles.monthName}>{monthName}</h3>
                                <div className={styles.dayHeaders}>
                                    {DAY_HEADERS.map((d, i) => (
                                        <span
                                            key={i}
                                            className={`${styles.dayHeader} ${i >= 5 ? styles.weekend : ""}`}
                                        >
                                            {d}
                                        </span>
                                    ))}
                                </div>
                                <div className={styles.daysGrid}>
                                    {cells.map((day, i) => {
                                        if (day === null) {
                                            return <span key={i} className={styles.emptyCell} />;
                                        }

                                        const dayOfWeek = (startDayOfWeek + day - 1) % 7;
                                        const isWeekend = dayOfWeek >= 5;
                                        const isToday = isCurrentMonth && day === todayDate;
                                        const dayEvents = getEventsForDay(year, actualMonth, day);
                                        const hasEvent = dayEvents.length > 0;

                                        return (
                                            <span
                                                key={i}
                                                className={`${styles.dayCell} ${isWeekend ? styles.weekendDay : ""} ${isToday ? styles.today : ""} ${hasEvent ? styles.eventDay : ""}`}
                                                title={
                                                    hasEvent
                                                        ? dayEvents.map((e) => e.title).join(", ")
                                                        : undefined
                                                }
                                            >
                                                {day}
                                                {hasEvent && (
                                                    <span className={styles.eventDot} />
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>

                                {/* Event labels for this month */}
                                {(() => {
                                    const monthEvents = parsedEvents.filter(
                                        (e) =>
                                            e.date.getFullYear() === year &&
                                            e.date.getMonth() === actualMonth,
                                    );
                                    if (monthEvents.length === 0) return null;
                                    return (
                                        <div className={styles.monthEvents}>
                                            {monthEvents.map((e) => (
                                                <span key={e.id} className={styles.eventLabel}>
                                                    {e.date.getDate()} - {e.title}
                                                </span>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
