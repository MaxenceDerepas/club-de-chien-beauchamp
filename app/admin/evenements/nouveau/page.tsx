import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import styles from "../evenements.module.css";
import NewEventForm from "./NewEventForm";

export default async function NewEventPage() {
    await requireAdminSession();

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin/evenements" className={styles.backLink}>
                        ← Retour aux événements
                    </Link>
                </div>

                <section className={styles.card}>
                    <div className={styles.badge}>NOUVEL ÉVÉNEMENT</div>
                    <h1 className={styles.title}>Créer un événement</h1>
                    <p className={styles.text}>
                        Ajoute un événement du club depuis l’administration.
                    </p>

                    <NewEventForm />
                </section>
            </div>
        </main>
    );
}
