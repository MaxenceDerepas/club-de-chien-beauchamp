import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { listDocumentCategories } from "@/lib/documents";
import DocumentsManager from "./DocumentsManager";
import styles from "../parcours-sante/parcours-sante.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
    await requireAdminSession();
    const categories = await listDocumentCategories();

    const categoriesData = categories.map((cat) => ({
        id: cat._id?.toString() ?? "",
        name: cat.name,
        icon: cat.icon,
        documents: cat.documents.map((doc) => ({
            id: doc._id?.toString() ?? "",
            name: doc.name,
            fileUrl: doc.fileUrl,
            publicId: doc.publicId,
            originalFilename: doc.originalFilename,
        })),
    }));

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin" className={styles.backLink}>
                        ← Retour au tableau de bord
                    </Link>
                </div>

                <section className={styles.card}>
                    <div className={styles.badge}>GESTION</div>
                    <h1 className={styles.title}>Documents adhérents</h1>
                    <p className={styles.subtitle}>
                        Créez des catégories et uploadez des documents (PDF, Word, etc.)
                        visibles dans l&apos;espace membre.
                    </p>

                    <DocumentsManager categories={categoriesData} />
                </section>
            </div>
        </main>
    );
}
