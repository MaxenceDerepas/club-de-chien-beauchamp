import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { listEvents } from "@/lib/events";
import { listHealthCourses } from "@/lib/health-courses";
import styles from "./frequentation.module.css";

function formatDate(value: Date | null | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

export default async function FrequentationPage() {
    await requireAdminSession();

    const events = await listEvents();
    const healthCourses = await listHealthCourses();

    const eventStats = events.map((event) => {
        const approved = event.registrations.filter(
            (r) => r.status === "approved",
        ).length;
        const pending = event.registrations.filter(
            (r) => r.status === "pending",
        ).length;
        const rejected = event.registrations.filter(
            (r) => r.status === "rejected",
        ).length;
        return {
            id: event._id?.toString() || "",
            title: event.title,
            date: event.eventDate,
            type: "event" as const,
            approved,
            pending,
            rejected,
            max: event.maxParticipants,
            isPublished: event.isPublished,
        };
    });

    const healthStats = healthCourses.map((session) => {
        const approved = session.registrations.filter(
            (r) => r.status === "approved",
        ).length;
        const pending = session.registrations.filter(
            (r) => r.status === "pending",
        ).length;
        const rejected = session.registrations.filter(
            (r) => r.status === "rejected",
        ).length;
        return {
            id: session._id?.toString() || "",
            title: session.title,
            date: session.sessionDate,
            type: "health" as const,
            approved,
            pending,
            rejected,
            max: session.maxParticipants,
            isPublished: session.isPublished,
        };
    });

    const totalEventApproved = eventStats.reduce(
        (sum, e) => sum + e.approved,
        0,
    );
    const totalEventPending = eventStats.reduce(
        (sum, e) => sum + e.pending,
        0,
    );
    const totalHealthApproved = healthStats.reduce(
        (sum, e) => sum + e.approved,
        0,
    );
    const totalHealthPending = healthStats.reduce(
        (sum, e) => sum + e.pending,
        0,
    );

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin" className={styles.backLink}>
                        ← Retour au tableau de bord
                    </Link>
                </div>

                <section className={styles.card}>
                    <div className={styles.badge}>FRÉQUENTATION</div>
                    <h1 className={styles.title}>Tableau de fréquentation</h1>
                    <p className={styles.text}>
                        Suivi des inscriptions validées et en attente pour les
                        événements et le parcours de santé.
                    </p>

                    {/* Résumé global */}
                    <div className={styles.summaryGrid}>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>
                                Événements
                            </div>
                            <div className={styles.summaryValue}>
                                {totalEventApproved} validé(s)
                            </div>
                            <div className={styles.summarySubvalue}>
                                {totalEventPending} en attente
                            </div>
                        </div>
                        <div
                            className={`${styles.summaryCard} ${styles.summaryCardHealth}`}
                        >
                            <div className={styles.summaryLabel}>
                                Parcours de santé
                            </div>
                            <div className={styles.summaryValue}>
                                {totalHealthApproved} validé(s)
                            </div>
                            <div className={styles.summarySubvalue}>
                                {totalHealthPending} en attente
                            </div>
                        </div>
                    </div>

                    {/* Tableau événements */}
                    <h2 className={styles.sectionTitle}>Événements</h2>
                    {eventStats.length === 0 ? (
                        <div className={styles.empty}>Aucun événement.</div>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Événement</th>
                                        <th>Date</th>
                                        <th>Validés</th>
                                        <th>En attente</th>
                                        <th>Refusés</th>
                                        <th>Capacité</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventStats.map((stat) => (
                                        <tr key={stat.id}>
                                            <td className={styles.nameCell}>
                                                <Link
                                                    href={`/admin/evenements/${stat.id}`}
                                                    className={
                                                        styles.tableLink
                                                    }
                                                >
                                                    {stat.title}
                                                </Link>
                                            </td>
                                            <td>{formatDate(stat.date)}</td>
                                            <td>
                                                <span
                                                    className={
                                                        styles.countApproved
                                                    }
                                                >
                                                    {stat.approved}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        styles.countPending
                                                    }
                                                >
                                                    {stat.pending}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        styles.countRejected
                                                    }
                                                >
                                                    {stat.rejected}
                                                </span>
                                            </td>
                                            <td>
                                                {stat.max > 0
                                                    ? `${stat.approved} / ${stat.max}`
                                                    : "Illimité"}
                                            </td>
                                            <td>
                                                <span
                                                    className={`${styles.status} ${stat.isPublished ? styles.statusOn : styles.statusOff}`}
                                                >
                                                    {stat.isPublished
                                                        ? "Publié"
                                                        : "Brouillon"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tableau parcours de santé */}
                    <h2 className={styles.sectionTitle}>Parcours de santé</h2>
                    {healthStats.length === 0 ? (
                        <div className={styles.empty}>Aucune séance.</div>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Séance</th>
                                        <th>Date</th>
                                        <th>Validés</th>
                                        <th>En attente</th>
                                        <th>Refusés</th>
                                        <th>Capacité</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {healthStats.map((stat) => (
                                        <tr key={stat.id}>
                                            <td className={styles.nameCell}>
                                                <Link
                                                    href={`/admin/parcours-sante/${stat.id}`}
                                                    className={
                                                        styles.tableLink
                                                    }
                                                >
                                                    {stat.title}
                                                </Link>
                                            </td>
                                            <td>{formatDate(stat.date)}</td>
                                            <td>
                                                <span
                                                    className={
                                                        styles.countApproved
                                                    }
                                                >
                                                    {stat.approved}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        styles.countPending
                                                    }
                                                >
                                                    {stat.pending}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        styles.countRejected
                                                    }
                                                >
                                                    {stat.rejected}
                                                </span>
                                            </td>
                                            <td>
                                                {stat.max > 0
                                                    ? `${stat.approved} / ${stat.max}`
                                                    : "Illimité"}
                                            </td>
                                            <td>
                                                <span
                                                    className={`${styles.status} ${stat.isPublished ? styles.statusOn : styles.statusOff}`}
                                                >
                                                    {stat.isPublished
                                                        ? "Publié"
                                                        : "Brouillon"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
