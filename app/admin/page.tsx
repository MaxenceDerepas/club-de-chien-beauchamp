import Link from "next/link";
import { cookies } from "next/headers";
import { adminSession, verifySessionCookieValue } from "@/lib/admin-auth";
import { getHomepageAnnouncement } from "@/lib/content";
import { listMembers } from "@/lib/members";
import { listEvents } from "@/lib/events";
import { listHealthCourses } from "@/lib/health-courses";
import { MEMBER_LEVELS } from "@/lib/levels";
import { loginAdmin, logoutAdmin } from "./actions";
import AnnouncementEditor from "./AnnouncementEditor";
import styles from "./admin.module.css";

type AdminPageProps = {
    searchParams?: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
    const params = (await searchParams) || {};
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(adminSession.name)?.value;
    const isAuthenticated = verifySessionCookieValue(sessionValue);

    if (isAuthenticated) {
        const [announcement, members, events, healthCourses] = await Promise.all([
            getHomepageAnnouncement(),
            listMembers(),
            listEvents(),
            listHealthCourses(),
        ]);

        const now = new Date();

        // Stats membres
        const activeMembers = members.filter((m) => m.membershipActive);
        const siteAccessCount = members.filter((m) => m.siteAccessEnabled).length;
        const healthCourseMembers = members.filter((m) => m.healthCourse).length;
        const obedienceMembers = members.filter((m) => m.obedience).length;

        // Répartition par niveau
        const LEVEL_LABELS: Record<string, string> = {
            chiot: "Chiots",
            premier_cours: "Premiers cours",
            ruban_violet: "Violet",
            ruban_bleu: "Bleu",
            ruban_blanc: "Blanc",
            ruban_rouge: "Rouge",
            ruban_noir: "Noir",
        };
        const LEVEL_COLORS: Record<string, string> = {
            chiot: "#f5d957",
            premier_cours: "#9ad84c",
            ruban_violet: "#b08fd6",
            ruban_bleu: "#11b7e5",
            ruban_blanc: "#e0e0e0",
            ruban_rouge: "#ef6b6b",
            ruban_noir: "#2b2b2b",
        };
        const levelCounts = MEMBER_LEVELS.map((level) => ({
            level,
            label: LEVEL_LABELS[level] || level,
            color: LEVEL_COLORS[level] || "#999",
            count: activeMembers.filter((m) => m.level === level).length,
        })).filter((l) => l.count > 0);
        const maxLevelCount = Math.max(...levelCounts.map((l) => l.count), 1);

        // Stats événements
        const upcomingEvents = events.filter(
            (e) => e.eventDate && new Date(e.eventDate) >= now,
        );
        const pendingEventRegs = events.reduce(
            (sum, e) =>
                sum +
                (e.registrations?.filter((r: { status: string }) => r.status === "pending")
                    .length ?? 0),
            0,
        );

        // Stats parcours de santé
        const upcomingHealthCourses = healthCourses.filter(
            (h) => h.sessionDate && new Date(h.sessionDate) >= now,
        );
        const pendingHealthRegs = healthCourses.reduce(
            (sum, h) =>
                sum +
                (h.registrations?.filter((r: { status: string }) => r.status === "pending")
                    .length ?? 0),
            0,
        );

        const totalPending = pendingEventRegs + pendingHealthRegs;

        return (
            <main className={styles.page}>
                <section className={`${styles.card} ${styles.dashboardCard}`}>
                    <div className={styles.adminTopbar}>
                        <div>
                            <div className={styles.badge}>ADMIN</div>
                            <h1 className={styles.title}>
                                Espace administrateur
                            </h1>
                        </div>

                        <form
                            action={logoutAdmin}
                            className={styles.logoutTopForm}
                        >
                            <button
                                type="submit"
                                className={styles.logoutButton}
                            >
                                Se déconnecter
                            </button>
                        </form>
                    </div>

                    {/* Statistiques */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>
                                {activeMembers.length}
                            </span>
                            <span className={styles.statLabel}>
                                Membres actifs
                            </span>
                            <span className={styles.statSub}>
                                {siteAccessCount} avec accès site
                            </span>
                        </div>

                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>
                                {upcomingEvents.length}
                            </span>
                            <span className={styles.statLabel}>
                                Événements à venir
                            </span>
                            <span className={styles.statSub}>
                                {events.length} au total
                            </span>
                        </div>

                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>
                                {upcomingHealthCourses.length}
                            </span>
                            <span className={styles.statLabel}>
                                Parcours à venir
                            </span>
                            <span className={styles.statSub}>
                                {healthCourses.length} au total
                            </span>
                        </div>

                        <div
                            className={`${styles.statCard} ${totalPending > 0 ? styles.statCardAlert : ""}`}
                        >
                            <span className={styles.statNumber}>
                                {totalPending}
                            </span>
                            <span className={styles.statLabel}>
                                En attente
                            </span>
                            <span className={styles.statSub}>
                                {pendingEventRegs} évén. · {pendingHealthRegs}{" "}
                                parcours
                            </span>
                        </div>
                    </div>

                    {/* Répartition par niveau */}
                    <div className={styles.levelPanel}>
                        <h3 className={styles.levelPanelTitle}>
                            Répartition par niveau
                        </h3>
                        <div className={styles.levelTagsRow}>
                            <span className={styles.levelTagSmall}>
                                {healthCourseMembers} parcours santé
                            </span>
                            <span className={styles.levelTagSmall}>
                                {obedienceMembers} obéissance
                            </span>
                        </div>
                        <div className={styles.levelBars}>
                            {levelCounts.map((l) => (
                                <div key={l.level} className={styles.levelBarRow}>
                                    <span className={styles.levelBarLabel}>
                                        {l.label}
                                    </span>
                                    <div className={styles.levelBarTrack}>
                                        <div
                                            className={styles.levelBarFill}
                                            style={{
                                                width: `${(l.count / maxLevelCount) * 100}%`,
                                                backgroundColor: l.color,
                                            }}
                                        />
                                    </div>
                                    <span className={styles.levelBarCount}>
                                        {l.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.grid}>
                        <Link
                            href="/admin/membres"
                            className={styles.featureCard}
                        >
                            <h2 className={styles.featureTitle}>
                                Gérer les membres
                            </h2>
                            <p className={styles.text}>
                                Ajouter, modifier, supprimer un membre et gérer
                                ses accès à l&apos;espace privé.
                            </p>
                        </Link>

                        <Link
                            href="/admin/evenements"
                            className={styles.featureCard}
                        >
                            <h2 className={styles.featureTitle}>
                                Gérer les événements
                            </h2>
                            <p className={styles.text}>
                                Consulter, modifier et administrer les
                                événements du club depuis l&apos;espace
                                administrateur.
                            </p>
                        </Link>

                        <Link
                            href="/admin/parcours-sante"
                            className={styles.featureCard}
                        >
                            <h2 className={styles.featureTitle}>
                                Parcours de santé
                            </h2>
                            <p className={styles.text}>
                                Gérer les parcours de santé et les demandes
                                d&apos;inscription des membres.
                            </p>
                        </Link>

                        <Link
                            href="/admin/galerie"
                            className={styles.featureCard}
                        >
                            <h2 className={styles.featureTitle}>
                                Galerie photos
                            </h2>
                            <p className={styles.text}>
                                Ajouter et gérer les photos visibles par les
                                adhérents.
                            </p>
                        </Link>

                        <Link
                            href="/admin/frequentation"
                            className={styles.featureCard}
                        >
                            <h2 className={styles.featureTitle}>
                                Fréquentation
                            </h2>
                            <p className={styles.text}>
                                Tableau récapitulatif des participations aux
                                événements et au parcours de santé.
                            </p>
                        </Link>
                    </div>

                    <AnnouncementEditor
                        initialText={announcement.text}
                        initialEnabled={announcement.enabled}
                    />
                </section>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <div className={styles.badge}>ACCÈS PRIVÉ</div>
                <h1 className={styles.title}>Connexion administrateur</h1>
                <p className={styles.text}>
                    Connectez-vous pour accéder à l’espace d’administration.
                </p>

                {params.error === "1" ? (
                    <p className={styles.error}>
                        Identifiant ou mot de passe incorrect.
                    </p>
                ) : null}

                <form action={loginAdmin} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="username" className={styles.label}>
                            Identifiant
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            className={styles.input}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className={styles.input}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        Se connecter
                    </button>
                </form>
            </section>
        </main>
    );
}
