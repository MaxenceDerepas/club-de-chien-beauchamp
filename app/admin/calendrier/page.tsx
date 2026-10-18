import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { listCalendarDates } from "@/lib/calendar-dates";
import CalendarDatesManager from "./CalendarDatesManager";
import styles from "../parcours-sante/parcours-sante.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCalendarDatesPage() {
    await requireAdminSession();
    const dates = await listCalendarDates();

    const datesData = dates.map((d) => ({
        id: d._id?.toString() ?? "",
        title: d.title,
        date: d.date,
        description: d.description ?? "",
    }));

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin" className={styles.backLink}>
                        ← Retour
                    </Link>
                </div>

                <div className={styles.card}>
                    <span className={styles.badge}>CALENDRIER</span>
                    <h1 className={styles.title}>Dates du calendrier</h1>
                    <p className={styles.text}>
                        Ajoutez des dates informatives qui apparaîtront sur le
                        calendrier de l&apos;espace adhérent, indépendamment des
                        événements.
                    </p>

                    <CalendarDatesManager dates={datesData} />
                </div>
            </div>
        </main>
    );
}
