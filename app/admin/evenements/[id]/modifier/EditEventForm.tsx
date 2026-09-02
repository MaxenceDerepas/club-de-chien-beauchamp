"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import { updateEventAction } from "../../actions";
import styles from "../../evenements.module.css";

type EventData = {
    id: string;
    title: string;
    category: string;
    eventDate: string;
    registrationDeadline: string;
    location: string;
    description: string;
    imageUrl: string;
    minLevel: string;
    maxParticipants: number;
};

type Props = {
    event: EventData;
};

export default function EditEventForm({ event }: Props) {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const [imagePreview, setImagePreview] = useState<string | null>(
        event.imageUrl || null,
    );
    const [removeImage, setRemoveImage] = useState(false);
    const [unlimited, setUnlimited] = useState(event.maxParticipants === 0);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [newFileSelected, setNewFileSelected] = useState(false);

    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith("blob:"))
                URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (imagePreview && imagePreview.startsWith("blob:"))
            URL.revokeObjectURL(imagePreview);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setRemoveImage(false);
            setNewFileSelected(true);
        } else {
            setNewFileSelected(false);
        }
    }

    function handleRemoveImage() {
        if (imagePreview && imagePreview.startsWith("blob:"))
            URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        setRemoveImage(true);
        setNewFileSelected(false);
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    }

    return (
        <form action={updateEventAction} className={styles.formCard}>
            <input type="hidden" name="id" value={event.id} />
            <input
                type="hidden"
                name="existingImageUrl"
                value={removeImage ? "" : event.imageUrl}
            />
            <input
                type="hidden"
                name="removeImage"
                value={removeImage ? "1" : "0"}
            />

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
                            defaultValue={event.title}
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
                            defaultValue={event.category}
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
                            defaultValue={event.eventDate}
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
                            defaultValue={event.registrationDeadline}
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
                            defaultValue={event.location}
                        />
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Paramètres d&apos;inscription
                </h2>
                <div className={styles.gridTwo}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="minLevel">
                            Niveau minimum requis
                        </label>
                        <select
                            id="minLevel"
                            name="minLevel"
                            className={styles.select}
                            defaultValue={event.minLevel}
                        >
                            <option value="chiot">Chiot</option>
                            <option value="premier_cours">Premier cours</option>
                            <option value="ruban_violet">Ruban violet</option>
                            <option value="ruban_bleu">Ruban bleu</option>
                            <option value="ruban_blanc">Ruban blanc</option>
                            <option value="ruban_rouge">Ruban rouge</option>
                            <option value="ruban_noir">Ruban noir</option>
                            <option value="equipe">Équipe</option>
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
                            defaultValue={
                                event.maxParticipants === 0
                                    ? 10
                                    : event.maxParticipants
                            }
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
                            defaultValue={event.description}
                        />
                    </div>

                    <div className={`${styles.field} ${styles.fieldFull}`}>
                        <label className={styles.label} htmlFor="image">
                            Image de l&apos;événement
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
                    href={`/admin/evenements/${event.id}`}
                    className={styles.secondaryLink}
                >
                    Annuler
                </Link>
                <button type="submit" className={styles.submitButton}>
                    Enregistrer les modifications
                </button>
            </div>
        </form>
    );
}
