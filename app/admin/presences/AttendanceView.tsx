"use client";

import { useState, useMemo, useTransition } from "react";
import type { MemberLevel } from "@/lib/levels";
import { MEMBER_LEVELS } from "@/lib/levels";
import { saveAttendanceAction, searchAttendanceAction } from "./actions";
import styles from "./presences.module.css";

// ── Types ─────────────────────────────────────────────────────────

type ActiveMember = {
    id: string;
    name: string;
    dogName: string;
    level: MemberLevel;
};

type AllMember = ActiveMember & { active: boolean };

type SessionData = {
    id: string;
    sessionDate: string;
    dayOfWeek: number;
    presentCount: number;
    guestCount: number;
    presentMembers: { memberId: string; memberName: string; level: MemberLevel }[];
    guestDogs: { name: string; ownerName: string }[];
};

type GuestDog = { name: string; ownerName: string };

type Props = {
    activeMembers: ActiveMember[];
    allMembers: AllMember[];
    sessions: SessionData[];
    levelLabels: Record<string, string>;
};

// ── Constants ─────────────────────────────────────────────────────

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

const MONTH_NAMES = [
    "JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN",
    "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE",
];

const DAY_LABELS: Record<number, string> = {
    0: "Dimanche",
    6: "Samedi",
};

// ── Helpers ───────────────────────────────────────────────────────

function getWeekendDatesOfMonth(year: number, month: number) {
    const dates: { date: Date; dayOfWeek: number }[] = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) {
        const dow = d.getDay();
        if (dow === 0 || dow === 6) {
            dates.push({ date: new Date(d), dayOfWeek: dow });
        }
        d.setDate(d.getDate() + 1);
    }
    return dates;
}

function dateKey(d: Date) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateDisplay(iso: string) {
    const d = new Date(iso);
    return `${d.getUTCDate()} ${new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(d)}`;
}

// ── Component ─────────────────────────────────────────────────────

export default function AttendanceView({
    activeMembers,
    allMembers,
    sessions,
    levelLabels,
}: Props) {
    const [tab, setTab] = useState<"saisie" | "recherche">("saisie");
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const [guests, setGuests] = useState<GuestDog[]>([]);
    const [guestName, setGuestName] = useState("");
    const [guestOwner, setGuestOwner] = useState("");
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    // Search state
    const [searchMemberId, setSearchMemberId] = useState("");
    const [searchFrom, setSearchFrom] = useState("");
    const [searchTo, setSearchTo] = useState("");
    const [searchResult, setSearchResult] = useState<{
        sessions: { date: string; dayOfWeek: number }[];
        totalWeekendDays: number;
        presentCount: number;
        rate: number;
    } | null>(null);
    const [isSearching, startSearchTransition] = useTransition();

    // Session lookup
    const sessionsByDateKey = useMemo(() => {
        const map = new Map<string, SessionData>();
        for (const s of sessions) {
            const d = new Date(s.sessionDate);
            map.set(`${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`, s);
        }
        return map;
    }, [sessions]);

    const weekendDates = useMemo(
        () => getWeekendDatesOfMonth(viewYear, viewMonth),
        [viewYear, viewMonth],
    );

    // Selected session data
    const selectedSession = selectedDate
        ? (() => {
              const d = new Date(selectedDate);
              return sessionsByDateKey.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
          })()
        : null;

    const selectedDow = selectedDate
        ? new Date(selectedDate).getDay()
        : null;

    // ── Calendar nav ──────────────────────────────────────────────

    function goPrev() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
        else setViewMonth(viewMonth - 1);
    }
    function goNext() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
        else setViewMonth(viewMonth + 1);
    }

    // ── Select a date ─────────────────────────────────────────────

    function selectDate(d: Date, dow: number) {
        const ds = formatDateStr(d);
        setSelectedDate(ds);
        setSaved(false);

        // Pre-fill from existing session if any
        const key = dateKey(d);
        const existing = sessionsByDateKey.get(key);
        if (existing) {
            setCheckedIds(new Set(existing.presentMembers.map((m) => m.memberId)));
            setGuests(existing.guestDogs);
        } else {
            setCheckedIds(new Set());
            setGuests([]);
        }
    }

    // ── Toggle member ─────────────────────────────────────────────

    function toggleMember(id: string) {
        setCheckedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        setSaved(false);
    }

    function toggleAll(memberIds: string[]) {
        setCheckedIds((prev) => {
            const allChecked = memberIds.every((id) => prev.has(id));
            const next = new Set(prev);
            for (const id of memberIds) {
                if (allChecked) next.delete(id);
                else next.add(id);
            }
            return next;
        });
        setSaved(false);
    }

    // ── Guests ────────────────────────────────────────────────────

    function addGuest() {
        if (!guestName.trim()) return;
        setGuests((prev) => [...prev, { name: guestName.trim(), ownerName: guestOwner.trim() }]);
        setGuestName("");
        setGuestOwner("");
        setSaved(false);
    }

    function removeGuest(idx: number) {
        setGuests((prev) => prev.filter((_, i) => i !== idx));
        setSaved(false);
    }

    // ── Save ──────────────────────────────────────────────────────

    function handleSave() {
        if (!selectedDate) return;
        const presentMembers = activeMembers
            .filter((m) => checkedIds.has(m.id))
            .map((m) => ({ memberId: m.id, memberName: m.name, level: m.level }));

        const fd = new FormData();
        fd.set("date", selectedDate);
        fd.set("dayOfWeek", String(selectedDow));
        fd.set("presentMembers", JSON.stringify(presentMembers));
        fd.set("guestDogs", JSON.stringify(guests));

        startTransition(async () => {
            await saveAttendanceAction(fd);
            setSaved(true);
        });
    }

    // ── Search ────────────────────────────────────────────────────

    function handleSearch() {
        if (!searchMemberId || !searchFrom || !searchTo) return;
        startSearchTransition(async () => {
            const result = await searchAttendanceAction(searchMemberId, searchFrom, searchTo);
            setSearchResult(result);
        });
    }

    // ── Group by level ────────────────────────────────────────────

    const membersByLevel = useMemo(() => {
        const groups: { level: MemberLevel; label: string; color: string; members: ActiveMember[] }[] = [];
        for (const level of MEMBER_LEVELS) {
            const members = activeMembers.filter((m) => m.level === level);
            if (members.length > 0) {
                groups.push({
                    level,
                    label: levelLabels[level] || level,
                    color: LEVEL_COLORS[level],
                    members,
                });
            }
        }
        return groups;
    }, [activeMembers, levelLabels]);

    // Summary of checked members by level
    const summary = useMemo(() => {
        const groups: { level: MemberLevel; label: string; color: string; count: number }[] = [];
        for (const level of MEMBER_LEVELS) {
            const count = activeMembers.filter((m) => m.level === level && checkedIds.has(m.id)).length;
            if (count > 0) {
                groups.push({
                    level,
                    label: levelLabels[level] || level,
                    color: LEVEL_COLORS[level],
                    count,
                });
            }
        }
        return groups;
    }, [activeMembers, checkedIds, levelLabels]);

    const totalPresent = checkedIds.size + guests.length;

    // ── Render ────────────────────────────────────────────────────

    return (
        <>
            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    type="button"
                    className={`${styles.tab} ${tab === "saisie" ? styles.tabActive : ""}`}
                    onClick={() => setTab("saisie")}
                >
                    Saisie des présences
                </button>
                <button
                    type="button"
                    className={`${styles.tab} ${tab === "recherche" ? styles.tabActive : ""}`}
                    onClick={() => setTab("recherche")}
                >
                    Recherche
                </button>
            </div>

            {tab === "saisie" && (
                <>
                    {/* Calendar */}
                    <div className={styles.card}>
                        <div className={styles.monthHeader}>
                            <button type="button" onClick={goPrev} className={styles.navArrow}>←</button>
                            <h3 className={styles.monthTitle}>{MONTH_NAMES[viewMonth]} {viewYear}</h3>
                            <button type="button" onClick={goNext} className={styles.navArrow}>→</button>
                        </div>

                        <div className={styles.calendarGrid}>
                            {weekendDates.map((wd) => {
                                const key = dateKey(wd.date);
                                const session = sessionsByDateKey.get(key);
                                const ds = formatDateStr(wd.date);
                                const isSelected = ds === selectedDate;
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`${styles.calendarCell} ${isSelected ? styles.calendarCellSelected : ""} ${session ? styles.calendarCellFilled : ""}`}
                                        onClick={() => selectDate(wd.date, wd.dayOfWeek)}
                                    >
                                        <span className={styles.calendarCellDay}>
                                            {DAY_LABELS[wd.dayOfWeek]}
                                        </span>
                                        <span className={styles.calendarCellDate}>
                                            {wd.date.getDate()}
                                        </span>
                                        {session && (
                                            <span className={styles.calendarCellCount}>
                                                {session.presentCount + session.guestCount} présent{(session.presentCount + session.guestCount) > 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Attendance form */}
                    {selectedDate && (
                        <div className={styles.card} style={{ marginTop: 20 }}>
                            <div className={styles.formHeader}>
                                <h2 className={styles.formTitle}>
                                    {DAY_LABELS[selectedDow!]} {new Date(selectedDate).getDate()}{" "}
                                    {new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(selectedDate))}
                                </h2>
                                <div className={styles.totalBadge}>
                                    {totalPresent} présent{totalPresent > 1 ? "s" : ""}
                                </div>
                            </div>

                            {/* Members by level */}
                            {membersByLevel.map((group) => {
                                const groupIds = group.members.map((m) => m.id);
                                const checkedCount = group.members.filter((m) => checkedIds.has(m.id)).length;
                                const allGroupChecked = checkedCount === group.members.length;

                                return (
                                    <div key={group.level} className={styles.levelGroup}>
                                        <div className={styles.levelHeader}>
                                            <span
                                                className={styles.levelDot}
                                                style={{ background: group.color }}
                                            />
                                            <span className={styles.levelLabel}>
                                                {group.label}
                                            </span>
                                            <span className={styles.levelCount}>
                                                {checkedCount}/{group.members.length}
                                            </span>
                                            <button
                                                type="button"
                                                className={styles.selectAllBtn}
                                                onClick={() => toggleAll(groupIds)}
                                            >
                                                {allGroupChecked ? "Tout décocher" : "Tout cocher"}
                                            </button>
                                        </div>
                                        <div className={styles.membersList}>
                                            {group.members.map((m) => (
                                                <label key={m.id} className={styles.memberRow}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedIds.has(m.id)}
                                                        onChange={() => toggleMember(m.id)}
                                                        className={styles.checkbox}
                                                    />
                                                    <span className={styles.memberName}>
                                                        {m.name}
                                                    </span>
                                                    {m.dogName && (
                                                        <span className={styles.memberDog}>
                                                            ({m.dogName})
                                                        </span>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Guest dogs */}
                            <div className={styles.guestSection}>
                                <h3 className={styles.guestTitle}>Chiens invités</h3>
                                {guests.length > 0 && (
                                    <div className={styles.guestList}>
                                        {guests.map((g, i) => (
                                            <div key={i} className={styles.guestRow}>
                                                <span className={styles.guestInfo}>
                                                    {g.name}{g.ownerName ? ` (${g.ownerName})` : ""}
                                                </span>
                                                <button
                                                    type="button"
                                                    className={styles.guestRemove}
                                                    onClick={() => removeGuest(i)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className={styles.guestForm}>
                                    <input
                                        type="text"
                                        placeholder="Nom du chien"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className={styles.guestInput}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Propriétaire"
                                        value={guestOwner}
                                        onChange={(e) => setGuestOwner(e.target.value)}
                                        className={styles.guestInput}
                                    />
                                    <button
                                        type="button"
                                        className={styles.guestAddBtn}
                                        onClick={addGuest}
                                    >
                                        + Ajouter
                                    </button>
                                </div>
                            </div>

                            {/* Summary */}
                            {totalPresent > 0 && (
                                <div className={styles.summary}>
                                    <h3 className={styles.summaryTitle}>Récapitulatif</h3>
                                    <div className={styles.summaryBars}>
                                        {summary.map((s) => (
                                            <div key={s.level} className={styles.summaryRow}>
                                                <span
                                                    className={styles.summaryDot}
                                                    style={{ background: s.color }}
                                                />
                                                <span className={styles.summaryLabel}>{s.label}</span>
                                                <span className={styles.summaryCount}>{s.count}</span>
                                            </div>
                                        ))}
                                        {guests.length > 0 && (
                                            <div className={styles.summaryRow}>
                                                <span className={styles.summaryDot} style={{ background: "#aaa" }} />
                                                <span className={styles.summaryLabel}>Invités</span>
                                                <span className={styles.summaryCount}>{guests.length}</span>
                                            </div>
                                        )}
                                        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                            <span className={styles.summaryLabel}>Total</span>
                                            <span className={styles.summaryCount}>{totalPresent}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save */}
                            <div className={styles.saveBar}>
                                {saved && (
                                    <span className={styles.savedMsg}>Enregistré !</span>
                                )}
                                <button
                                    type="button"
                                    className={styles.saveBtn}
                                    onClick={handleSave}
                                    disabled={isPending}
                                >
                                    {isPending ? "Enregistrement…" : "Enregistrer la présence"}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {tab === "recherche" && (
                <div className={styles.card}>
                    <h2 className={styles.formTitle}>Recherche de présence</h2>
                    <p className={styles.searchDesc}>
                        Sélectionnez un adhérent et une période pour connaître son taux de participation.
                    </p>

                    <div className={styles.searchForm}>
                        <div className={styles.searchField}>
                            <label className={styles.searchLabel}>Adhérent</label>
                            <select
                                value={searchMemberId}
                                onChange={(e) => { setSearchMemberId(e.target.value); setSearchResult(null); }}
                                className={styles.searchSelect}
                            >
                                <option value="">— Choisir —</option>
                                {allMembers.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}{m.dogName ? ` (${m.dogName})` : ""}{!m.active ? " [inactif]" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.searchField}>
                            <label className={styles.searchLabel}>Du</label>
                            <input
                                type="date"
                                value={searchFrom}
                                onChange={(e) => { setSearchFrom(e.target.value); setSearchResult(null); }}
                                className={styles.searchInput}
                            />
                        </div>
                        <div className={styles.searchField}>
                            <label className={styles.searchLabel}>Au</label>
                            <input
                                type="date"
                                value={searchTo}
                                onChange={(e) => { setSearchTo(e.target.value); setSearchResult(null); }}
                                className={styles.searchInput}
                            />
                        </div>
                        <button
                            type="button"
                            className={styles.searchBtn}
                            onClick={handleSearch}
                            disabled={isSearching || !searchMemberId || !searchFrom || !searchTo}
                        >
                            {isSearching ? "Recherche…" : "Rechercher"}
                        </button>
                    </div>

                    {searchResult && (
                        <div className={styles.searchResults}>
                            <div className={styles.searchStats}>
                                <div className={styles.searchStat}>
                                    <span className={styles.searchStatNumber}>{searchResult.presentCount}</span>
                                    <span className={styles.searchStatLabel}>séances présentes</span>
                                </div>
                                <div className={styles.searchStat}>
                                    <span className={styles.searchStatNumber}>{searchResult.totalWeekendDays}</span>
                                    <span className={styles.searchStatLabel}>séances possibles</span>
                                </div>
                                <div className={`${styles.searchStat} ${styles.searchStatHighlight}`}>
                                    <span className={styles.searchStatNumber}>{searchResult.rate}%</span>
                                    <span className={styles.searchStatLabel}>taux de participation</span>
                                </div>
                            </div>

                            {searchResult.sessions.length > 0 && (
                                <div className={styles.searchDates}>
                                    <h4 className={styles.searchDatesTitle}>Dates de présence</h4>
                                    <div className={styles.searchDatesList}>
                                        {searchResult.sessions.map((s) => (
                                            <span key={s.date} className={styles.searchDateTag}>
                                                {DAY_LABELS[s.dayOfWeek]} {formatDateDisplay(s.date)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {searchResult.sessions.length === 0 && (
                                <p className={styles.searchEmpty}>
                                    Aucune présence enregistrée sur cette période.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
