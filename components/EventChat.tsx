"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./event-chat.module.css";

type Message = {
    _id: string;
    eventId: string;
    senderId: string;
    senderName: string;
    senderRole: "member" | "admin";
    text: string;
    createdAt: string;
};

type Props = {
    eventId: string;
    currentUserId: string;
};

const POLL_INTERVAL = 5000;

function formatTime(iso: string) {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatDate(iso: string) {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
    }).format(date);
}

function groupByDate(messages: Message[]) {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";

    for (const msg of messages) {
        const d = formatDate(msg.createdAt);
        if (d !== currentDate) {
            currentDate = d;
            groups.push({ date: d, messages: [] });
        }
        groups[groups.length - 1].messages.push(msg);
    }

    return groups;
}

export default function EventChat({ eventId, currentUserId }: Props) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [unread, setUnread] = useState(0);
    const messagesAreaRef = useRef<HTMLDivElement>(null);
    const lastMessageCount = useRef(0);
    const justOpenedRef = useRef(false);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/chat/${eventId}`);
            if (!res.ok) return;
            const data = await res.json();
            const msgs: Message[] = data.messages || [];
            setMessages(msgs);

            if (!open && msgs.length > lastMessageCount.current) {
                setUnread((prev) => prev + (msgs.length - lastMessageCount.current));
            }
            lastMessageCount.current = msgs.length;
        } catch {
            /* silently retry on next poll */
        }
    }, [eventId, open]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    // When opening the panel, remember to scroll the messages container
    // to the bottom on the next render (not the whole page).
    useEffect(() => {
        if (open) {
            justOpenedRef.current = true;
            setUnread(0);
        }
    }, [open]);

    // Scroll only the internal messages container, never the page.
    // Scroll on: open, or when a NEW message arrives while the user
    // is already near the bottom (so we don't yank them around).
    useEffect(() => {
        if (!open) return;
        const el = messagesAreaRef.current;
        if (!el) return;

        const shouldScroll =
            justOpenedRef.current ||
            el.scrollHeight - el.scrollTop - el.clientHeight < 80;

        if (shouldScroll) {
            el.scrollTop = el.scrollHeight;
        }
        justOpenedRef.current = false;
    }, [open, messages]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        setSending(true);
        try {
            const res = await fetch(`/api/chat/${eventId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: trimmed }),
            });
            if (res.ok) {
                setText("");
                await fetchMessages();
            }
        } catch {
            /* ignore */
        } finally {
            setSending(false);
        }
    }

    const groups = groupByDate(messages);

    return (
        <div className={styles.chatContainer}>
            <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setOpen(!open)}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.chatIcon}
                >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Discussion</span>
                {unread > 0 && (
                    <span className={styles.unreadBadge}>{unread}</span>
                )}
            </button>

            {open && (
                <div className={styles.chatPanel}>
                    <div className={styles.chatHeader}>
                        <span className={styles.chatHeaderTitle}>
                            <span className={styles.chatHeaderDot} />
                            Discussion
                        </span>
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={() => setOpen(false)}
                            aria-label="Fermer"
                        >
                            ✕
                        </button>
                    </div>

                    <div
                        className={styles.messagesArea}
                        ref={messagesAreaRef}
                    >
                        {messages.length === 0 ? (
                            <div className={styles.emptyState}>
                                Aucun message pour le moment. Lancez la
                                conversation !
                            </div>
                        ) : (
                            groups.map((group) => (
                                <div key={group.date}>
                                    <div className={styles.dateSeparator}>
                                        <span>{group.date}</span>
                                    </div>
                                    {group.messages.map((msg) => {
                                        const isMine =
                                            msg.senderId === currentUserId;
                                        return (
                                            <div
                                                key={msg._id}
                                                className={`${styles.message} ${
                                                    isMine
                                                        ? styles.messageMine
                                                        : styles.messageOther
                                                } ${
                                                    msg.senderRole === "admin"
                                                        ? styles.messageAdmin
                                                        : ""
                                                }`}
                                            >
                                                {!isMine && (
                                                    <div
                                                        className={
                                                            styles.senderName
                                                        }
                                                    >
                                                        {msg.senderName}
                                                        {msg.senderRole ===
                                                            "admin" && (
                                                            <span
                                                                className={
                                                                    styles.adminTag
                                                                }
                                                            >
                                                                ÉQUIPE
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <div
                                                    className={
                                                        styles.messageBubble
                                                    }
                                                >
                                                    {msg.text}
                                                </div>
                                                <div
                                                    className={
                                                        styles.messageTime
                                                    }
                                                >
                                                    {formatTime(msg.createdAt)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    <p className={styles.chatReminder}>
                        Merci de garder un ton respectueux et bienveillant
                        envers tous les membres.
                    </p>
                    <form
                        className={styles.inputArea}
                        onSubmit={handleSend}
                    >
                        <input
                            type="text"
                            className={styles.chatInput}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Votre message..."
                            maxLength={2000}
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            className={styles.sendButton}
                            disabled={!text.trim() || sending}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className={styles.sendIcon}
                            >
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
