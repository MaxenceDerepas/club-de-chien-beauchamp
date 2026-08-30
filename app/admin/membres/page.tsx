import Link from "next/link";
import { listMembers } from "@/lib/members";
import { requireAdminSession } from "@/lib/admin-auth";
import styles from "./membres.module.css";
import MembersTableWithEmail from "./MembersTableWithEmail";

export default async function AdminMembersPage() {
    await requireAdminSession();
    const members = await listMembers();

    const serializedMembers = members.map((member) => ({
        id: member._id?.toString() || "",
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email || "",
        dogName: member.dogName,
        dogBreed: member.dogBreed || "",
        phone: member.phone || "",
        address: member.address || "",
        username: member.username,
        level: member.level,
        membershipActive: member.membershipActive,
        siteAccessEnabled: member.siteAccessEnabled,
        dogPhotoUrl: member.dogPhotoUrl || "",
        healthCourse: member.healthCourse ?? false,
        obedience: member.obedience ?? false,
        registrationDate: member.registrationDate
            ? new Date(member.registrationDate).toISOString()
            : null,
    }));

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin" className={styles.backLink}>
                        ← Retour au tableau de bord
                    </Link>

                    <Link
                        href="/admin/membres/nouveau"
                        className={styles.primaryLink}
                    >
                        Ajouter un adhérent
                    </Link>
                </div>

                <section className={styles.card}>
                    <div className={styles.badge}>ADHÉRENTS</div>
                    <h1 className={styles.title}>Gestion des adhérents</h1>
                    <p className={styles.text}>
                        Ajoute, modifie ou supprime les adhérents du club, ainsi
                        que leurs accès à l’espace adhérent.
                    </p>

                    {serializedMembers.length === 0 ? (
                        <div className={styles.empty}>
                            Aucun adhérent enregistré pour le moment.
                        </div>
                    ) : (
                        <MembersTableWithEmail members={serializedMembers} />
                    )}
                </section>
            </div>
        </main>
    );
}
