import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { getEventById } from "@/lib/events";
import EditEventForm from "./EditEventForm";
import styles from "../../evenements.module.css";

type Props = {
    params: Promise<{ id: string }>;
};

function toDateInput(value: Date | null | undefined): string {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
}

export default async function EditEventPage({ params }: Props) {
    await requireAdminSession();
    const { id } = await params;

    const event = await getEventById(id);
    if (!event) notFound();

    const eventData = {
        id: event._id?.toString() ?? "",
        title: event.title,
        category: event.category || "",
        eventDate: toDateInput(event.eventDate),
        registrationDeadline: toDateInput(event.registrationDeadline),
        location: event.location || "",
        description: event.description || "",
        imageUrl: event.imageUrl || "",
        minLevel: event.minLevel || "chiot",
        maxParticipants: event.maxParticipants,
    };

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link
                        href={`/admin/evenements/${id}`}
                        className={styles.backLink}
                    >
                        ← Retour à l&apos;événement
                    </Link>
                </div>

                <section className={styles.card}>
                    <div className={styles.badge}>MODIFICATION</div>
                    <h1 className={styles.title}>Modifier l&apos;événement</h1>
                    <EditEventForm event={eventData} />
                </section>
            </div>
        </main>
    );
}
