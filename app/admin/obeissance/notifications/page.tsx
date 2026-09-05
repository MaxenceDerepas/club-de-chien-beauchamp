import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { listMembers } from "@/lib/members";
import { getObedienceNotifConfigs } from "@/lib/obedience";
import { saveObedienceNotifConfigAction } from "../actions";
import styles from "../../parcours-sante/parcours-sante.module.css";

export const dynamic = "force-dynamic";

export default async function ObedienceNotificationsPage() {
    await requireAdminSession();

    const allMembers = await listMembers();
    const admins = allMembers.filter((m) => m.isAdmin);
    const configs = await getObedienceNotifConfigs();

    const configByMemberId = new Map(
        configs.map((c) => [c.memberId, c.days]),
    );

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.topbar}>
                    <Link href="/admin/obeissance" className={styles.backLink}>
                        ← Retour à l&apos;obéissance
                    </Link>
                </div>

                <section className={styles.card}>
                    <div className={styles.badge}>
                        NOTIFICATIONS — OBÉISSANCE
                    </div>

                    <p style={{ color: "#555", fontSize: "0.95rem", marginBottom: 24, lineHeight: 1.6 }}>
                        Cochez les jours pour lesquels chaque administrateur doit recevoir
                        une notification par e-mail lors d&apos;une inscription, désinscription
                        ou absence signalée.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {admins.map((admin) => {
                            const id = admin._id!.toString();
                            const days = configByMemberId.get(id) || [];
                            const name =
                                [admin.firstName, admin.lastName]
                                    .filter(Boolean)
                                    .join(" ")
                                    .trim() ||
                                admin.dogName ||
                                "Admin";

                            return (
                                <form
                                    key={id}
                                    action={saveObedienceNotifConfigAction}
                                    style={{
                                        background: "rgba(6,96,123,0.06)",
                                        borderRadius: 12,
                                        padding: "16px 20px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 16,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <input type="hidden" name="memberId" value={id} />

                                    <span
                                        style={{
                                            fontWeight: 700,
                                            fontSize: "1rem",
                                            color: "#163040",
                                            minWidth: 140,
                                        }}
                                    >
                                        {name}
                                    </span>

                                    <label
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            color: "#333",
                                            fontSize: "0.9rem",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            name="day_2"
                                            defaultChecked={days.includes(2)}
                                        />
                                        Mardi
                                    </label>

                                    <label
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            color: "#333",
                                            fontSize: "0.9rem",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            name="day_4"
                                            defaultChecked={days.includes(4)}
                                        />
                                        Jeudi
                                    </label>

                                    <label
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            color: "#333",
                                            fontSize: "0.9rem",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            name="day_6"
                                            defaultChecked={days.includes(6)}
                                        />
                                        Samedi
                                    </label>

                                    <button
                                        type="submit"
                                        style={{
                                            marginLeft: "auto",
                                            padding: "8px 20px",
                                            background: "#06607b",
                                            color: "#163040",
                                            border: "none",
                                            borderRadius: 8,
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        Enregistrer
                                    </button>
                                </form>
                            );
                        })}

                        {admins.length === 0 && (
                            <p style={{ color: "#999" }}>
                                Aucun administrateur trouvé.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
