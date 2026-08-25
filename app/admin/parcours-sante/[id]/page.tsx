import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { getHealthCourseById } from "@/lib/health-courses";
import {
    approveHealthCourseRegistrationAction,
    rejectHealthCourseRegistrationAction,
} from "../actions";
import styles from "../parcours-sante.module.css";

type Props = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ error?: string }>;
};

function formatDate(value: Date | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export default async function AdminHealthCourseDetailPage({
    params,
    searchParams,
}: Props) {
    await requireAdminSession();
    const { id } = await params;
    const query = (await searchParams) || {};

    const course = await getHealthCourseById(id);
    if (!course) notFound();

    const approved = course.registrations.filter(
        (r) => r.status === "approved",
    );
    const approvedCount = approved.length;
    const pending = course.registrations.filter((r) => r.status === "pending");
    const rejected = course.registrations.filter(
        (r) => r.status === "rejected",
    );
    const isUnlimited = course.maxParticipants === 0;
    const slotCount = isUnlimited
        ? approved.length
        : Math.max(course.maxParticipants, approved.length);
    const slots = Array.from(
        { length: slotCount },
        (_, i) => approved[i] ?? null,
    );

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link
                        href="/admin/parcours-sante"
                        className={styles.backLink}
                    >
                        ← Retour aux parcours de santé
                    </Link>
                </div>

                <section className={styles.card}>
                    <div className={styles.badge}>GESTION</div>
                    <h1 className={styles.title}>{course.title}</h1>
                    <p className={styles.text}>
                        {course.location ? `${course.location} — ` : ""}
                        {formatDate(course.sessionDate)}
                    </p>

                    {query.error ? (
                        <div className={styles.errorBox}>{query.error}</div>
                    ) : null}

                    {course.description ? (
                        <p className={styles.eventDescription}>
                            {course.description}
                        </p>
                    ) : null}

                    <div className={styles.eventMeta}>
                        <span>
                            Places validées : {approvedCount}
                            {isUnlimited
                                ? " (illimité)"
                                : ` / ${course.maxParticipants}`}
                        </span>
                        <span>
                            {course.isPublished ? "✓ Publié" : "Brouillon"}
                        </span>
                    </div>

                    {/* Liste des places (même format que côté adhérent) */}
                    <ol className={styles.slotsList}>
                        {slots.map((reg, index) => (
                            <li key={index} className={styles.slotItem}>
                                <span className={styles.slotNumber}>
                                    {index + 1})
                                </span>
                                {reg ? (
                                    <span className={styles.slotName}>
                                        {reg.memberName}
                                    </span>
                                ) : (
                                    <span className={styles.slotEmpty} />
                                )}
                            </li>
                        ))}
                    </ol>

                    {/* Demandes en attente */}
                    {pending.length > 0 && (
                        <div className={styles.registrationSection}>
                            <h2 className={styles.registrationTitle}>
                                En attente de validation ({pending.length})
                            </h2>
                            <div className={styles.registrationCards}>
                                {pending.map((registration) => (
                                    <div
                                        key={registration.memberId}
                                        className={styles.registrationCard}
                                    >
                                        <div
                                            className={
                                                styles.registrationCardInfo
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.registrationCardInitial
                                                }
                                            >
                                                {registration.memberName
                                                    ?.charAt(0)
                                                    .toUpperCase() || "?"}
                                            </span>
                                            <div>
                                                <div
                                                    className={
                                                        styles.registrationCardName
                                                    }
                                                >
                                                    {registration.memberName}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                styles.registrationCardActions
                                            }
                                        >
                                            <form
                                                action={
                                                    approveHealthCourseRegistrationAction
                                                }
                                            >
                                                <input
                                                    type="hidden"
                                                    name="courseId"
                                                    value={id}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="memberId"
                                                    value={
                                                        registration.memberId
                                                    }
                                                />
                                                <button
                                                    type="submit"
                                                    className={
                                                        styles.approveButton
                                                    }
                                                >
                                                    Valider
                                                </button>
                                            </form>
                                            <form
                                                action={
                                                    rejectHealthCourseRegistrationAction
                                                }
                                            >
                                                <input
                                                    type="hidden"
                                                    name="courseId"
                                                    value={id}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="memberId"
                                                    value={
                                                        registration.memberId
                                                    }
                                                />
                                                <button
                                                    type="submit"
                                                    className={
                                                        styles.rejectButton
                                                    }
                                                >
                                                    Refuser
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inscriptions refusées */}
                    {rejected.length > 0 && (
                        <div className={styles.registrationSection}>
                            <h2 className={styles.registrationTitle}>
                                Refusées ({rejected.length})
                            </h2>
                            <div className={styles.registrationCards}>
                                {rejected.map((registration) => (
                                    <div
                                        key={registration.memberId}
                                        className={`${styles.registrationCard} ${styles.registrationCardRejected}`}
                                    >
                                        <div
                                            className={
                                                styles.registrationCardInfo
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.registrationCardInitial
                                                }
                                            >
                                                {registration.memberName
                                                    ?.charAt(0)
                                                    .toUpperCase() || "?"}
                                            </span>
                                            <div>
                                                <div
                                                    className={
                                                        styles.registrationCardName
                                                    }
                                                >
                                                    {registration.memberName}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={styles.rejectedLabel}>
                                            Non validé(e)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {course.registrations.length === 0 && (
                        <div className={styles.empty}>
                            Aucune demande d'inscription pour le moment.
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
