import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import styles from "../membres.module.css";
import NewMemberForm from "./NewMemberForm";

export default async function NewMemberPage() {
    await requireAdminSession();

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin/membres" className={styles.backLink}>
                        ← Retour aux membres
                    </Link>
                </div>

                <section className={styles.card}>
                    <div className={styles.badge}>NOUVEAU MEMBRE</div>
                    <h1 className={styles.title}>Ajouter un adhérent</h1>
                    <p className={styles.text}>
                        Renseigne les informations de l’adhérent, de son chien et
                        ses accès à l’espace membre. Les champs marqués d’une
                        étoile sont obligatoires.
                    </p>

                    <NewMemberForm />
                </section>
            </div>
        </main>
    );
}
