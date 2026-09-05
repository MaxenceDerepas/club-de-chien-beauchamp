import Image from "next/image";
import styles from "./home.module.css";
import { getHomepageAnnouncement } from "@/lib/content";
import { getCurrentMember } from "@/lib/member-auth";
import { listPublishedUpcomingEvents } from "@/lib/events";
import { getAllCourseImages } from "@/lib/course-images";
import ImageCluster from "@/components/ImageCluster";
import CoursesSection from "@/components/CoursesSection";
import TeamSection from "@/components/TeamSection";
import MobileNav from "@/components/MobileNav";
import PublicEventCarousel from "@/components/PublicEventCarousel";

export const dynamic = "force-dynamic";

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "Club Beauchampois d'Éducation Canine",
    description:
        "Club d'éducation canine à Beauchamp (Val-d'Oise). Cours chiots, ados, collectifs, obéissance, ring et parcours de santé.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.clubcaninbeauchamp.fr",
    telephone: "+33684908750",
    email: "clubcaninbeauchamp@hotmail.com",
    address: {
        "@type": "PostalAddress",
        streetAddress: "49 Chaussée Jules César",
        addressLocality: "Beauchamp",
        postalCode: "95250",
        addressRegion: "Val-d'Oise",
        addressCountry: "FR",
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: 49.003558,
        longitude: 2.212043,
    },
    openingHoursSpecification: [
        {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "14:00",
            closes: "17:00",
        },
        {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Sunday",
            opens: "09:00",
            closes: "12:00",
        },
    ],
    sport: "Éducation canine",
    image: "/images/hero-accueil.jpg",
};

export default async function HomePage() {
    const [announcement, member, upcomingEvents, allCourseImages] = await Promise.all([
        getHomepageAnnouncement(),
        getCurrentMember(),
        listPublishedUpcomingEvents(),
        getAllCourseImages(),
    ]);

    // Convert CourseImage[] to string[] (just URLs) for the client component
    const courseImageUrls: Record<string, string[]> = {};
    for (const [courseId, images] of Object.entries(allCourseImages)) {
        courseImageUrls[courseId] = images.map((img) => img.url);
    }

    const publicEvents = upcomingEvents.map((e) => ({
        id: e._id?.toString() ?? "",
        title: e.title,
        eventDate: e.eventDate ? e.eventDate.toISOString() : null,
        description: e.description || "",
        imageUrl: e.imageUrl || "",
        location: e.location || "",
    }));

    const navItems = [
        { href: "#accueil", label: "Accueil", dotClass: "dotWhite" },
        { href: "#cours", label: "Les cours", dotClass: "dotGreen" },
        { href: "#adhesion", label: "Adhésion", dotClass: "dotPink" },
        ...(publicEvents.length > 0
            ? [{ href: "#evenements", label: "Événements", dotClass: "dotYellow" }]
            : []),
        { href: "#contacts", label: "Contacts", dotClass: "dotPurple" },
        member
            ? {
                  href: "/membre",
                  label: "Mon espace",
                  dotClass: "dotWhite",
              }
            : {
                  href: "/login",
                  label: "Se connecter",
                  dotClass: "dotWhite",
                  sublabel: "(adhérents uniquement)",
              },
    ];

    return (
        <main className={styles.page}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <a href="#accueil" className={styles.logoWrap}>
                        <Image
                            src="/images/logo-club.png"
                            alt="Logo du club"
                            width={180}
                            height={180}
                            className={styles.logo}
                            priority
                        />
                    </a>

                    <nav className={styles.nav}>
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className={styles.navItem}
                            >
                                <span
                                    className={`${styles.dot} ${
                                        styles[
                                            item.dotClass as keyof typeof styles
                                        ]
                                    }`}
                                />
                                <span className={styles.navTextBlock}>
                                    <span className={styles.navLabel}>
                                        {item.label}
                                    </span>
                                    {item.sublabel ? (
                                        <span className={styles.navSubLabel}>
                                            {item.sublabel}
                                        </span>
                                    ) : null}
                                </span>
                            </a>
                        ))}
                    </nav>

                    <MobileNav items={navItems} />
                </div>
            </header>

            <section id="accueil" className={styles.hero}>
                <Image
                    src="/images/hero-accueil.jpg"
                    alt="Club Beauchampois d'Éducation Canine"
                    fill
                    priority
                    className={styles.heroBg}
                />
                <div className={styles.overlay} />

                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <h1>Club Beauchampois d’Éducation Canine</h1>
                        <p>49 Chaussée Jules César</p>
                        <p>95250 Beauchamp</p>
                    </div>

                    {announcement.enabled && announcement.text.trim() && (
                        <div className={styles.announcementWrap}>
                            <div className={styles.announcementBox}>
                                <span className={styles.announcementBadge}>
                                    Info club
                                </span>
                                <p className={styles.announcementText}>
                                    {announcement.text}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <ImageCluster />

            <CoursesSection courseImages={courseImageUrls} />

            <section id="adhesion" className={styles.adhesionSection}>
                <div className={styles.adhesionInner}>
                    <h2 className={styles.adhesionTitle}>ADHÉSION</h2>

                    <p className={styles.adhesionLead}>
                        Le forfait est annuel sous 12 mois glissants et permet
                        la participation à tous les cours (*).
                    </p>
                    <p className={styles.adhesionLeadNote}>
                        (*) Les places en Obéissance et en Ring sont limitées
                        et soumises à l’approbation du responsable de section.
                    </p>

                    <div className={styles.adhesionTableWrap}>
                        <div className={styles.adhesionTable}>
                            <div
                                className={`${styles.adhesionCell} ${styles.adhesionHeadCell}`}
                            >
                                <span>Première année</span>
                                <span>1 chien</span>
                            </div>

                            <div
                                className={`${styles.adhesionCell} ${styles.adhesionHeadCell}`}
                            >
                                <span>Première année</span>
                                <span>2 chiens</span>
                            </div>

                            <div
                                className={`${styles.adhesionCell} ${styles.adhesionHeadCell}`}
                            >
                                <span>Renouvellement</span>
                                <span>1 chien</span>
                            </div>

                            <div
                                className={`${styles.adhesionCell} ${styles.adhesionHeadCell}`}
                            >
                                <span>Renouvellement</span>
                                <span>2 chiens</span>
                            </div>

                            <div className={styles.adhesionCell}>
                                <span className={styles.adhesionPrice}>
                                    230€
                                </span>
                            </div>

                            <div className={styles.adhesionCell}>
                                <span className={styles.adhesionPrice}>
                                    345€
                                </span>
                                <span className={styles.adhesionNote}>
                                    -50% pour le 2ème chien
                                </span>
                            </div>

                            <div className={styles.adhesionCell}>
                                <span className={styles.adhesionPrice}>
                                    190€
                                </span>
                            </div>

                            <div className={styles.adhesionCell}>
                                <span className={styles.adhesionPrice}>
                                    285€
                                </span>
                                <span className={styles.adhesionNote}>
                                    -50% pour le 2ème chien
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.adhesionDocumentsBlock}>
                        <div className={styles.adhesionDocumentsHeader}>
                            <svg
                                className={styles.adhesionDocumentsIcon}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="8" y1="13" x2="16" y2="13" />
                                <line x1="8" y1="17" x2="16" y2="17" />
                            </svg>
                            <span>Les documents utiles à télécharger :</span>
                        </div>

                        <ul className={styles.adhesionDocumentsList}>
                            <li>
                                <a
                                    href="/documents/fiche-inscription.pdf"
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.adhesionDocumentLink}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    <span>La fiche d’inscription</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/documents/reglement-interieur.pdf"
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.adhesionDocumentLink}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    <span>
                                        Le règlement intérieur de l’association
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/documents/regles-vie-club.pdf"
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.adhesionDocumentLink}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    <span>Les règles de vie</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <p className={styles.adhesionWarning}>
                        Veuillez noter que l’accès aux cours n’est possible que
                        lorsque l’intégralité des informations et documents
                        demandés sur la fiche d’inscription a été fournie.
                    </p>
                </div>
            </section>

            {publicEvents.length > 0 && (
                <section id="evenements" className={styles.eventsSection}>
                    <div className={styles.eventsInner}>
                        <h2 className={styles.eventsTitle}>ÉVÉNEMENTS</h2>

                        <div className={styles.eventsContent}>
                            <PublicEventCarousel events={publicEvents} />
                        </div>
                    </div>
                </section>
            )}

            <TeamSection />

            <section id="contacts" className={styles.contactsSection}>
                <div className={styles.contactsInner}>
                    <h2 className={styles.contactsTitle}>CONTACTS</h2>

                    <div className={styles.contactsContent}>
                        <p className={styles.contactsIntro}>
                            Une question sur nos cours, l’adhésion ou le
                            fonctionnement du club ? Notre équipe est à votre
                            disposition pour vous répondre.
                        </p>

                        <div className={styles.contactGrid}>
                            <a
                                href="tel:+33684908750"
                                className={styles.contactCard}
                                aria-label="Téléphoner au club"
                            >
                                <span className={styles.contactLabel}>
                                    Téléphone
                                </span>
                                <span className={styles.contactValue}>
                                    06 84 90 87 50
                                </span>
                                <span className={styles.contactHint}>
                                    Du lundi au samedi · 9h00 à 18h00
                                </span>
                            </a>

                            <a
                                href="mailto:clubcaninbeauchamp@hotmail.com"
                                className={styles.contactCard}
                                aria-label="Envoyer un email au club"
                            >
                                <span className={styles.contactLabel}>
                                    Email
                                </span>
                                <span className={styles.contactValue}>
                                    clubcaninbeauchamp@hotmail.com
                                </span>
                            </a>

                            <a
                                href="https://www.google.com/maps/search/?api=1&query=49.003558,2.212043"
                                target="_blank"
                                rel="noreferrer"
                                className={styles.contactCard}
                                aria-label="Ouvrir l’adresse sur Google Maps"
                            >
                                <span className={styles.contactLabel}>
                                    Adresse
                                </span>
                                <span className={styles.contactValue}>
                                    49 Chaussée Jules César
                                </span>
                                <span className={styles.contactHint}>
                                    95250 Beauchamp · Voir l’itinéraire
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
