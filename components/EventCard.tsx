"use client";

import { useState } from "react";
import { MEMBER_LEVELS, type MemberLevel } from "@/lib/levels";
import EventChat from "./EventChat";
import styles from "./event-card.module.css";

export type EventCardRegistration = {
    memberId: string;
    memberName: string;
    memberLevel?: MemberLevel;
    status: "pending" | "approved" | "rejected";
};

export type EventCardData = {
    id: string;
    title: string;
    eventDate: string | null;
    registrationDeadline: string | null;
    description: string;
    imageUrl?: string;
    minLevel: MemberLevel;
    maxParticipants: number;
    registrations: EventCardRegistration[];
};

export type EventCardMemberInfo = {
    dogName: string;
    dogPhotoUrl: string;
    level: MemberLevel;
    healthCourse: boolean;
    obedience: boolean;
};

type Props = {
    event: EventCardData;
    currentMemberId: string;
    currentMemberLevel: MemberLevel;
    memberInfoById: Record<string, EventCardMemberInfo>;
    preregisterAction: (formData: FormData) => void | Promise<void>;
};

const LEVEL_COLORS: Record<MemberLevel, string> = {
    chiot: "#f5d957",
    premier_cours: "#9ad84c",
    ruban_violet: "#b08fd6",
    ruban_bleu: "#11b7e5",
    ruban_blanc: "#e6e6e6",
    ruban_rouge: "#ef6b6b",
    ruban_noir: "#2b2b2b",
    equipe: "#e6b800",
};

function formatDate(iso: string | null) {
    if (!iso) return "";
    return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(iso));
}

function formatDeadline(
    registrationDeadlineIso: string | null,
    eventDateIso: string | null,
) {
    let target: Date | null = null;
    if (registrationDeadlineIso) {
        target = new Date(registrationDeadlineIso);
    } else if (eventDateIso) {
        const d = new Date(eventDateIso);
        d.setDate(d.getDate() - 13);
        target = d;
    }
    if (!target || Number.isNaN(target.getTime())) return null;
    return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(target);
}

export default function EventCard({
    event,
    currentMemberId,
    currentMemberLevel,
    memberInfoById,
    preregisterAction,
}: Props) {
    const memberCanRegister =
        MEMBER_LEVELS.indexOf(currentMemberLevel) >=
        MEMBER_LEVELS.indexOf(event.minLevel);
    const approved = event.registrations.filter((r) => r.status === "approved");
    const myRegistration = event.registrations.find(
        (r) => r.memberId === currentMemberId,
    );
    const isUnlimited = event.maxParticipants === 0;
    const slotCount = isUnlimited
        ? Math.max(25, approved.length)
        : event.maxParticipants;
    const slots = Array.from(
        { length: slotCount },
        (_, i) => approved[i] ?? null,
    );
    const deadline = formatDeadline(
        event.registrationDeadline,
        event.eventDate,
    );
    const [flipped, setFlipped] = useState(false);

    return (
        <div className={styles.wrapper}>
            {/* Sidebar — reste fixe */}
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>ÉVÈNEMENT</h2>
                <div className={styles.sidebarWave} />
                {flipped ? (
                    <>
                        <p className={styles.sidebarText}>
                            L&apos;équipe d&apos;éducation doit valider votre
                            inscription pour confirmer votre participation.
                        </p>
                        <p className={styles.sidebarText}>
                            Une fois faite, votre avatar apparaîtra sur la
                            liste (à droite).
                        </p>
                    </>
                ) : (
                    <p className={styles.sidebarText}>
                        Cliquez sur l&apos;affiche pour voir les détails et
                        vous inscrire.
                    </p>
                )}
            </aside>

            {/* Contenu — se retourne */}
            <div className={styles.flipContainer}>
                <div className={`${styles.flipInner} ${flipped ? styles.flipInnerFlipped : ""}`}>
                    {/* ===== FRONT — Affiche ===== */}
                    <div className={styles.flipFront}>
                        <div
                            className={styles.frontMain}
                            onClick={() => setFlipped(true)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setFlipped(true);
                                }
                            }}
                        >
                            <h3 className={styles.frontTitle}>{event.title}</h3>

                            {event.imageUrl ? (
                                <div className={styles.posterSection}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={event.imageUrl}
                                        alt={event.title}
                                        className={styles.posterImage}
                                    />
                                </div>
                            ) : (
                                <div className={styles.noPosterPlaceholder}>
                                    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={styles.noPosterIcon}>
                                        <rect x="8" y="8" width="48" height="48" rx="6" stroke="currentColor" strokeWidth="2" />
                                        <path d="M8 42l14-14 12 12 6-6 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="22" cy="24" r="5" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                            )}

                            {event.eventDate && (
                                <p className={styles.frontDate}>
                                    {formatDate(event.eventDate)}
                                </p>
                            )}

                            <span className={styles.flipHint}>
                                Cliquer pour voir les détails
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.flipHintIcon}>
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </span>
                        </div>
                    </div>

                    {/* ===== BACK — Détails / Inscriptions ===== */}
                    <div className={styles.flipBack}>
                        <div className={styles.main}>
                            <div className={styles.topSection}>
                                <button
                                    type="button"
                                    className={styles.backButton}
                                    onClick={() => setFlipped(false)}
                                >
                                    ← Retour à l&apos;affiche
                                </button>

                                <h3 className={styles.eventTitle}>{event.title}</h3>
                                {event.eventDate && (
                                    <p className={styles.eventDate}>
                                        {formatDate(event.eventDate)}
                                    </p>
                                )}

                                {myRegistration ? (
                                    <div
                                        className={`${styles.statusBadge} ${
                                            myRegistration.status === "approved"
                                                ? styles.statusApproved
                                                : myRegistration.status === "rejected"
                                                  ? styles.statusRejected
                                                  : styles.statusPending
                                        }`}
                                    >
                                        {myRegistration.status === "approved"
                                            ? "Validé(e)"
                                            : myRegistration.status === "rejected"
                                              ? "Non validé(e)"
                                              : "⏳ Préinscrit(e)"}
                                    </div>
                                ) : memberCanRegister ? (
                                    <form action={preregisterAction}>
                                        <input
                                            type="hidden"
                                            name="eventId"
                                            value={event.id}
                                        />
                                        <button
                                            type="submit"
                                            className={styles.registerButton}
                                        >
                                            Se préinscrire
                                        </button>
                                    </form>
                                ) : (
                                    <div className={styles.disabledBadge}>
                                        Inscription non disponible pour votre niveau
                                    </div>
                                )}

                                {deadline ? (
                                    <p className={styles.deadline}>
                                        Date de clôture des inscriptions : {deadline}.
                                    </p>
                                ) : null}
                            </div>

                            <div className={styles.slotsSection}>
                                <div className={styles.slotsGrid}>
                                    {slots.map((reg, idx) => {
                                        const info = reg
                                            ? memberInfoById[reg.memberId]
                                            : null;
                                        const dogName =
                                            info?.dogName || reg?.memberName || "";
                                        const levelColor =
                                            info?.level &&
                                            LEVEL_COLORS[info.level]
                                                ? LEVEL_COLORS[info.level]
                                                : "#ef6b6b";
                                        return (
                                            <div key={idx} className={styles.slot}>
                                                <span className={styles.slotNumber}>
                                                    {idx + 1})
                                                </span>
                                                {reg ? (
                                                    <div className={styles.slotAvatar}>
                                                        <span className={styles.slotName}>
                                                            {dogName}
                                                        </span>
                                                        <div className={styles.avatarWrap}>
                                                            {info?.dogPhotoUrl ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={info.dogPhotoUrl}
                                                                    alt={dogName}
                                                                    className={styles.avatarImg}
                                                                    style={{ borderColor: levelColor }}
                                                                />
                                                            ) : (
                                                                <span
                                                                    className={styles.avatarFallback}
                                                                    style={{ borderColor: levelColor }}
                                                                >
                                                                    {dogName.charAt(0).toUpperCase() || "?"}
                                                                </span>
                                                            )}
                                                            {info?.healthCourse && (
                                                                <span className={styles.tagHealth}>
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src="/images/Tag-Parcours-de-sante.png" alt="Parcours de santé" />
                                                                </span>
                                                            )}
                                                            {info?.obedience && (
                                                                <span className={styles.tagObedience}>
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src="/images/Tag-Obeissance.png" alt="Obéissance" />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {myRegistration?.status === "approved" ? (
                                <EventChat
                                    eventId={event.id}
                                    currentUserId={currentMemberId}
                                />
                            ) : (
                                <div className={styles.chatLocked}>
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <span>
                                        {myRegistration?.status === "pending"
                                            ? "La discussion sera disponible une fois votre inscription validée par l'équipe."
                                            : myRegistration?.status === "rejected"
                                              ? "La discussion n'est pas disponible : inscription non validée."
                                              : "La discussion est réservée aux adhérents inscrits et validés pour cet évènement."}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
