"use client";

import { useState } from "react";
import styles from "./public-event-card.module.css";

export type PublicEventData = {
    id: string;
    title: string;
    eventDate: string | null;
    description: string;
    imageUrl: string;
    location: string;
};

function formatDate(iso: string | null) {
    if (!iso) return "";
    return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(iso));
}

export default function PublicEventCard({ event }: { event: PublicEventData }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className={styles.card}>
            <div className={`${styles.inner} ${flipped ? styles.innerFlipped : ""}`}>
                {/* FRONT */}
                <div className={styles.front}>
                    <div
                        className={styles.frontContent}
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
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className={styles.poster}
                            />
                        ) : (
                            <div className={styles.noPoster}>
                                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={styles.noPosterIcon}>
                                    <rect x="8" y="8" width="48" height="48" rx="6" stroke="currentColor" strokeWidth="2" />
                                    <path d="M8 42l14-14 12 12 6-6 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="22" cy="24" r="5" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                        )}

                        {event.eventDate && (
                            <p className={styles.frontDate}>{formatDate(event.eventDate)}</p>
                        )}

                        <span className={styles.flipHint}>
                            Cliquer pour voir les détails
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.flipHintIcon}>
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </span>
                    </div>
                </div>

                {/* BACK */}
                <div className={styles.back}>
                    <div className={styles.backContent}>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => setFlipped(false)}
                        >
                            ← Retour
                        </button>

                        <h3 className={styles.backTitle}>{event.title}</h3>

                        {event.eventDate && (
                            <p className={styles.backDate}>{formatDate(event.eventDate)}</p>
                        )}

                        {event.location && (
                            <p className={styles.backLocation}>📍 {event.location}</p>
                        )}

                        {event.description && (
                            <p className={styles.backDescription}>{event.description}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
