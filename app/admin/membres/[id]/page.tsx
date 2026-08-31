import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberById } from "@/lib/members";
import { requireAdminSession } from "@/lib/admin-auth";
import { updateMemberAction, deleteMemberPhotoAction } from "../actions";
import PasswordField from "./PasswordField";
import styles from "../membres.module.css";

type Props = {
    params: Promise<{ id: string }>;
};

function formatDateInput(value: Date | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
}

export default async function EditMemberPage({ params }: Props) {
    await requireAdminSession();

    const { id } = await params;
    const member = await getMemberById(id);

    if (!member) {
        notFound();
    }

    const updateAction = updateMemberAction.bind(null, id);

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin/membres" className={styles.backLink}>
                        ← Retour aux adhérents
                    </Link>
                </div>

                <section className={styles.card}>
                    <div className={styles.badge}>MODIFICATION</div>
                    <h1 className={styles.title}>
                        Modifier {member.firstName} {member.lastName}
                    </h1>
                    <p className={styles.text}>
                        Mets à jour la fiche de l'adhérent et ses accès.
                    </p>

                    {member.dogPhotoUrl ? (
                        <div
                            className={styles.formCard}
                            style={{ marginBottom: 0, paddingBottom: 18 }}
                        >
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    Photo actuelle
                                </label>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-end",
                                        gap: 12,
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={member.dogPhotoUrl}
                                        alt={member.dogName}
                                        style={{
                                            width: 140,
                                            height: 140,
                                            objectFit: "cover",
                                            borderRadius: 18,
                                            border: "2px solid #cfe2ea",
                                        }}
                                    />
                                    <form action={deleteMemberPhotoAction}>
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={id}
                                        />
                                        <button
                                            type="submit"
                                            className={styles.deleteButton}
                                            style={{
                                                fontSize: "0.82rem",
                                                padding: "6px 14px",
                                            }}
                                        >
                                            Supprimer la photo
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <form action={updateAction} className={styles.formCard}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                Informations adhérent
                            </h2>

                            <div className={styles.grid}>
                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="memberNumber"
                                    >
                                        N° adhérent
                                    </label>
                                    <input
                                        id="memberNumber"
                                        name="memberNumber"
                                        className={styles.input}
                                        defaultValue={
                                            (member as any).memberNumber || ""
                                        }
                                    />
                                </div>

                                <div className={styles.field} />

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="firstName"
                                    >
                                        Prénom *
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        className={styles.input}
                                        defaultValue={member.firstName}
                                        required
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="lastName"
                                    >
                                        Nom *
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        className={styles.input}
                                        defaultValue={member.lastName}
                                        required
                                    />
                                </div>

                                <div
                                    className={`${styles.field} ${styles.fieldFull}`}
                                >
                                    <label
                                        className={styles.label}
                                        htmlFor="address"
                                    >
                                        Adresse
                                    </label>
                                    <input
                                        id="address"
                                        name="address"
                                        className={styles.input}
                                        defaultValue={member.address}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="postalCode"
                                    >
                                        Code postal
                                    </label>
                                    <input
                                        id="postalCode"
                                        name="postalCode"
                                        className={styles.input}
                                        defaultValue={
                                            (member as any).postalCode || ""
                                        }
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="city"
                                    >
                                        Ville
                                    </label>
                                    <input
                                        id="city"
                                        name="city"
                                        className={styles.input}
                                        defaultValue={
                                            (member as any).city || ""
                                        }
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="phone"
                                    >
                                        Téléphone
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        className={styles.input}
                                        defaultValue={member.phone}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="phoneCompany"
                                    >
                                        Cie d'assurance
                                    </label>
                                    <input
                                        id="phoneCompany"
                                        name="phoneCompany"
                                        className={styles.input}
                                        defaultValue={member.phoneCompany}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="policyNumber"
                                    >
                                        Numéro de police
                                    </label>
                                    <input
                                        id="policyNumber"
                                        name="policyNumber"
                                        className={styles.input}
                                        defaultValue={member.policyNumber}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="email"
                                    >
                                        Mail adhérent
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className={styles.input}
                                        defaultValue={member.email}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        Droit à l&apos;image
                                    </label>

                                    <label className={styles.checkboxRow}>
                                        <input
                                            type="checkbox"
                                            name="imageRightsClub"
                                            defaultChecked={
                                                member.imageRightsClub ?? false
                                            }
                                        />
                                        Internet club (visible par les
                                        adhérents)
                                    </label>

                                    <label className={styles.checkboxRow}>
                                        <input
                                            type="checkbox"
                                            name="imageRightsExternal"
                                            defaultChecked={
                                                member.imageRightsExternal ??
                                                false
                                            }
                                        />
                                        Externe (visible par tous, y compris
                                        hors club)
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                Propriétaire n°1 du chien
                            </h2>

                            <div className={styles.grid}>
                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="owner1Name"
                                    >
                                        Nom / prénom
                                    </label>
                                    <input
                                        id="owner1Name"
                                        name="owner1Name"
                                        className={styles.input}
                                        defaultValue={member.owner1Name}
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
                                        defaultValue={formatDateInput(
                                            member.owner1BirthDate,
                                        )}
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
                                    <label
                                        className={styles.label}
                                        htmlFor="owner2Name"
                                    >
                                        Nom / prénom
                                    </label>
                                    <input
                                        id="owner2Name"
                                        name="owner2Name"
                                        className={styles.input}
                                        defaultValue={member.owner2Name}
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
                                        defaultValue={formatDateInput(
                                            member.owner2BirthDate,
                                        )}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                Informations chien
                            </h2>
                            <div className={styles.field}>
                                <label
                                    className={styles.label}
                                    htmlFor="dogPhoto"
                                >
                                    Photo du chien
                                </label>
                                <input
                                    id="dogPhoto"
                                    name="dogPhoto"
                                    type="file"
                                    accept="image/*"
                                    className={styles.input}
                                />
                                <p className={styles.hint}>
                                    Laisse vide pour conserver la photo
                                    actuelle.
                                </p>
                            </div>

                            <div className={styles.grid}>
                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="dogName"
                                    >
                                        Nom du chien *
                                    </label>
                                    <input
                                        id="dogName"
                                        name="dogName"
                                        className={styles.input}
                                        defaultValue={member.dogName}
                                        required
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="dogBreed"
                                    >
                                        Race
                                    </label>
                                    <input
                                        id="dogBreed"
                                        name="dogBreed"
                                        className={styles.input}
                                        defaultValue={member.dogBreed}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="dogSex"
                                    >
                                        Sexe
                                    </label>
                                    <select
                                        id="dogSex"
                                        name="dogSex"
                                        className={styles.select}
                                        defaultValue={member.dogSex}
                                    >
                                        <option value="unknown">
                                            Non renseigné
                                        </option>
                                        <option value="male">Mâle</option>
                                        <option value="female">Femelle</option>
                                    </select>
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="dogBirthDate"
                                    >
                                        Date de naissance
                                    </label>
                                    <input
                                        id="dogBirthDate"
                                        name="dogBirthDate"
                                        type="date"
                                        className={styles.input}
                                        defaultValue={formatDateInput(
                                            member.dogBirthDate,
                                        )}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="dogLofNumber"
                                    >
                                        Numéro de LOF
                                    </label>
                                    <input
                                        id="dogLofNumber"
                                        name="dogLofNumber"
                                        className={styles.input}
                                        defaultValue={member.dogLofNumber}
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
                                        defaultValue={
                                            member.dogIdentificationNumber
                                        }
                                    />
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
                                        defaultValue={formatDateInput(
                                            member.rabiesBoosterDate,
                                        )}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                Accès adhérent
                            </h2>

                            <div className={styles.grid}>
                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="username"
                                    >
                                        Identifiant *
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        className={styles.input}
                                        defaultValue={member.username}
                                        required
                                    />
                                </div>

                                <PasswordField />

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor="level"
                                    >
                                        Niveau de l’adhérent
                                    </label>
                                    <select
                                        id="level"
                                        name="level"
                                        className={styles.select}
                                        defaultValue={member.level || "chiot"}
                                    >
                                        <option value="chiot">Chiot</option>
                                        <option value="premier_cours">
                                            Premier cours
                                        </option>
                                        <option value="ruban_violet">
                                            Ruban violet
                                        </option>
                                        <option value="ruban_bleu">
                                            Ruban bleu
                                        </option>
                                        <option value="ruban_blanc">
                                            Ruban blanc
                                        </option>
                                        <option value="ruban_rouge">
                                            Ruban rouge
                                        </option>
                                        <option value="ruban_noir">
                                            Ruban noir
                                        </option>
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
                                            defaultChecked={
                                                member.healthCourse ?? false
                                            }
                                        />
                                        Parcours de santé
                                    </label>

                                    <label className={styles.checkboxRow}>
                                        <input
                                            type="checkbox"
                                            name="obedience"
                                            defaultChecked={
                                                member.obedience ?? false
                                            }
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
                                        defaultValue={formatDateInput(
                                            member.registrationDate,
                                        )}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        Options
                                    </label>

                                    <label className={styles.checkboxRow}>
                                        <input
                                            type="checkbox"
                                            name="membershipActive"
                                            defaultChecked={
                                                member.membershipActive
                                            }
                                        />
                                        Adhésion active
                                    </label>

                                    <label className={styles.checkboxRow}>
                                        <input
                                            type="checkbox"
                                            name="siteAccessEnabled"
                                            defaultChecked={
                                                member.siteAccessEnabled
                                            }
                                        />
                                        Accès adhérent activé
                                    </label>

                                    <label className={styles.checkboxRow}>
                                        <input
                                            type="checkbox"
                                            name="isAdmin"
                                            defaultChecked={member.isAdmin}
                                        />
                                        Administrateur
                                    </label>
                                </div>

                                <div
                                    className={`${styles.field} ${styles.fieldFull}`}
                                >
                                    <label
                                        className={styles.label}
                                        htmlFor="notes"
                                    >
                                        Notes
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        className={styles.textarea}
                                        defaultValue={member.notes}
                                    />
                                </div>
                            </div>
                        </section>

                        <div className={styles.submitRow}>
                            <button
                                type="submit"
                                className={styles.submitButton}
                            >
                                Enregistrer les modifications
                            </button>

                            <Link
                                href="/admin/membres"
                                className={styles.secondaryLink}
                            >
                                Annuler
                            </Link>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
