import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import styles from "../parcours-sante.module.css";
import NewHealthCourseForm from "./NewHealthCourseForm";

export default async function NewHealthCoursePage() {
    await requireAdminSession();

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
                    <div className={styles.badge}>
                        NOUVEAU PARCOURS DE SANTÉ
                    </div>
                    <h1 className={styles.title}>
                        Créer un parcours de santé
                    </h1>
                    <p className={styles.text}>
                        Ajoute un parcours de santé du club depuis
                        l'administration.
                    </p>

                    <NewHealthCourseForm />
                </section>
            </div>
        </main>
    );
}
