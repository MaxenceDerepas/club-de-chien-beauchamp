"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./admin-notifications.module.css";

type Notification = {
    id: string;
    message: string;
    link: string;
    createdAt: string;
};

type Props = {
    notifications: Notification[];
    markReadAction: () => void | Promise<void>;
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
}

export default function AdminNotifications({
    notifications,
    markReadAction,
}: Props) {
    const [open, setOpen] = useState(false);
    const count = notifications.length;

    if (count === 0) return null;

    return (
        <div className={styles.wrapper}>
            <button
                type="button"
                className={styles.badge}
                onClick={() => setOpen(!open)}
                aria-label={`${count} notification${count > 1 ? "s" : ""}`}
            >
                🔔 {count} notification{count > 1 ? "s" : ""}
            </button>

            {open && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelTitle}>Notifications</span>
                        <form action={markReadAction}>
                            <button type="submit" className={styles.markRead}>
                                Tout marquer lu
                            </button>
                        </form>
                    </div>
                    <ul className={styles.list}>
                        {notifications.map((n) => (
                            <li key={n.id} className={styles.item}>
                                <Link href={n.link} className={styles.itemLink}>
                                    <span className={styles.itemMsg}>{n.message}</span>
                                    <span className={styles.itemTime}>
                                        {timeAgo(n.createdAt)}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
