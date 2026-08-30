"use client";

import { useState } from "react";
import styles from "./admin.module.css";

type Props = {
    initialText: string;
    initialEnabled: boolean;
    apiEndpoint?: string;
    title?: string;
    description?: string;
    checkboxLabel?: string;
    placeholder?: string;
};

export default function AnnouncementEditor({
    initialText,
    initialEnabled,
    apiEndpoint = "/api/admin/announcement",
    title = "Annonce d'accueil",
    description = "Ce message s'affiche sur la page d'accueil lorsqu'il est activé.",
    checkboxLabel = "Afficher l'annonce sur la page d'accueil",
    placeholder = "Exemple : Les cours du samedi 23 mars sont annulés.",
}: Props) {
    const [text, setText] = useState(initialText);
    const [enabled, setEnabled] = useState(initialEnabled);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    async function handleSave() {
        try {
            setSaving(true);
            setMessage("");
            setIsError(false);

            const res = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text, enabled }),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.error || "Erreur lors de la sauvegarde.");
            }

            setMessage("Annonce enregistrée avec succès.");
            setIsError(false);
        } catch (error: any) {
            setMessage(error?.message || "Impossible d’enregistrer l’annonce.");
            setIsError(true);
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{title}</h2>
            <p className={styles.text}>
                {description}
            </p>

            <div className={styles.editorBlock}>
                <label htmlFor="announcementText" className={styles.label}>
                    Texte de l’annonce
                </label>

                <textarea
                    id="announcementText"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    className={styles.textarea}
                    placeholder={placeholder}
                />
            </div>

            <label className={styles.checkboxRow}>
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                />
                {checkboxLabel}
            </label>

            <div className={styles.actionsRow}>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={styles.submitButton}
                >
                    {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
            </div>

            {message ? (
                <div className={isError ? styles.error : styles.success}>
                    {message}
                </div>
            ) : null}
        </section>
    );
}
