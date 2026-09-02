"use client";

import { useState } from "react";
import PublicEventCard, { type PublicEventData } from "./PublicEventCard";
import styles from "./public-event-carousel.module.css";

type Props = {
    events: PublicEventData[];
};

export default function PublicEventCarousel({ events }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (events.length === 0) return null;

    if (events.length === 1) {
        return <PublicEventCard event={events[0]} />;
    }

    const goTo = (index: number) => {
        if (index < 0) setCurrentIndex(events.length - 1);
        else if (index >= events.length) setCurrentIndex(0);
        else setCurrentIndex(index);
    };

    return (
        <div className={styles.carousel}>
            <div className={styles.nav}>
                <button
                    type="button"
                    className={styles.arrow}
                    onClick={() => goTo(currentIndex - 1)}
                    aria-label="Événement précédent"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <div className={styles.counter}>
                    {currentIndex + 1} / {events.length}
                </div>

                <button
                    type="button"
                    className={styles.arrow}
                    onClick={() => goTo(currentIndex + 1)}
                    aria-label="Événement suivant"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>

            <PublicEventCard
                key={events[currentIndex].id}
                event={events[currentIndex]}
            />

            <div className={styles.dots}>
                {events.map((e, i) => (
                    <button
                        key={e.id}
                        type="button"
                        className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ""}`}
                        onClick={() => setCurrentIndex(i)}
                        aria-label={`Événement ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
