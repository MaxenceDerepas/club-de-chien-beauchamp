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
    isAdmin?: boolean;
};

export default function EventCarousel({
    events,
    currentMemberId,
    currentMemberLevel,
    memberInfoById,
    preregisterAction,
    isAdmin,
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
                isAdmin={isAdmin}
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
            <EventCard
                key={events[currentIndex].id}
                event={events[currentIndex]}
                currentMemberId={currentMemberId}
                currentMemberLevel={currentMemberLevel}
                memberInfoById={memberInfoById}
                preregisterAction={preregisterAction}
                isAdmin={isAdmin}
                navigation={{
                    current: currentIndex + 1,
                    total: events.length,
                    onPrev: () => goTo(currentIndex - 1),
                    onNext: () => goTo(currentIndex + 1),
                }}
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
