import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { listEvents } from "@/lib/events";
import { deleteEventAction } from "./actions";
import styles from "./evenements.module.css";

function formatDate(value: Date | null | undefined) {
    if (!value) return "Non renseignée";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Non renseignée";

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

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

export default async function AdminEventsPage() {
    await requireAdminSession();
    const events = await listEvents();

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin" className={styles.backLink}>
                        ← Retour au tableau de bord
                    </Link>

                    <Link
                        href="/admin/evenements/nouveau"
                        className={styles.primaryLink}
                    >
                        Créer un événement
                    </Link>
                </div>

                <section className={styles.card}>
                    <div className={styles.badge}>ÉVÉNEMENTS</div>
                    <h1 className={styles.title}>Gestion des événements</h1>
                    <p className={styles.text}>
                        Consulte les événements, leur niveau minimum, leur
                        capacité et les demandes d’inscription.
                    </p>

                    {events.length === 0 ? (
                        <div className={styles.empty}>
                            Aucun événement enregistré pour le moment.
                        </div>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Événement</th>
                                        <th>Date</th>
                                        <th>Niveau mini</th>
                                        <th>Participants</th>
                                        <th>Publication</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event) => {
                                        const id = event._id?.toString() || "";
                                        const approvedCount =
                                            event.registrations.filter(
                                                (r) => r.status === "approved",
                                            ).length;
                                        const pendingCount =
                                            event.registrations.filter(
                                                (r) => r.status === "pending",
                                            ).length;

                                        return (
                                            <tr key={id}>
                                                <td>
                                                    {event.imageUrl ? (
                                                        <img
                                                            src={event.imageUrl}
                                                            alt={event.title}
                                                            style={{
                                                                width: 96,
                                                                height: 64,
                                                                objectFit:
                                                                    "cover",
                                                                borderRadius: 12,
                                                                display:
                                                                    "block",
                                                                marginBottom: 10,
                                                            }}
                                                        />
                                                    ) : null}

                                                    <div
                                                        className={
                                                            styles.nameCell
                                                        }
                                                    >
                                                        {event.title}
                                                    </div>
                                                    <div>
                                                        {event.location || "—"}
                                                    </div>
                                                    <div>
                                                        {event.description ||
                                                            "—"}
                                                    </div>
                                                </td>
                                                <td>
                                                    {formatDate(
                                                        event.eventDate,
                                                    )}
                                                </td>
                                                <td>
                                                    {getLevelLabel(
                                                        event.minLevel,
                                                    )}
                                                </td>
                                                <td>
                                                    Validés : {approvedCount}
                                                    {event.maxParticipants > 0
                                                        ? ` / ${event.maxParticipants}`
                                                        : " (illimité)"}
                                                    <br />
                                                    En attente : {pendingCount}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`${styles.status} ${
                                                            event.isPublished
                                                                ? styles.statusOn
                                                                : styles.statusOff
                                                        }`}
                                                    >
                                                        {event.isPublished
                                                            ? "Publié"
                                                            : "Brouillon"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div
                                                        className={
                                                            styles.actions
                                                        }
                                                    >
                                                        <Link
                                                            href={`/admin/evenements/${id}`}
                                                            className={
                                                                styles.secondaryLink
                                                            }
                                                        >
                                                            Gérer
                                                        </Link>

                                                        <Link
                                                            href={`/admin/evenements/${id}/modifier`}
                                                            className={
                                                                styles.secondaryLink
                                                            }
                                                        >
                                                            Modifier
                                                        </Link>

                                                        <form
                                                            action={
                                                                deleteEventAction
                                                            }
                                                        >
                                                            <input
                                                                type="hidden"
                                                                name="id"
                                                                value={id}
                                                            />
                                                            <button
                                                                type="submit"
                                                                className={
                                                                    styles.deleteButton
                                                                }
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
