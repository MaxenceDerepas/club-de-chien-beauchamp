import Image from "next/image";
import styles from "./team-section.module.css";

const team = [
    {
        id: "caroline",
        name: "Caroline",
        image: "/images/Caroline.jpg",
        headerClass: styles.teamHeaderPurple,
    },
    {
        id: "isabelle",
        name: "Isabelle",
        image: "/images/Isabelle.jpg",
        headerClass: styles.teamHeaderTeal,
    },
    {
        id: "chantal",
        name: "Chantal",
        image: "/images/Chantal.jpg",
        headerClass: styles.teamHeaderLightPurple,
    },
    {
        id: "pascale",
        name: "Pascale",
        image: "/images/Pascale.jpg",
        headerClass: styles.teamHeaderRed,
    },
    {
        id: "didier",
        name: "Didier",
        image: "/images/Didier.jpg",
        headerClass: styles.teamHeaderGreen,
    },
    {
        id: "herve",
        name: "Hervé",
        image: "/images/Herve.jpg",
        headerClass: styles.teamHeaderYellow,
    },
] as const;

export default function TeamSection() {
    return (
        <section id="equipe" className={styles.teamSection}>
            <div className={styles.teamInner}>
                <h2 className={styles.teamTitle}>L’ÉQUIPE</h2>

                <div className={styles.teamGrid}>
                    {team.map((member) => (
                        <article key={member.id} className={styles.teamCard}>
                            <div
                                className={`${styles.teamCardHeader} ${member.headerClass}`}
                            >
                                <h3 className={styles.teamCardName}>
                                    {member.name}
                                </h3>
                            </div>

                            <div className={styles.teamImageWrap}>
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className={styles.teamImage}
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
