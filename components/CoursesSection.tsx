"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import styles from "./courses-section.module.css";

const courses = [
    {
        id: "chiots",
        title: "L’école des chiots",
        images: ["/images/cours-chiots.jpg", "/images/chiot-2.jpg", "/images/chiot-3.jpg", "/images/chiot-4.jpg", "/images/chiot-5.jpg"],
        alt: "L’école des chiots",
        headerClass: styles.courseCardHeaderGreen,
        content: (
            <>
                <p className={styles.courseDetailSchedule}>
                    <span>Samedi : 14h30 - 15h00</span>
                    <br />
                    <span>Dimanche : 9h00 - 9h30</span>
                </p>

                <p className={styles.courseDetailDescription}>
                    S’ils sont à jour dans leurs vaccins, les chiots peuvent
                    ainsi s’initier à l’éducation.
                </p>

                <p className={styles.courseDetailDescription}>
                    Nos moniteurs accompagnent les maîtres à{" "}
                    <span className={styles.courseHighlight}>
                        s’approprier les bons gestes
                    </span>{" "}
                    et à{" "}
                    <span className={styles.courseHighlight}>
                        mieux comprendre le comportement canin
                    </span>
                    .
                </p>

                <p className={styles.courseDetailDescription}>
                    Une part importante du cours consiste à{" "}
                    <span className={styles.courseHighlight}>
                        développer la connexion
                    </span>{" "}
                    maître-chien notamment via le jeu.
                </p>

                <p className={styles.courseDetailDescription}>
                    Les exercices de base (les positions, le suivi naturel ou
                    encore le rappel) sont abordés, ainsi que la sociabilité
                    avec les congénères et d’autres humains.
                </p>

                <p className={styles.courseDetailDescription}>
                    Pensez à vous munir d’un jouet et de friandises pour
                    récompenser le chiot à chaque réussite.
                </p>
            </>
        ),
    },
    {
        id: "premiers",
        title: "Premiers cours",
        images: ["/images/cours-premiers.jpg"],
        alt: "Premiers cours",
        headerClass: styles.courseCardHeaderPink,
        content: (
            <>
                <p className={styles.courseDetailSchedule}>
                    <span>Samedi : 14h30 - 15h00</span>
                    <br />
                    <span>Dimanche : 9h00 - 9h30</span>
                </p>

                <p className={styles.courseDetailDescription}>
                    Ce cours nous permet d’accueillir les nouveaux adhérents
                    accompagnés de chiens adultes.
                </p>

                <p className={styles.courseDetailDescription}>
                    L’objectif est ainsi d’aider le maître à assimiler les bons
                    réflexes pour aborder l’éducation de son chien avec{" "}
                    <span className={styles.courseHighlight}>
                        calme et bienveillance
                    </span>
                    .
                </p>

                <p className={styles.courseDetailDescription}>
                    Avant de se lancer dans le cours collectif, le maître doit
                    apprendre les bons gestes et{" "}
                    <span className={styles.courseHighlight}>
                        avoir confiance en soi et en son chien
                    </span>
                    .
                </p>
            </>
        ),
    },
    {
        id: "ados",
        title: "Cours “ados”",
        images: ["/images/cous-ados.jpg", "/images/ado-2.jpg", "/images/ado-3.jpg", "/images/ado-4.jpg", "/images/ado-5.jpg", "/images/ado-6.jpg", "/images/ado-7.jpg"],
        alt: 'Cours "ados"',
        headerClass: styles.courseCardHeaderPurple,
        content: (
            <>
                <p className={styles.courseDetailSchedule}>
                    <span>Samedi : 14h30 - 15h00+</span>
                    <br />
                    <span>Dimanche : 9h00 - 9h30+</span>
                </p>

                <p className={styles.courseDetailDescription}>
                    Quand ils sont en âge de quitter l’École des chiots, les
                    jeunes chiens intègrent cet atelier pour poursuivre
                    l’acquisition et le{" "}
                    <span className={styles.courseHighlight}>renforcement</span>{" "}
                    des exercices de base, mais cette fois avec{" "}
                    <span className={styles.courseHighlight}>
                        davantage d’exigence et de précision
                    </span>
                    .
                </p>

                <p className={styles.courseDetailDescription}>
                    L’accent est toujours mis sur le{" "}
                    <span className={styles.courseHighlight}>
                        développement de la relation
                    </span>{" "}
                    entre le maître et son chien, via des moments de jeu.
                </p>
            </>
        ),
    },
    {
        id: "collectif",
        title: "Cours collectif",
        images: ["/images/cours-collectif.jpg", "/images/collectif-2.jpg", "/images/collectif-3.jpg", "/images/collectif-4.jpg", "/images/collectif-5.jpg", "/images/collectif-6.jpg", "/images/collectif-7.jpg"],
        alt: "Cours collectif",
        headerClass: styles.courseCardHeaderBlue,
        content: (
            <>
                <p className={styles.courseDetailSchedule}>
                    <span>Samedi : 15h00 - 16h00</span>
                    <br />
                    <span>Dimanche : 9h30 - 10h30</span>
                </p>

                <p className={styles.courseDetailDescription}>
                    Le cours collectif réunit tous les chiens ayant terminé la
                    première phase de leur éducation.
                </p>

                <p className={styles.courseDetailDescription}>
                    La première partie du cours s’articule autour d’un{" "}
                    <span className={styles.courseHighlight}>tronc commun</span>{" "}
                    proposant différents exercices, tels que le refus d’appâts,
                    le port de la muselière ou la poursuite de la sociabilité
                    avec les congénères.
                </p>

                <p className={styles.courseDetailDescription}>
                    Ensuite, les chiens sont séparés selon leur progression (
                    <span className={styles.courseHighlight}>
                        symbolisée par des rubans de couleur
                    </span>
                    ) pour travailler le reste des exercices (le rappel,
                    l’absence etc... ).
                </p>

                <p className={styles.courseDetailDescription}>
                    Les conditions changent pour permettre au chien
                    d’appréhender des situations diverses au quotidien.
                </p>
            </>
        ),
    },
    {
        id: "evenements",
        title: "Évènements",
        images: ["/images/categorie-evenement.jpg", "/images/evenement-2.jpg"],
        alt: "Évènements",
        headerClass: styles.courseCardHeaderYellow,
        content: (
            <>
                <p className={styles.courseDetailDescription}>
                    Plusieurs fois par an, des évènements internes (
                    <span className={styles.courseHighlight}>
                        aux places limitées
                    </span>
                    ) sont organisés.
                </p>

                <p className={styles.courseDetailDescription}>
                    L’objectif est d’appréhender l’éducation canine sous une
                    forme originale à base d’
                    <span className={styles.courseHighlight}>
                        activités ludiques et récréatives
                    </span>
                    .
                </p>

                <p className={styles.courseDetailDescription}>
                    Nos adhérents se lancent dans des compétitions amicales qui
                    peuvent prendre des formes bien différentes.
                </p>
            </>
        ),
    },
    {
        id: "obeissance",
        title: "Obéissance",
        images: ["/images/categorie-obeissance.jpg", "/images/obeissance-2.jpg", "/images/obeissance-3.jpg", "/images/obeissance-4.jpg"],
        alt: "Obéissance",
        headerClass: styles.courseCardHeaderRed,
        content: (
            <>
                <p className={styles.courseDetailDescription}>
                    Souvent confondue avec l&apos;éducation (qui permet au chien
                    d&apos;acquérir les bases élémentaires), l&apos;Obéissance est un{" "}
                    <span className={styles.courseHighlight}>
                        sport canin à part entière
                    </span>{" "}
                    dont l&apos;objectif est de mettre en valeur les qualités
                    naturelles du chien grâce à sa complicité avec son maître.
                </p>

                <p className={styles.courseDetailDescription}>
                    Praticable par tout chien sociable, cette discipline
                    s&apos;articule autour d&apos;une dizaine d&apos;exercices devant être
                    exécutés avec{" "}
                    <span className={styles.courseHighlight}>
                        précision et rapidité
                    </span>
                    , et sans contrainte.
                </p>

                <p className={styles.courseDetailDescription}>
                    Ce sport permet de{" "}
                    <span className={styles.courseHighlight}>
                        renforcer les liens
                    </span>{" "}
                    qui unissent un maître avec son chien, par l&apos;apprentissage
                    de méthodes positives et le renforcement de la communication
                    au sein du binôme.
                </p>

                <p className={styles.courseDetailDescription}>
                    <span className={styles.courseHighlight}>
                        Toutes les places sont actuellement réservées
                    </span>
                </p>
            </>
        ),
    },
    {
        id: "ring",
        title: "Ring",
        images: ["/images/categorie-ring.jpg", "/images/ring-2.jpg", "/images/ring-3.jpg", "/images/ring-4.jpg", "/images/ring-5.jpg"],
        alt: "Ring",
        headerClass: styles.courseCardHeaderOrange,
        content: (
            <>
                <p className={styles.courseDetailDescription}>
                    Aujourd&apos;hui reconnu comme l&apos;un des sports canins les plus
                    techniques au monde, le ring français est une discipline
                    complète et exigeante mettant en valeur les qualités du chien
                    comme l&apos;
                    <span className={styles.courseHighlight}>obéissance</span>,
                    l&apos;
                    <span className={styles.courseHighlight}>agilité</span> et le{" "}
                    <span className={styles.courseHighlight}>courage</span>.
                </p>

                <p className={styles.courseDetailDescription}>
                    Principalement pratiqué par des chiens de travail (comme le
                    Berger Belge Malinois), le ring voit ses épreuves être
                    divisées en trois catégories :{" "}
                    <span className={styles.courseHighlight}>
                        les sauts, l&apos;obéissance et le mordant sportif
                    </span>
                    . Le chien doit écouter son conducteur avec précision et
                    rapidité sur un terrain sécurisé et sous le contrôle
                    d&apos;un juge.
                </p>

                <p className={styles.courseDetailDescription}>
                    Ce sport nécessite des entraînements réguliers et une grande{" "}
                    <span className={styles.courseHighlight}>
                        complicité entre le maître et son chien
                    </span>
                    , deux aspects indispensables pour développer la confiance, la
                    maîtrise et la concentration de l&apos;animal. Le mordant est
                    strictement encadré pour garantir la sécurité et le respect du
                    chien.
                </p>

                <p className={styles.courseDetailDescription}>
                    <span className={styles.courseHighlight}>
                        Toutes les places sont actuellement réservées
                    </span>
                </p>
            </>
        ),
    },
] as const;

type Props = {
    /** Map of courseId -> image URLs from admin. Overrides hardcoded images when present. */
    courseImages?: Record<string, string[]>;
};

export default function CoursesSection({ courseImages }: Props) {
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [slideIndex, setSlideIndex] = useState(0);

    /** Resolve images: use admin-configured images when available, fallback to hardcoded */
    const resolvedCourses = useMemo(
        () =>
            courses.map((course) => {
                const dbImages = courseImages?.[course.id];
                return {
                    ...course,
                    images: dbImages && dbImages.length > 0 ? dbImages : [...course.images],
                };
            }),
        [courseImages],
    );

    const activeCourse = useMemo(
        () => resolvedCourses.find((course) => course.id === activeCourseId) ?? null,
        [activeCourseId, resolvedCourses],
    );

    const openCourse = useCallback((id: string) => {
        setActiveCourseId(id);
        setSlideIndex(0);
    }, []);

    const goToPrev = useCallback(() => {
        if (!activeCourse) return;
        setSlideIndex((prev) =>
            prev === 0 ? activeCourse.images.length - 1 : prev - 1,
        );
    }, [activeCourse]);

    const goToNext = useCallback(() => {
        if (!activeCourse) return;
        setSlideIndex((prev) =>
            prev === activeCourse.images.length - 1 ? 0 : prev + 1,
        );
    }, [activeCourse]);

    return (
        <section id="cours" className={styles.coursesSection}>
            <div className={styles.coursesInner}>
                <h2 className={styles.coursesTitle}>LES COURS</h2>

                {!activeCourse ? (
                    <div className={styles.coursesGrid}>
                        {resolvedCourses.map((course) => (
                            <article
                                key={course.id}
                                className={styles.courseCard}
                                onClick={() => openCourse(course.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        event.preventDefault();
                                        openCourse(course.id);
                                    }
                                }}
                            >
                                <div
                                    className={`${styles.courseCardHeader} ${course.headerClass}`}
                                >
                                    <h3 className={styles.courseCardTitle}>
                                        {course.title}
                                    </h3>
                                </div>

                                <div className={styles.courseImageWrap}>
                                    <Image
                                        src={course.images[0]}
                                        alt={course.alt}
                                        fill
                                        className={styles.courseImage}
                                    />
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className={styles.courseDetailLayout}>
                        <article
                            className={`${styles.courseCard} ${styles.courseDetailCard}`}
                        >
                            <div
                                className={`${styles.courseCardHeader} ${activeCourse.headerClass}`}
                            >
                                <h3 className={styles.courseCardTitle}>
                                    {activeCourse.title}
                                </h3>
                            </div>

                            <div
                                className={`${styles.courseImageWrap} ${styles.courseDetailImageWrap}`}
                            >
                                {activeCourse.images.map((imgSrc, idx) => (
                                    <Image
                                        key={imgSrc}
                                        src={imgSrc}
                                        alt={`${activeCourse.alt} - ${idx + 1}`}
                                        fill
                                        className={styles.courseImage}
                                        style={{ opacity: idx === slideIndex ? 1 : 0 }}
                                    />
                                ))}

                                {activeCourse.images.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                goToPrev();
                                            }}
                                            aria-label="Photo précédente"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                goToNext();
                                            }}
                                            aria-label="Photo suivante"
                                        >
                                            ›
                                        </button>
                                        <div className={styles.carouselDots}>
                                            {activeCourse.images.map(
                                                (_, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        className={`${styles.carouselDot} ${idx === slideIndex ? styles.carouselDotActive : ""}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSlideIndex(idx);
                                                        }}
                                                        aria-label={`Photo ${idx + 1}`}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </article>

                        <div className={styles.courseDetailTextPanel}>
                            <div className={styles.courseDetailTextInner}>
                                {activeCourse.content}

                                <button
                                    type="button"
                                    className={styles.courseDetailCloseButton}
                                    onClick={() => setActiveCourseId(null)}
                                >
                                    Retour aux cours
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
