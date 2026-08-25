import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { listAlbums } from "@/lib/gallery";
import { listEvents } from "@/lib/events";
import GalleryManager from "./GalleryManager";
import styles from "./galerie.module.css";

export const dynamic = "force-dynamic";

export default async function AdminGaleriePage() {
    await requireAdminSession();

    const [albums, events] = await Promise.all([listAlbums(), listEvents()]);

    const albumsData = albums.map((a) => ({
        id: a._id?.toString() ?? "",
        title: a.title,
        visibility: a.visibility,
        eventId: a.eventId || "",
        eventTitle: a.eventTitle || "",
        coverUrl: a.coverUrl || "",
        photoCount: a.photos.length,
        photos: a.photos.map((p) => ({
            id: p.id,
            imageUrl: p.imageUrl,
        })),
        createdAt: a.createdAt?.toISOString() ?? "",
    }));

    const eventsData = events.map((e) => ({
        id: e._id?.toString() ?? "",
        title: e.title,
        date: e.eventDate ? new Date(e.eventDate).toLocaleDateString("fr-FR") : "",
    }));

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin" className={styles.backLink}>
                        ← Retour au dashboard
                    </Link>
                </div>

                <div className={styles.card}>
                    <div className={styles.badge}>ADMINISTRATION</div>
                    <h1 className={styles.title}>Galerie photos</h1>
                    <p className={styles.text}>
                        Créez des albums et ajoutez des photos pour les
                        adhérents.
                    </p>

                    <GalleryManager albums={albumsData} events={eventsData} />
                </div>
            </div>
        </main>
    );
}
