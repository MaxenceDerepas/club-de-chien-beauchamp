"use client";

import { useState } from "react";
import styles from "../membres.module.css";

type AdditionalDogData = {
    dogName: string;
    dogBreed: string;
    dogSex: "male" | "female" | "unknown";
    dogBirthDate: string;
    dogLofNumber: string;
    dogIdentificationNumber: string;
    rabiesBoosterDate: string;
    dogPhotoUrl: string;
};

function formatDateValue(value: Date | string | null | undefined): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
}

type Props = {
    initialDogs: {
        dogName: string;
        dogBreed: string;
        dogSex: "male" | "female" | "unknown";
        dogBirthDate: Date | string | null;
        dogLofNumber: string;
        dogIdentificationNumber: string;
        rabiesBoosterDate: Date | string | null;
        dogPhotoUrl: string;
    }[];
};

export default function AdditionalDogsField({ initialDogs }: Props) {
    const [dogs, setDogs] = useState<AdditionalDogData[]>(() =>
        initialDogs.map((d) => ({
            dogName: d.dogName || "",
            dogBreed: d.dogBreed || "",
            dogSex: d.dogSex || "unknown",
            dogBirthDate: formatDateValue(d.dogBirthDate),
            dogLofNumber: d.dogLofNumber || "",
            dogIdentificationNumber: d.dogIdentificationNumber || "",
            rabiesBoosterDate: formatDateValue(d.rabiesBoosterDate),
            dogPhotoUrl: d.dogPhotoUrl || "",
        })),
    );

    const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>(
        () => initialDogs.map(() => null),
    );

    function addDog() {
        setDogs((prev) => [
            ...prev,
            {
                dogName: "",
                dogBreed: "",
                dogSex: "unknown",
                dogBirthDate: "",
                dogLofNumber: "",
                dogIdentificationNumber: "",
                rabiesBoosterDate: "",
                dogPhotoUrl: "",
            },
        ]);
        setPhotoPreviews((prev) => [...prev, null]);
    }

    function removeDog(index: number) {
        setDogs((prev) => prev.filter((_, i) => i !== index));
        setPhotoPreviews((prev) => {
            const old = prev[index];
            if (old) URL.revokeObjectURL(old);
            return prev.filter((_, i) => i !== index);
        });
    }

    function handlePhotoChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        setPhotoPreviews((prev) => {
            const next = [...prev];
            if (next[index]) URL.revokeObjectURL(next[index]!);
            next[index] = file ? URL.createObjectURL(file) : null;
            return next;
        });
    }

    function updateDog(index: number, field: keyof AdditionalDogData, value: string) {
        setDogs((prev) =>
            prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
        );
    }

    return (
        <>
            {dogs.map((dog, i) => (
                <section key={i} className={styles.section}>
                    <div className={styles.dogSectionHeader}>
                        <h2>Chien supplémentaire {i + 2}</h2>
                        <button
                            type="button"
                            className={styles.removeDogButton}
                            onClick={() => removeDog(i)}
                        >
                            Supprimer ce chien
                        </button>
                    </div>

                    <input type="hidden" name={`additionalDog_${i}_dogPhotoUrl`} value={dog.dogPhotoUrl} />

                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label className={styles.label}>Nom du chien</label>
                            <input
                                name={`additionalDog_${i}_dogName`}
                                className={styles.input}
                                value={dog.dogName}
                                onChange={(e) => updateDog(i, "dogName", e.target.value)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Race</label>
                            <input
                                name={`additionalDog_${i}_dogBreed`}
                                className={styles.input}
                                value={dog.dogBreed}
                                onChange={(e) => updateDog(i, "dogBreed", e.target.value)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Sexe</label>
                            <select
                                name={`additionalDog_${i}_dogSex`}
                                className={styles.select}
                                value={dog.dogSex}
                                onChange={(e) => updateDog(i, "dogSex", e.target.value)}
                            >
                                <option value="unknown">Non renseigné</option>
                                <option value="male">Mâle</option>
                                <option value="female">Femelle</option>
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Date de naissance</label>
                            <input
                                name={`additionalDog_${i}_dogBirthDate`}
                                type="date"
                                className={styles.input}
                                value={dog.dogBirthDate}
                                onChange={(e) => updateDog(i, "dogBirthDate", e.target.value)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Numéro de LOF</label>
                            <input
                                name={`additionalDog_${i}_dogLofNumber`}
                                className={styles.input}
                                value={dog.dogLofNumber}
                                onChange={(e) => updateDog(i, "dogLofNumber", e.target.value)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Numéro de tatouage / puce</label>
                            <input
                                name={`additionalDog_${i}_dogIdentificationNumber`}
                                className={styles.input}
                                value={dog.dogIdentificationNumber}
                                onChange={(e) => updateDog(i, "dogIdentificationNumber", e.target.value)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Photo du chien</label>
                            <input
                                name={`additionalDogPhoto_${i}`}
                                type="file"
                                accept="image/*"
                                className={styles.input}
                                onChange={(e) => handlePhotoChange(i, e)}
                            />
                            {photoPreviews[i] ? (
                                <div className={styles.photoPreview}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={photoPreviews[i]!}
                                        alt={`Aperçu chien ${i + 2}`}
                                    />
                                </div>
                            ) : dog.dogPhotoUrl ? (
                                <div className={styles.photoPreview}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={dog.dogPhotoUrl}
                                        alt={`Photo chien ${i + 2}`}
                                    />
                                </div>
                            ) : null}
                            {dog.dogPhotoUrl && !photoPreviews[i] ? (
                                <p className={styles.hint}>
                                    Laisse vide pour conserver la photo actuelle.
                                </p>
                            ) : null}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Date du rappel vaccin rage</label>
                            <input
                                name={`additionalDog_${i}_rabiesBoosterDate`}
                                type="date"
                                className={styles.input}
                                value={dog.rabiesBoosterDate}
                                onChange={(e) => updateDog(i, "rabiesBoosterDate", e.target.value)}
                            />
                        </div>
                    </div>
                </section>
            ))}

            <button
                type="button"
                className={styles.addDogButton}
                onClick={addDog}
            >
                + Ajouter un chien
            </button>
        </>
    );
}
