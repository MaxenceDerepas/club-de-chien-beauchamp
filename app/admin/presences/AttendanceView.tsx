"use client";

import { useState, useMemo, useTransition } from "react";
import type { MemberLevel } from "@/lib/levels";
import { MEMBER_LEVELS } from "@/lib/levels";
import type { AttendanceSourceType } from "@/lib/attendance";
import { saveAttendanceAction, searchAttendanceAction } from "./actions";
import type { PastSession } from "./page";
import styles from "./presences.module.css";

// ── Types ─────────────────────────────────────────────────────────

type AllMember = {
    id: string;
    name: string;
    dogName: string;
    level: string;
    active: boolean;
};

type GuestDog = { name: string; ownerName: string };

type Props = {
    pastSessions: PastSession[];
    allMembers: AllMember[];
    memberInfoById: Record<string, { level: string; dogName: string }>;
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

const LEVEL_LABELS: Record<MemberLevel, string> = {
    chiot: "Chiot",
    premier_cours: "Premier cours",
    ruban_violet: "Ruban violet",
    ruban_bleu: "Ruban bleu",
    ruban_blanc: "Ruban blanc",
    ruban_rouge: "Ruban rouge",
    ruban_noir: "Ruban noir",
    equipe: "Équipe",
};

const SOURCE_LABELS: Record<AttendanceSourceType, string> = {
    event: "Événement",
    parcours: "Parcours de santé",
    obeissance: "Obéissance",
};

type FilterType = "all" | AttendanceSourceType;

// ── Helpers ───────────────────────────────────────────────────────

function formatDateDisplay(iso: string) {
    const d = new Date(iso);
    return `${d.getUTCDate()} ${new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(d)}`;
}

// ── Component ─────────────────────────────────────────────────────

export default function AttendanceView({
    pastSessions,
    allMembers,
    memberInfoById,
}: Props) {
    const [tab, setTab] = useState<"saisie" | "recherche">("saisie");

    // ── Saisie state ──────────────────────────────────────────────
    const [filter, setFilter] = useState<FilterType>("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const [guests, setGuests] = useState<GuestDog[]>([]);
    const [guestName, setGuestName] = useState("");
    const [guestOwner, setGuestOwner] = useState("");
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    // ── Search state ──────────────────────────────────────────────
    const [searchMemberId, setSearchMemberId] = useState("");
    const [searchFrom, setSearchFrom] = useState("");
    const [searchTo, setSearchTo] = useState("");
    const [searchSourceType, setSearchSourceType] = useState<FilterType>("all");
    const [searchResult, setSearchResult] = useState<{
        sessions: { date: string; sourceType: string; sessionLabel: string }[];
        totalSessions: number;
        presentCount: number;
        rate: number;
    } | null>(null);
    const [isSearching, startSearchTransition] = useTransition();

    // ── Filtered sessions ─────────────────────────────────────────
    const filteredSessions = useMemo(
        () =>
            filter === "all"
                ? pastSessions
                : pastSessions.filter((s) => s.sourceType === filter),
        [pastSessions, filter],
    );

    // ── Selected session ──────────────────────────────────────────
    const selectedSession = useMemo(
        () => (selectedId ? pastSessions.find((s) => `${s.sourceType}:${s.sourceId}` === selectedId) : null),
        [pastSessions, selectedId],
    );

    // ── Members grouped by level for selected session ─────────────
    const membersByLevel = useMemo(() => {
        if (!selectedSession) return [];
        const registeredIds = new Set(selectedSession.registeredMembers.map((r) => r.memberId));
        const groups: {
            level: MemberLevel;
            label: string;
            color: string;
            members: { id: string; name: string; dogName: string }[];
        }[] = [];

        for (const level of MEMBER_LEVELS) {
            const members: { id: string; name: string; dogName: string }[] = [];
            for (const reg of selectedSession.registeredMembers) {
                const info = memberInfoById[reg.memberId];
                const memberLevel = (info?.level || "chiot") as MemberLevel;
                if (memberLevel === level) {
                    members.push({
                        id: reg.memberId,
                        name: reg.memberName,
                        dogName: info?.dogName || "",
                    });
                }
            }
            if (members.length > 0) {
                groups.push({
                    level,
                    label: LEVEL_LABELS[level],
                    color: LEVEL_COLORS[level],
                    members,
                });
            }
        }
        return groups;
    }, [selectedSession, memberInfoById]);

    // ── Summary ───────────────────────────────────────────────────
    const summary = useMemo(() => {
        if (!selectedSession) return [];
        const groups: { level: MemberLevel; label: string; color: string; count: number }[] = [];
        for (const level of MEMBER_LEVELS) {
            let count = 0;
            for (const reg of selectedSession.registeredMembers) {
                const info = memberInfoById[reg.memberId];
                if (((info?.level || "chiot") as MemberLevel) === level && checkedIds.has(reg.memberId)) {
                    count++;
                }
            }
            if (count > 0) {
                groups.push({ level, label: LEVEL_LABELS[level], color: LEVEL_COLORS[level], count });
            }
        }
        return groups;
    }, [selectedSession, memberInfoById, checkedIds]);

    const totalPresent = checkedIds.size + guests.length;

    // ── Select a session ──────────────────────────────────────────
    function selectSession(session: PastSession) {
        const key = `${session.sourceType}:${session.sourceId}`;
        if (key === selectedId) {
            setSelectedId(null);
            return;
        }
        setSelectedId(key);
        setSaved(false);

        if (session.attendanceFilled) {
            setCheckedIds(new Set(session.presentMembers.map((m) => m.memberId)));
            setGuests(session.guestDogs.map((g) => ({ ...g })));
        } else {
            // Pre-check all registered members
            setCheckedIds(new Set(session.registeredMembers.map((r) => r.memberId)));
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
        if (!selectedSession) return;

        const presentMembers = selectedSession.registeredMembers
            .filter((r) => checkedIds.has(r.memberId))
            .map((r) => {
                const info = memberInfoById[r.memberId];
                return {
                    memberId: r.memberId,
                    memberName: r.memberName,
                    level: (info?.level || "chiot") as MemberLevel,
                };
            });

        const fd = new FormData();
        fd.set("sourceType", selectedSession.sourceType);
        fd.set("sourceId", selectedSession.sourceId);
        fd.set("sessionLabel", selectedSession.sessionLabel);
        fd.set("sessionDate", selectedSession.sessionDate);
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
            const st = searchSourceType === "all" ? undefined : (searchSourceType as AttendanceSourceType);
            const result = await searchAttendanceAction(searchMemberId, searchFrom, searchTo, st);
            setSearchResult(result);
        });
    }

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
                    {/* Session list */}
                    <div className={styles.card}>
                        <div className={styles.formHeader}>
                            <h2 className={styles.formTitle}>Séances passées</h2>
                        </div>

                        {/* Filter bar */}
                        <div className={styles.filterBar}>
                            {(["all", "parcours", "obeissance", "event"] as FilterType[]).map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
                                    onClick={() => { setFilter(f); setSelectedId(null); }}
                                >
                                    {f === "all" ? "Tout" : SOURCE_LABELS[f as AttendanceSourceType]}
                                </button>
                            ))}
                        </div>

                        {/* Session rows */}
                        {filteredSessions.length > 0 ? (
                            <div className={styles.sessionList}>
                                {filteredSessions.map((s) => {
                                    const key = `${s.sourceType}:${s.sourceId}`;
                                    const isSelected = key === selectedId;
                                    const count = s.attendanceFilled
                                        ? s.presentMembers.length + s.guestDogs.length
                                        : null;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`${styles.sessionRow} ${isSelected ? styles.sessionRowSelected : ""} ${s.attendanceFilled ? styles.sessionRowFilled : ""}`}
                                            onClick={() => selectSession(s)}
                                        >
                                            <div className={styles.sessionInfo}>
                                                <span className={styles.sessionLabel}>{s.sessionLabel}</span>
                                                <span className={styles.sessionType}>
                                                    {SOURCE_LABELS[s.sourceType]}
                                                </span>
                                            </div>
                                            <span className={`${styles.sessionStatus} ${s.attendanceFilled ? styles.statusFilled : styles.statusEmpty}`}>
                                                {s.attendanceFilled
                                                    ? `${count} présent${count! > 1 ? "s" : ""}`
                                                    : "À saisir"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className={styles.noSessions}>Aucune séance passée pour ce filtre.</p>
                        )}
                    </div>

                    {/* Attendance form */}
                    {selectedSession && (
                        <div className={styles.card} style={{ marginTop: 20 }}>
                            <div className={styles.formHeader}>
                                <h2 className={styles.formTitle}>{selectedSession.sessionLabel}</h2>
                                <div className={styles.totalBadge}>
                                    {totalPresent} présent{totalPresent > 1 ? "s" : ""}
                                </div>
                            </div>

                            {membersByLevel.length === 0 && (
                                <p className={styles.noSessions}>Aucun inscrit pour cette séance.</p>
                            )}

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
                                            <span className={styles.levelLabel}>{group.label}</span>
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
                                            {group.members.map((m) => {
                                                const isObeissance = selectedSession?.sourceType === "obeissance";
                                                return (
                                                    <label key={m.id} className={styles.memberRow}>
                                                        <input
                                                            type="checkbox"
                                                            checked={checkedIds.has(m.id)}
                                                            onChange={() => toggleMember(m.id)}
                                                            className={styles.checkbox}
                                                        />
                                                        {isObeissance ? (
                                                            <>
                                                                <span className={styles.memberName}>
                                                                    {m.dogName || m.name}
                                                                </span>
                                                                {m.dogName && (
                                                                    <span className={styles.memberDog}>({m.name})</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className={styles.memberName}>{m.name}</span>
                                                                {m.dogName && (
                                                                    <span className={styles.memberDog}>({m.dogName})</span>
                                                                )}
                                                            </>
                                                        )}
                                                    </label>
                                                );
                                            })}
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
                                {saved && <span className={styles.savedMsg}>Enregistré !</span>}
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
                            <label className={styles.searchLabel}>Type</label>
                            <select
                                value={searchSourceType}
                                onChange={(e) => { setSearchSourceType(e.target.value as FilterType); setSearchResult(null); }}
                                className={styles.searchSelect}
                            >
                                <option value="all">Toutes les activités</option>
                                <option value="parcours">Parcours de santé</option>
                                <option value="obeissance">Obéissance</option>
                                <option value="event">Événement</option>
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
                                    <span className={styles.searchStatNumber}>{searchResult.totalSessions}</span>
                                    <span className={styles.searchStatLabel}>séances possibles</span>
                                </div>
                                <div className={`${styles.searchStat} ${styles.searchStatHighlight}`}>
                                    <span className={styles.searchStatNumber}>{searchResult.rate}%</span>
                                    <span className={styles.searchStatLabel}>taux de participation</span>
                                </div>
                            </div>

                            {searchResult.sessions.length > 0 && (
                                <div className={styles.searchDates}>
                                    <h4 className={styles.searchDatesTitle}>Détail des présences</h4>
                                    <div className={styles.searchDatesList}>
                                        {searchResult.sessions.map((s, i) => (
                                            <span key={i} className={styles.searchDateTag}>
                                                {SOURCE_LABELS[s.sourceType as AttendanceSourceType] || s.sourceType} — {formatDateDisplay(s.date)}
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
