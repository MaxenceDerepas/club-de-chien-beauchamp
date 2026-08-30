"use client";

import { useState } from "react";
import EventCard, {
    type EventCardData,
    type EventCardMemberInfo,
} from "./EventCard";
import type { MemberLevel } from "@/lib/levels";
import styles from "./event-carousel.module.css";

type Props = {
    events: EventCardData[];
    currentMemberId: string;
    currentMemberLevel: MemberLevel;
    memberInfoById: Record<string, EventCardMemberInfo>;
    preregisterAction: (formData: FormData) => void | Promise<void>;
};

export default function EventCarousel({
    events,
    currentMemberId,
    currentMemberLevel,
    memberInfoById,
    preregisterAction,
}: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (events.length === 0) return null;

    // Un seul événement : affichage normal
    if (events.length === 1) {
        return (
            <EventCard
                event={events[0]}
                currentMemberId={currentMemberId}
                currentMemberLevel={currentMemberLevel}
                memberInfoById={memberInfoById}
                preregisterAction={preregisterAction}
            />
        );
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

            <EventCard
                key={events[currentIndex].id}
                event={events[currentIndex]}
                currentMemberId={currentMemberId}
                currentMemberLevel={currentMemberLevel}
                memberInfoById={memberInfoById}
                preregisterAction={preregisterAction}
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
