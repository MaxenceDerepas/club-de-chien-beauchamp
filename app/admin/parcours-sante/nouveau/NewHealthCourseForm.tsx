"use client";

import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createHealthCourseAction } from "../actions";
import styles from "../parcours-sante.module.css";

export default function NewHealthCourseForm() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const [unlimited, setUnlimited] = useState(false);

    return (
        <form action={createHealthCourseAction} className={styles.formCard}>
            {error ? <div className={styles.errorBox}>{error}</div> : null}

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Informations générales</h2>
                <div className={styles.grid}>
                    <div className={`${styles.field} ${styles.fieldFull}`}>
                        <label className={styles.label} htmlFor="title">
                            Titre *
                        </label>
                        <input
                            id="title"
                            name="title"
                            className={styles.input}
                            placeholder="Ex : Parcours de santé - Équilibre et proprioception"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="sessionDate">
                            Date
                        </label>
                        <input
                            id="sessionDate"
                            name="sessionDate"
                            type="date"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="location">
                            Lieu
                        </label>
                        <input
                            id="location"
                            name="location"
                            className={styles.input}
                            placeholder="Terrain du club…"
                        />
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Paramètres d'inscription
                </h2>
                <div className={styles.gridTwo}>
                    <div className={styles.field}>
                        <label
                            className={styles.label}
                            htmlFor="maxParticipants"
                        >
                            Nombre maximum de participants
                        </label>
                        <input
                            id="maxParticipants"
                            name="maxParticipants"
                            type="number"
                            min="1"
                            defaultValue="10"
                            className={styles.input}
                            disabled={unlimited}
                        />
                        <label className={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                name="unlimitedParticipants"
                                checked={unlimited}
                                onChange={(e) =>
                                    setUnlimited(e.target.checked)
                                }
                            />
                            Pas de limite de participants
                        </label>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Description</h2>
                <div className={styles.grid}>
                    <div className={`${styles.field} ${styles.fieldFull}`}>
                        <label className={styles.label} htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            className={styles.textarea}
                            placeholder="Décris le parcours de santé, ses objectifs, les consignes, les horaires…"
                        />
                    </div>
                </div>
            </section>

            <div className={styles.submitRow}>
                <Link
                    href="/admin/parcours-sante"
                    className={styles.secondaryLink}
                >
                    Annuler
                </Link>
                <button type="submit" className={styles.submitButton}>
                    Enregistrer le parcours de santé
                </button>
            </div>
        </form>
    );
}
