"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
    createCalendarDateAction,
    updateCalendarDateAction,
    deleteCalendarDateAction,
    type CalendarDateState,
} from "./actions";
import styles from "../parcours-sante/parcours-sante.module.css";

type CalendarDateData = {
    id: string;
    title: string;
    date: string;
    description: string;
};

const initialState: CalendarDateState = {};

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            className={styles.submitButton}
            disabled={pending}
            style={{ minHeight: 42, padding: "0 18px", fontSize: "0.92rem" }}
        >
            {pending ? "Envoi…" : label}
        </button>
    );
}

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            className={styles.deleteButton}
            disabled={pending}
            style={{ minHeight: 36, fontSize: "0.85rem" }}
        >
            {pending ? "…" : "Supprimer"}
        </button>
    );
}

/* ── Add form ─────────────────────────────────────────────────── */

function AddForm() {
    const [state, formAction] = useActionState(
        createCalendarDateAction,
        initialState,
    );
    const [open, setOpen] = useState(false);

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className={styles.submitButton}
                style={{
                    marginTop: 24,
                    minHeight: 46,
                    padding: "0 22px",
                    fontSize: "0.95rem",
                }}
            >
                + Ajouter une date
            </button>
        );
    }

    return (
        <div className={styles.section} style={{ marginTop: 24 }}>
            <h3 className={styles.sectionTitle}>Nouvelle date</h3>
            <form action={formAction}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 14,
                    }}
                >
                    <div className={styles.field}>
                        <label className={styles.label}>Titre *</label>
                        <input
                            name="title"
                            className={styles.input}
                            placeholder="Ex : Journée portes ouvertes"
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Date *</label>
                        <input
                            name="date"
                            type="date"
                            className={styles.input}
                            required
                        />
                    </div>
                </div>
                <div className={styles.field} style={{ marginTop: 14 }}>
                    <label className={styles.label}>
                        Description (optionnel)
                    </label>
                    <input
                        name="description"
                        className={styles.input}
                        placeholder="Brève description…"
                    />
                </div>

                {state.error && (
                    <p className={styles.errorBox} style={{ marginTop: 14 }}>
                        {state.error}
                    </p>
                )}

                <div
                    style={{
                        marginTop: 16,
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className={styles.secondaryLink}
                        style={{
                            minHeight: 42,
                            padding: "0 18px",
                            cursor: "pointer",
                            border: "none",
                        }}
                    >
                        Annuler
                    </button>
                    <SubmitButton label="Ajouter" />
                </div>
            </form>
        </div>
    );
}

/* ── Edit row ─────────────────────────────────────────────────── */

function DateRow({ item }: { item: CalendarDateData }) {
    const [editing, setEditing] = useState(false);
    const [editState, editAction] = useActionState(
        updateCalendarDateAction,
        initialState,
    );

    const formattedDate = new Date(item.date + "T12:00:00").toLocaleDateString(
        "fr-FR",
        { day: "numeric", month: "long", year: "numeric" },
    );

    if (editing) {
        return (
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Modifier</h3>
                <form action={editAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 14,
                        }}
                    >
                        <div className={styles.field}>
                            <label className={styles.label}>Titre *</label>
                            <input
                                name="title"
                                className={styles.input}
                                defaultValue={item.title}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Date *</label>
                            <input
                                name="date"
                                type="date"
                                className={styles.input}
                                defaultValue={item.date}
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.field} style={{ marginTop: 14 }}>
                        <label className={styles.label}>
                            Description (optionnel)
                        </label>
                        <input
                            name="description"
                            className={styles.input}
                            defaultValue={item.description}
                        />
                    </div>

                    {editState.error && (
                        <p
                            className={styles.errorBox}
                            style={{ marginTop: 14 }}
                        >
                            {editState.error}
                        </p>
                    )}

                    <div
                        style={{
                            marginTop: 16,
                            display: "flex",
                            gap: 10,
                            justifyContent: "flex-end",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className={styles.secondaryLink}
                            style={{
                                minHeight: 42,
                                padding: "0 18px",
                                cursor: "pointer",
                                border: "none",
                            }}
                        >
                            Annuler
                        </button>
                        <SubmitButton label="Enregistrer" />
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                padding: "14px 18px",
                background: "#f5fbfe",
                borderRadius: 14,
                border: "1px solid #d8edf5",
            }}
        >
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontWeight: 800,
                        color: "#163040",
                        fontSize: "0.95rem",
                    }}
                >
                    {item.title}
                </div>
                <div
                    style={{
                        fontSize: "0.85rem",
                        color: "#06607b",
                        fontWeight: 600,
                        marginTop: 2,
                    }}
                >
                    {formattedDate}
                </div>
                {item.description && (
                    <div
                        style={{
                            fontSize: "0.85rem",
                            color: "#555",
                            marginTop: 4,
                        }}
                    >
                        {item.description}
                    </div>
                )}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                    onClick={() => setEditing(true)}
                    className={styles.secondaryLink}
                    style={{
                        minHeight: 36,
                        padding: "0 14px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        border: "none",
                    }}
                >
                    Modifier
                </button>
                <form action={deleteCalendarDateAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <DeleteButton />
                </form>
            </div>
        </div>
    );
}

/* ── Main component ───────────────────────────────────────────── */

export default function CalendarDatesManager({
    dates,
}: {
    dates: CalendarDateData[];
}) {
    return (
        <div>
            {dates.length === 0 ? (
                <p className={styles.empty}>
                    Aucune date ajoutée pour le moment.
                </p>
            ) : (
                <div
                    style={{
                        marginTop: 24,
                        display: "grid",
                        gap: 10,
                    }}
                >
                    {dates.map((d) => (
                        <DateRow key={d.id} item={d} />
                    ))}
                </div>
            )}
            <AddForm />
        </div>
    );
}
