"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createMemberAction } from "../actions";
import { initialCreateMemberState } from "../form-state";
import styles from "../membres.module.css";

export default function NewMemberForm() {
    const [state, formAction, isPending] = useActionState(
        createMemberAction,
        initialCreateMemberState,
    );
    const [showPassword, setShowPassword] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) {
            setPhotoPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPhotoPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
        });
    }

    const v = state.values;

    return (
        <form action={formAction} className={styles.formCard}>
            {state.error ? (
                <div className={styles.errorBox}>{state.error}</div>
            ) : null}

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Informations adhérent</h2>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="firstName">
                            Prénom *
                        </label>
                        <input
                            id="firstName"
                            name="firstName"
                            className={styles.input}
                            required
                            defaultValue={v.firstName}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="lastName">
                            Nom *
                        </label>
                        <input
                            id="lastName"
                            name="lastName"
                            className={styles.input}
                            required
                            defaultValue={v.lastName}
                        />
                    </div>

                    <div className={`${styles.field} ${styles.fieldFull}`}>
                        <label className={styles.label} htmlFor="address">
                            Adresse
                        </label>
                        <input
                            id="address"
                            name="address"
                            className={styles.input}
                            defaultValue={v.address}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="phone">
                            Téléphone
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            className={styles.input}
                            defaultValue={v.phone}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="phoneCompany">
                            Cie d'assurance
                        </label>
                        <input
                            id="phoneCompany"
                            name="phoneCompany"
                            className={styles.input}
                            defaultValue={v.phoneCompany}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="policyNumber">
                            Numéro de police
                        </label>
                        <input
                            id="policyNumber"
                            name="policyNumber"
                            className={styles.input}
                            defaultValue={v.policyNumber}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="email">
                            Mail adhérent
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={styles.input}
                            defaultValue={v.email}
                        />
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Propriétaire n°1 du chien
                </h2>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="owner1Name">
                            Nom / prénom
                        </label>
                        <input
                            id="owner1Name"
                            name="owner1Name"
                            className={styles.input}
                            defaultValue={v.owner1Name}
                        />
                    </div>

                    <div className={styles.field}>
                        <label
                            className={styles.label}
                            htmlFor="owner1BirthDate"
                        >
                            Date de naissance
                        </label>
                        <input
                            id="owner1BirthDate"
                            name="owner1BirthDate"
                            type="date"
                            className={styles.input}
                            defaultValue={v.owner1BirthDate}
                        />
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Propriétaire n°2 du chien
                </h2>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="owner2Name">
                            Nom / prénom
                        </label>
                        <input
                            id="owner2Name"
                            name="owner2Name"
                            className={styles.input}
                            defaultValue={v.owner2Name}
                        />
                    </div>

                    <div className={styles.field}>
                        <label
                            className={styles.label}
                            htmlFor="owner2BirthDate"
                        >
                            Date de naissance
                        </label>
                        <input
                            id="owner2BirthDate"
                            name="owner2BirthDate"
                            type="date"
                            className={styles.input}
                            defaultValue={v.owner2BirthDate}
                        />
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Informations chien</h2>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="dogName">
                            Nom du chien *
                        </label>
                        <input
                            id="dogName"
                            name="dogName"
                            className={styles.input}
                            required
                            defaultValue={v.dogName}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="dogBreed">
                            Race
                        </label>
                        <input
                            id="dogBreed"
                            name="dogBreed"
                            className={styles.input}
                            defaultValue={v.dogBreed}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="dogSex">
                            Sexe
                        </label>
                        <select
                            id="dogSex"
                            name="dogSex"
                            className={styles.select}
                            defaultValue={v.dogSex}
                        >
                            <option value="unknown">Non renseigné</option>
                            <option value="male">Mâle</option>
                            <option value="female">Femelle</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="dogBirthDate">
                            Date de naissance
                        </label>
                        <input
                            id="dogBirthDate"
                            name="dogBirthDate"
                            type="date"
                            className={styles.input}
                            defaultValue={v.dogBirthDate}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="dogLofNumber">
                            Numéro de LOF
                        </label>
                        <input
                            id="dogLofNumber"
                            name="dogLofNumber"
                            className={styles.input}
                            defaultValue={v.dogLofNumber}
                        />
                    </div>

                    <div className={styles.field}>
                        <label
                            className={styles.label}
                            htmlFor="dogIdentificationNumber"
                        >
                            Numéro de tatouage / puce
                        </label>
                        <input
                            id="dogIdentificationNumber"
                            name="dogIdentificationNumber"
                            className={styles.input}
                            defaultValue={v.dogIdentificationNumber}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="dogPhoto">
                            Photo du chien
                        </label>
                        <input
                            id="dogPhoto"
                            name="dogPhoto"
                            type="file"
                            accept="image/*"
                            className={styles.input}
                            onChange={handlePhotoChange}
                        />
                        {photoPreview ? (
                            <div className={styles.photoPreview}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={photoPreview}
                                    alt="Aperçu de la photo du chien"
                                />
                            </div>
                        ) : null}
                    </div>

                    <div className={styles.field}>
                        <label
                            className={styles.label}
                            htmlFor="rabiesBoosterDate"
                        >
                            Date du rappel vaccin rage
                        </label>
                        <input
                            id="rabiesBoosterDate"
                            name="rabiesBoosterDate"
                            type="date"
                            className={styles.input}
                            defaultValue={v.rabiesBoosterDate}
                        />
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Accès membre</h2>

                <div className={styles.infoNotice}>
                    L’identifiant et le mot de passe doivent être communiqués à
                    l’adhérent afin qu’il puisse se connecter à son espace
                    membre.
                </div>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="username">
                            Identifiant *
                        </label>
                        <input
                            id="username"
                            name="username"
                            className={styles.input}
                            required
                            defaultValue={v.username}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="password">
                            Mot de passe provisoire *
                        </label>

                        <div className={styles.passwordField}>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className={styles.input}
                                required
                            />

                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={
                                    showPassword
                                        ? "Masquer le mot de passe"
                                        : "Afficher le mot de passe"
                                }
                            >
                                {showPassword ? "Masquer" : "Afficher"}
                            </button>
                        </div>

                        <p className={styles.hint}>
                            Mot de passe communiqué à l’adhérent.
                        </p>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="level">
                            Niveau de l’adhérent
                        </label>
                        <select
                            id="level"
                            name="level"
                            className={styles.select}
                            defaultValue={v.level}
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
                        <label className={styles.label}>
                            Activités autorisées
                        </label>

                        <label className={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                name="healthCourse"
                                defaultChecked={v.healthCourse}
                            />
                            Parcours de santé
                        </label>

                        <label className={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                name="obedience"
                                defaultChecked={v.obedience}
                            />
                            Obéissance
                        </label>
                    </div>

                    <div className={styles.field}>
                        <label
                            className={styles.label}
                            htmlFor="registrationDate"
                        >
                            Date d’inscription
                        </label>
                        <input
                            id="registrationDate"
                            name="registrationDate"
                            type="date"
                            className={styles.input}
                            defaultValue={v.registrationDate}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Options</label>

                        <label className={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                name="membershipActive"
                                defaultChecked={v.membershipActive}
                            />
                            Adhésion active
                        </label>

                        <label className={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                name="siteAccessEnabled"
                                defaultChecked={v.siteAccessEnabled}
                            />
                            Accès membre activé
                        </label>
                    </div>

                    <div className={`${styles.field} ${styles.fieldFull}`}>
                        <label className={styles.label} htmlFor="notes">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            className={styles.textarea}
                            defaultValue={v.notes}
                        />
                    </div>
                </div>
            </section>
            <input type="hidden" name="dogPhotoUrl" value={v.dogPhotoUrl} />

            <div className={styles.submitRow}>
                <Link href="/admin/membres" className={styles.secondaryLink}>
                    Annuler
                </Link>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isPending}
                >
                    {isPending ? "Création…" : "Créer l’adhérent"}
                </button>
            </div>
        </form>
    );
}
