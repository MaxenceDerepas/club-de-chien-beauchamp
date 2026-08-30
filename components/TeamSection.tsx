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

                <div className={styles.teamDescription}>
                    <h3 className={styles.teamDescTitle}>LE C.B.E.C.</h3>

                    <p>
                        Le <strong>Club Beauchampois d'Éducation Canine</strong> a
                        été créé en <strong className={styles.highlight}>1975</strong> et
                        est <strong className={styles.highlight}>affilié à la Société
                        Centrale Canine</strong>.
                    </p>

                    <p>
                        Dirigé par une équipe d'éducateurs diplômés tous bénévoles,
                        le club propose des cours pour les chiots, la sociabilité
                        chiens et maîtres, les bases de l'éducation, la préparation
                        aux concours des disciplines d'Obéissance et de Ring.
                    </p>

                    <p>
                        Au fil des années, les formations reçues par les moniteurs
                        ont amené l'association à s'orienter et à adopter une
                        méthode d'éducation positive.
                    </p>

                    <p>
                        Tous les éducateurs sont passionnés, formés aux pratiques
                        et aux disciplines canines dans{" "}
                        <strong className={styles.highlight}>le respect du bien-être
                        animal</strong>. Ils sont là pour vous accompagner et vous
                        conseiller sur l'éducation de votre chien.
                    </p>

                    <p>
                        Nos méthodes sont basées sur{" "}
                        <strong className={styles.highlight}>le respect du chien</strong>,
                        nous favorisons l'apprentissage et le travail par la
                        motivation (jeu, récompenses). Il nous semble essentiel que
                        les cours soient pour le maître et son chien un moment de
                        plaisir et non une contrainte.
                    </p>

                    <p>
                        Les chiots sont les bienvenus dès leurs vaccinations à jour,
                        ils découvriront les premières bases de notre éducation à
                        savoir : l'apprentissage par le jeu, la connexion
                        maître/chiot et la socialisation avec les humains et ses
                        congénères.
                    </p>

                    <p>
                        L'objectif des cours devra, notamment, permettre à votre
                        chien de trouver sa place au sein de votre famille.
                    </p>

                    <p>
                        Une bonne éducation sera un plus pour les belles années que
                        vous vous préparez à partager avec votre compagnon à quatre
                        pattes.
                    </p>
                </div>
            </div>
        </section>
    );
}
