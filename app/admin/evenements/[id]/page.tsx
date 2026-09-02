import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { getEventById } from "@/lib/events";
import EventChat from "@/components/EventChat";
import {
    approveRegistrationAction,
    rejectRegistrationAction,
} from "../actions";
import styles from "../evenements.module.css";

type Props = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ error?: string }>;
};

function getLevelLabel(level?: string) {
    switch (level) {
        case "chiot":
            return "Chiot";
        case "premier_cours":
            return "Premier cours";
        case "ruban_violet":
            return "Ruban violet";
        case "ruban_bleu":
            return "Ruban bleu";
        case "ruban_blanc":
            return "Ruban blanc";
        case "ruban_rouge":
            return "Ruban rouge";
        case "ruban_noir":
            return "Ruban noir";
        case "equipe":
            return "Équipe";
        default:
            return "—";
    }
}

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

function formatDeadline(
    registrationDeadline: Date | null,
    eventDate: Date | null,
) {
    const target = registrationDeadline
        ? new Date(registrationDeadline)
        : eventDate
          ? (() => {
                const d = new Date(eventDate);
                d.setDate(d.getDate() - 13);
                return d;
            })()
          : null;
    if (!target) return null;
    return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(target);
}

export default async function AdminEventDetailPage({
    params,
    searchParams,
}: Props) {
    await requireAdminSession();
    const { id } = await params;
    const query = (await searchParams) || {};

    const event = await getEventById(id);
    if (!event) notFound();

    const approved = event.registrations.filter(
        (r) => r.status === "approved",
    );
    const approvedCount = approved.length;
    const pending = event.registrations.filter((r) => r.status === "pending");
    const rejected = event.registrations.filter(
        (r) => r.status === "rejected",
    );
    const isUnlimited = event.maxParticipants === 0;
    const slotCount = isUnlimited
        ? approved.length
        : Math.max(event.maxParticipants, approved.length);
    const slots = Array.from(
        { length: slotCount },
        (_, i) => approved[i] ?? null,
    );
    const deadline = formatDeadline(
        event.registrationDeadline ? new Date(event.registrationDeadline) : null,
        event.eventDate ? new Date(event.eventDate) : null,
    );

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin/evenements" className={styles.backLink}>
                        ← Retour aux événements
                    </Link>
                </div>

                <section className={styles.card}>
                    <div className={styles.badge}>GESTION</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                        <h1 className={styles.title} style={{ margin: 0 }}>{event.title}</h1>
                        <Link
                            href={`/admin/evenements/${id}/modifier`}
                            className={styles.secondaryLink}
                        >
                            Modifier
                        </Link>
                    </div>
                    <p className={styles.text}>
                        {event.location ? `${event.location} — ` : ""}
                        {formatDate(event.eventDate)}
                    </p>

                    {query.error ? (
                        <div className={styles.errorBox}>{query.error}</div>
                    ) : null}

                    {event.imageUrl ? (
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className={styles.eventImage}
                        />
                    ) : null}

                    {event.description ? (
                        <p className={styles.eventDescription}>
                            {event.description}
                        </p>
                    ) : null}

                    <div className={styles.eventMeta}>
                        <span>
                            Niveau minimum : {getLevelLabel(event.minLevel)}
                        </span>
                        <span>
                            Places validées : {approvedCount}
                            {isUnlimited
                                ? " (illimité)"
                                : ` / ${event.maxParticipants}`}
                        </span>
                        <span>
                            {event.isPublished ? "✓ Publié" : "Brouillon"}
                        </span>
                    </div>

                    {deadline ? (
                        <p className={styles.eventDeadlineText}>
                            Date de clôture des inscriptions : {deadline}.
                        </p>
                    ) : null}

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
                                                <div
                                                    className={
                                                        styles.registrationCardLevel
                                                    }
                                                >
                                                    {getLevelLabel(
                                                        registration.memberLevel,
                                                    )}
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
                                                    approveRegistrationAction
                                                }
                                            >
                                                <input
                                                    type="hidden"
                                                    name="eventId"
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
                                                    rejectRegistrationAction
                                                }
                                            >
                                                <input
                                                    type="hidden"
                                                    name="eventId"
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
                                                <div
                                                    className={
                                                        styles.registrationCardLevel
                                                    }
                                                >
                                                    {getLevelLabel(
                                                        registration.memberLevel,
                                                    )}
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

                    {event.registrations.length === 0 && (
                        <div className={styles.empty}>
                            Aucune demande d'inscription pour le moment.
                        </div>
                    )}

                    <EventChat eventId={id} currentUserId="admin" />
                </section>
            </div>
        </main>
    );
}
