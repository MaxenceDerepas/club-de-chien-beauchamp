"use client";

import { useState } from "react";
import { adminAddMemberToEventAction } from "../actions";
import styles from "../evenements.module.css";

type MemberOption = {
    id: string;
    name: string;
    dogName: string;
    level: string;
};

type Props = {
    eventId: string;
    members: MemberOption[];
};

export default function AdminAddMember({ eventId, members }: Props) {
    const [selectedId, setSelectedId] = useState("");
    const [isPending, setIsPending] = useState(false);

    const selected = members.find((m) => m.id === selectedId);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selected) return;
        setIsPending(true);

        const fd = new FormData();
        fd.set("eventId", eventId);
        fd.set("memberId", selected.id);
        fd.set("memberName", selected.name);
        fd.set("memberLevel", selected.level);

        await adminAddMemberToEventAction(fd);
        setSelectedId("");
        setIsPending(false);
    }

    if (members.length === 0) return null;

    return (
        <div className={styles.addMemberSection}>
            <h3 className={styles.addMemberTitle}>Ajouter un adhérent</h3>
            <form onSubmit={handleSubmit} className={styles.addMemberForm}>
                <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className={styles.addMemberSelect}
                >
                    <option value="">— Choisir un adhérent —</option>
                    {members.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.dogName || m.name}
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    disabled={!selectedId || isPending}
                    className={styles.addMemberBtn}
                >
                    {isPending ? "Ajout…" : "+ Ajouter"}
                </button>
            </form>
        </div>
    );
}
