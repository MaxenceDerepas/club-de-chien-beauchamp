"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createEventAction } from "../actions";
import styles from "../evenements.module.css";

export default function NewEventForm() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [unlimited, setUnlimited] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    }

    function handleRemoveImage() {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    }

    return (
        <form action={createEventAction} className={styles.formCard}>
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
                            placeholder="Ex : Stage d’obéissance de printemps"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="category">
                            Catégorie
                        </label>
                        <input
                            id="category"
                            name="category"
                            className={styles.input}
                            placeholder="Concours, stage, atelier…"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="eventDate">
                            Date
                        </label>
                        <input
                            id="eventDate"
                            name="eventDate"
                            type="date"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label
                            className={styles.label}
                            htmlFor="registrationDeadline"
                        >
                            Date de clôture des inscriptions
                        </label>
                        <input
                            id="registrationDeadline"
                            name="registrationDeadline"
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
                <h2 className={styles.sectionTitle}>Paramètres d’inscription</h2>
                <div className={styles.gridTwo}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="minLevel">
                            Niveau minimum requis
                        </label>
                        <select
                            id="minLevel"
                            name="minLevel"
                            className={styles.select}
                            defaultValue="chiot"
                        >
                            <option value="chiot">Chiot</option>
                            <option value="premier_cours">Premier cours</option>
                            <option value="ruban_violet">Ruban violet</option>
                            <option value="ruban_bleu">Ruban bleu</option>
                            <option value="ruban_blanc">Ruban blanc</option>
                            <option value="ruban_rouge">Ruban rouge</option>
                            <option value="ruban_noir">Ruban noir</option>
                        </select>
                    </div>

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
                                onChange={(e) => setUnlimited(e.target.checked)}
                            />
                            Pas de limite de participants
                        </label>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Description & visuel</h2>
                <div className={styles.grid}>
                    <div className={`${styles.field} ${styles.fieldFull}`}>
                        <label className={styles.label} htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            className={styles.textarea}
                            placeholder="Décris l’événement, les consignes, les horaires, le matériel…"
                        />
                    </div>

                    <div className={`${styles.field} ${styles.fieldFull}`}>
                        <label className={styles.label} htmlFor="image">
                            Image de l’événement
                        </label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            className={styles.input}
                            onChange={handleImageChange}
                            ref={imageInputRef}
                        />
                        {imagePreview ? (
                            <div className={styles.imagePreview}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Aperçu" />
                                <button
                                    type="button"
                                    className={styles.removeImageButton}
                                    onClick={handleRemoveImage}
                                >
                                    Supprimer l&apos;image
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            <div className={styles.submitRow}>
                <Link
                    href="/admin/evenements"
                    className={styles.secondaryLink}
                >
                    Annuler
                </Link>
                <button type="submit" className={styles.submitButton}>
                    Enregistrer l’événement
                </button>
            </div>
        </form>
    );
}
