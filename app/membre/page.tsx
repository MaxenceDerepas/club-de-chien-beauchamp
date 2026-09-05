import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireMemberSession } from "@/lib/member-auth";
import { logoutMemberAction } from "@/app/login/actions";
import {
    preregisterForEventAction,
    preregisterForHealthCourseAction,
    cancelHealthCourseRegistrationAction,
    preregisterForObedienceAction,
    cancelObedienceRegistrationAction,
    markAbsentObedienceAction,
    markNotificationsReadAction,
} from "./actions";
import { listPublishedUpcomingEvents } from "@/lib/events";
import { listHealthCourses } from "@/lib/health-courses";
import { listObedienceSessions } from "@/lib/obedience";
import { listMembers } from "@/lib/members";
import { listAlbums } from "@/lib/gallery";
import { getMemberAnnouncement } from "@/lib/content";
import { listEvents } from "@/lib/events";
import MemberGallery from "./MemberGallery";
import ChangePasswordForm from "./ChangePasswordForm";
import { type EventCardData, type EventCardMemberInfo } from "@/components/EventCard";
import EventCarousel from "@/components/EventCarousel";
import HealthCourseCalendar, {
    type CalendarSession,
    type CalendarMemberInfo,
} from "@/components/HealthCourseCalendar";
import ObedienceCalendar, {
    type ObedienceCalendarSession,
    type ObedienceMemberInfo,
} from "@/components/ObedienceCalendar";
import AdminNotifications from "@/components/AdminNotifications";
import { getUnreadNotifications } from "@/lib/notifications";
import MobileNav from "@/components/MobileNav";
import homeStyles from "@/app/home.module.css";
import styles from "./membre.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Espace membre",
    robots: { index: false, follow: false },
};

function getNavItems(showHealthCourse: boolean, showObedience: boolean, isAdmin: boolean) {
    const items = [
        { href: "#galerie", label: "Galerie", dotClass: "dotGreen" },
        { href: "#evenement", label: "Évènement", dotClass: "dotYellow" },
        ...(showHealthCourse
            ? [
                  {
                      href: "#parcours",
                      label: "Parcours de santé",
                      dotClass: "dotPink",
                  },
              ]
            : []),
        ...(showObedience
            ? [
                  {
                      href: "#obeissance",
                      label: "Obéissance",
                      dotClass: "dotPurple",
                  },
              ]
            : []),
        { href: "#documentation", label: "Documentation", dotClass: "dotPurple" },
        { href: "#contacts", label: "Contacts", dotClass: "dotPurple" },
        { href: "#compte", label: "Mon compte", dotClass: "dotWhite" },
        ...(isAdmin
            ? [{ href: "/admin", label: "Administration", dotClass: "dotYellow" }]
            : []),
        { href: "/", label: "Page Visiteur", dotClass: "dotWhite" },
    ];
    return items;
}

type DocumentationCategory = {
    id: string;
    title: string;
    icon: "heart" | "education" | "document";
    documents: { id: string; title: string; fileUrl: string }[];
};

const documentationCategories: DocumentationCategory[] = [
    {
        id: "sante",
        title: "Santé & bien-être",
        icon: "heart",
        documents: [
            {
                id: "fortes-temperatures",
                title: "Conseils pratiques pour gérer les fortes températures",
                fileUrl: "#",
            },
            {
                id: "tiques",
                title: "Prévention : les tiques",
                fileUrl: "#",
            },
            {
                id: "epillet",
                title: "Le danger de l'épillet",
                fileUrl: "#",
            },
        ],
    },
    {
        id: "education",
        title: "L'éducation au quotidien",
        icon: "education",
        documents: [],
    },
    {
        id: "pv",
        title: "Procès-verbaux",
        icon: "document",
        documents: [
            {
                id: "pv-ago-2025",
                title: "PV Assemblée Générale Ordinaire — 30 novembre 2025",
                fileUrl: "https://res.cloudinary.com/t2c5ip49/image/upload/v1788111369/12-PV_DE_L_AGO_CBEC_DU_30_11_2025.pdf",
            },
            {
                id: "pv-age-2025",
                title: "PV Assemblée Générale Extraordinaire — 30 novembre 2025",
                fileUrl: "https://res.cloudinary.com/t2c5ip49/image/upload/v1788111331/11-PV_DE_L_AGE_CBEC_DU_30_11_2025.pdf",
            },
            {
                id: "pv-ago-2024",
                title: "PV Assemblée Générale Ordinaire — 15 décembre 2024",
                fileUrl: "https://res.cloudinary.com/t2c5ip49/image/upload/v1788111353/10-PV_AGO_Beauchamp_15122024.pdf",
            },
        ],
    },
];

export default async function MembrePage() {
    const member = await requireMemberSession();
    const displayName = member.dogName || member.firstName || "Adhérent";
    const avatarSrc = member.dogPhotoUrl?.trim() || null;
    const memberId = member._id?.toString();
    const isAdmin = member.isAdmin ?? false;
    const hasHealthCourse = isAdmin || (member.healthCourse ?? false);
    const hasObedience = isAdmin || (member.obedience ?? false);

    const [allAlbums, allEvents, events, memberAnnouncement] = await Promise.all([
        listAlbums(),
        listEvents(),
        listPublishedUpcomingEvents(),
        getMemberAnnouncement(),
    ]);

    // Admin notifications
    const adminNotifications = isAdmin && memberId
        ? (await getUnreadNotifications(memberId)).map((n) => ({
              id: n._id!.toString(),
              message: n.message,
              link: n.link,
              createdAt: n.createdAt.toISOString(),
          }))
        : [];

    // Filter albums: "all" visible to everyone, "event" only if member is registered, "members" only if in allowedMemberIds
    const visibleAlbums = allAlbums
        .filter((album) => {
            if (album.visibility === "all") return true;
            if (album.visibility === "event" && album.eventId) {
                const event = allEvents.find(
                    (e) => e._id?.toString() === album.eventId,
                );
                if (!event) return false;
                return event.registrations?.some(
                    (r: { memberId: string; status: string }) =>
                        r.memberId === memberId &&
                        (r.status === "approved" || r.status === "pending"),
                );
            }
            if (album.visibility === "members" && album.allowedMemberIds) {
                return album.allowedMemberIds.includes(memberId || "");
            }
            return false;
        })
        .filter((album) => album.photos.length > 0)
        .map((album) => ({
            id: album._id?.toString() ?? "",
            title: album.title,
            coverUrl: album.coverUrl || album.photos[0]?.imageUrl || "",
            photoCount: album.photos.length,
            photos: album.photos.map((p) => ({
                id: p.id,
                imageUrl: p.imageUrl,
            })),
        }));
    const healthCourses = hasHealthCourse
        ? await listHealthCourses()
        : [];

    const calendarSessions: CalendarSession[] = healthCourses
        .filter((s) => s.sessionDate)
        .map((s) => ({
            id: s._id?.toString() ?? "",
            sessionDate: new Date(s.sessionDate as Date).toISOString(),
            title: s.title,
            maxParticipants: s.maxParticipants,
            registrations: s.registrations.map((r) => ({
                memberId: r.memberId,
                memberName: r.memberName,
                status: r.status,
            })),
        }));

    // Obedience sessions
    const obedienceRaw = hasObedience
        ? await listObedienceSessions()
        : [];

    const obedienceSessions: ObedienceCalendarSession[] = obedienceRaw
        .map((s) => ({
            id: s._id?.toString() ?? "",
            sessionDate: new Date(s.sessionDate).toISOString(),
            dayOfWeek: s.dayOfWeek,
            time: s.time,
            registrations: s.registrations.map((r) => ({
                memberId: r.memberId,
                memberName: r.memberName,
                status: r.status,
            })),
        }));

    const allMembers = await listMembers();
    const memberInfoById: Record<string, CalendarMemberInfo> = {};
    const obedienceMemberInfoById: Record<string, ObedienceMemberInfo> = {};
    const eventMemberInfoById: Record<string, EventCardMemberInfo> = {};
    for (const m of allMembers) {
        if (!m._id) continue;
        const id = m._id.toString();
        memberInfoById[id] = {
            dogName: m.dogName || "",
            dogPhotoUrl: m.dogPhotoUrl || "",
            level: m.level,
            healthCourse: m.healthCourse ?? false,
            obedience: m.obedience ?? false,
        };
        obedienceMemberInfoById[id] = {
            dogName: m.dogName || "",
            dogPhotoUrl: m.dogPhotoUrl || "",
            level: m.level,
            healthCourse: m.healthCourse ?? false,
            obedience: m.obedience ?? false,
        };
        eventMemberInfoById[id] = {
            dogName: m.dogName || "",
            dogPhotoUrl: m.dogPhotoUrl || "",
            level: m.level,
            healthCourse: m.healthCourse ?? false,
            obedience: m.obedience ?? false,
        };
    }

    const eventCards: EventCardData[] = events.map((e) => ({
        id: e._id?.toString() ?? "",
        title: e.title,
        eventDate: e.eventDate ? new Date(e.eventDate).toISOString() : null,
        registrationDeadline: e.registrationDeadline
            ? new Date(e.registrationDeadline).toISOString()
            : null,
        description: e.description,
        imageUrl: e.imageUrl || "",
        minLevel: e.minLevel,
        maxParticipants: e.maxParticipants,
        registrations: e.registrations.map((r) => ({
            memberId: r.memberId,
            memberName: r.memberName,
            memberLevel: r.memberLevel,
            status: r.status,
        })),
    }));

    return (
        <main className={styles.pageBlue}>
            <header className={homeStyles.header}>
                <div className={`${homeStyles.headerInner} ${styles.headerInnerNoLogo}`}>
                    <nav className={homeStyles.nav}>
                        {getNavItems(hasHealthCourse, hasObedience, isAdmin).map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className={homeStyles.navItem}
                            >
                                <span
                                    className={`${homeStyles.dot} ${
                                        homeStyles[
                                            item.dotClass as keyof typeof homeStyles
                                        ]
                                    }`}
                                />
                                <span className={homeStyles.navTextBlock}>
                                    <span className={homeStyles.navLabel}>
                                        {item.label}
                                    </span>
                                </span>
                            </a>
                        ))}
                        <form
                            action={logoutMemberAction}
                            className={styles.logoutForm}
                        >
                            <button
                                type="submit"
                                className={`${homeStyles.navItem} ${styles.logoutButton}`}
                            >
                                <span
                                    className={`${homeStyles.dot} ${homeStyles.dotWhite}`}
                                />
                                <span className={homeStyles.navTextBlock}>
                                    <span className={homeStyles.navLabel}>
                                        Se déconnecter
                                    </span>
                                </span>
                            </button>
                        </form>
                    </nav>

                    <MobileNav
                        items={getNavItems(hasHealthCourse, hasObedience, isAdmin)}
                        logoutAction={logoutMemberAction}
                    />
                </div>
            </header>

            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatarWrap}>
                            {avatarSrc ? (
                                <Image
                                    src={avatarSrc}
                                    alt={displayName}
                                    fill
                                    className={styles.avatar}
                                />
                            ) : (
                                <div
                                    className={styles.avatarPlaceholder}
                                    aria-label={displayName}
                                >
                                    <svg
                                        viewBox="0 0 64 64"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <circle cx="20" cy="22" r="6" />
                                        <circle cx="44" cy="22" r="6" />
                                        <circle cx="11" cy="34" r="5" />
                                        <circle cx="53" cy="34" r="5" />
                                        <path d="M32 34c-9 0-16 7-16 14 0 5 4 8 9 8 3 0 5-1 7-1s4 1 7 1c5 0 9-3 9-8 0-7-7-14-16-14z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {isAdmin ? (
                            <span
                                className={styles.avatarTagAdmin}
                                title="Administrateur"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/logo-club.png"
                                    alt="Administrateur"
                                />
                            </span>
                        ) : (
                            <>
                                {hasHealthCourse && (
                                    <span
                                        className={styles.avatarTagHealth}
                                        title="Parcours de santé"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/images/Tag-Parcours-de-sante.png"
                                            alt="Parcours de santé"
                                        />
                                    </span>
                                )}
                                {hasObedience && (
                                    <span
                                        className={styles.avatarTagObedience}
                                        title="Obéissance"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/images/Tag-Obeissance.png"
                                            alt="Obéissance"
                                        />
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    <h2 className={styles.memberName}>{displayName}</h2>
                    {isAdmin && (
                        <>
                            <Link href="/admin" className={styles.adminLink}>
                                Espace administrateur
                            </Link>
                            <AdminNotifications
                                notifications={adminNotifications}
                                markReadAction={markNotificationsReadAction}
                            />
                        </>
                    )}
                </aside>

                <div className={styles.main}>
                    {memberAnnouncement.enabled && memberAnnouncement.text.trim() && (
                        <div className={styles.memberAnnouncementBox}>
                            <span className={styles.memberAnnouncementBadge}>
                                Info club
                            </span>
                            <p className={styles.memberAnnouncementText}>
                                {memberAnnouncement.text}
                            </p>
                        </div>
                    )}

                    <section id="galerie" className={styles.gallerySection}>
                        <h1 className={styles.sectionTitle}>GALERIE</h1>
                        <MemberGallery albums={visibleAlbums} />
                    </section>

                    <section id="evenement" className={styles.eventSection}>
                        {events.length === 0 ? (
                            <div className={styles.eventCard}>
                                <p className={styles.eventEmpty}>
                                    Aucun évènement à venir pour le moment.
                                </p>
                            </div>
                        ) : (
                            <EventCarousel
                                events={eventCards}
                                currentMemberId={memberId || ""}
                                currentMemberLevel={member.level}
                                memberInfoById={eventMemberInfoById}
                                preregisterAction={preregisterForEventAction}
                            />
                        )}
                    </section>

                    {hasHealthCourse && (
                        <section
                            id="parcours"
                            className={styles.eventSection}
                        >
                            <HealthCourseCalendar
                                sessions={calendarSessions}
                                currentMemberId={memberId || ""}
                                memberInfoById={memberInfoById}
                                preregisterAction={
                                    preregisterForHealthCourseAction
                                }
                                cancelAction={
                                    cancelHealthCourseRegistrationAction
                                }
                            />
                        </section>
                    )}

                    {hasObedience && (
                        <section
                            id="obeissance"
                            className={styles.eventSection}
                        >
                            <ObedienceCalendar
                                sessions={obedienceSessions}
                                currentMemberId={memberId || ""}
                                memberInfoById={obedienceMemberInfoById}
                                preregisterAction={
                                    preregisterForObedienceAction
                                }
                                cancelAction={
                                    cancelObedienceRegistrationAction
                                }
                                absentAction={
                                    markAbsentObedienceAction
                                }
                            />
                        </section>
                    )}

                    <section
                        id="documentation"
                        className={styles.eventSection}
                    >
                        <div className={styles.docWrapper}>
                            <aside className={styles.docSidebar}>
                                <h2 className={styles.docSidebarTitle}>
                                    DOCUMENTATION
                                </h2>
                            </aside>
                            <div className={styles.docMain}>
                                {documentationCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className={styles.docCategory}
                                    >
                                        <div className={styles.docCategoryHeader}>
                                            <span
                                                className={styles.docCategoryIcon}
                                                aria-hidden="true"
                                            >
                                                {category.icon === "heart" ? (
                                                    <svg
                                                        viewBox="0 0 32 32"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M16 28s-10-5.5-10-14c0-3.3 2.7-6 6-6 2 0 3.5 1 4 2 .5-1 2-2 4-2 3.3 0 6 2.7 6 6 0 8.5-10 14-10 14z"
                                                            fill="#ef6b6b"
                                                        />
                                                        <path
                                                            d="M8 16h3l1.5-3 2 6 1.5-5 1.5 3H21"
                                                            stroke="#ffffff"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            fill="none"
                                                        />
                                                    </svg>
                                                ) : category.icon === "document" ? (
                                                    <svg
                                                        viewBox="0 0 32 32"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M8 4h10l8 8v16a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V4z"
                                                            stroke="#ffffff"
                                                            strokeWidth="1.5"
                                                            fill="none"
                                                        />
                                                        <path
                                                            d="M18 4v8h8"
                                                            stroke="#ffffff"
                                                            strokeWidth="1.5"
                                                            fill="none"
                                                        />
                                                        <line x1="12" y1="18" x2="22" y2="18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                                                        <line x1="12" y1="22" x2="20" y2="22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        viewBox="0 0 32 32"
                                                        fill="none"
                                                    >
                                                        <circle
                                                            cx="16"
                                                            cy="16"
                                                            r="14"
                                                            stroke="#ffffff"
                                                            strokeWidth="1.5"
                                                            fill="none"
                                                        />
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="1.8"
                                                            fill="#ffffff"
                                                        />
                                                        <path
                                                            d="M10 22c0-3 2-5 4-5s4 2 4 5"
                                                            stroke="#ffffff"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            fill="none"
                                                        />
                                                        <path
                                                            d="M18 20c.5-1.5 2-2.5 3.5-2.5s3 1 3.5 2.5"
                                                            stroke="#ffffff"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            fill="none"
                                                        />
                                                        <circle
                                                            cx="21.5"
                                                            cy="14"
                                                            r="1.5"
                                                            fill="#ffffff"
                                                        />
                                                    </svg>
                                                )}
                                            </span>
                                            <h3
                                                className={styles.docCategoryTitle}
                                            >
                                                {category.title}
                                            </h3>
                                        </div>
                                        {category.documents.length > 0 ? (
                                            <ul className={styles.docList}>
                                                {category.documents.map((doc) => (
                                                    <li
                                                        key={doc.id}
                                                        className={styles.docItem}
                                                    >
                                                        <a
                                                            href={doc.fileUrl}
                                                            className={
                                                                styles.docLink
                                                            }
                                                            download
                                                        >
                                                            <span
                                                                className={
                                                                    styles.docDownloadIcon
                                                                }
                                                                aria-hidden="true"
                                                            >
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                    <polyline points="7 10 12 15 17 10" />
                                                                    <line
                                                                        x1="12"
                                                                        y1="15"
                                                                        x2="12"
                                                                        y2="3"
                                                                    />
                                                                </svg>
                                                            </span>
                                                            <span
                                                                className={
                                                                    styles.docLabel
                                                                }
                                                            >
                                                                {doc.title}
                                                            </span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="compte" className={styles.eventSection}>
                        <h1 className={styles.sectionTitle}>MON COMPTE</h1>
                        <div className={styles.accountCard}>
                            <h3 className={styles.accountSubtitle}>Modifier mon mot de passe</h3>
                            <ChangePasswordForm />
                        </div>
                    </section>

                    <section id="contacts" className={homeStyles.contactsSection}>
                        <div className={homeStyles.contactsInner}>
                            <h2 className={homeStyles.contactsTitle}>CONTACTS</h2>

                            <div className={homeStyles.contactsContent}>
                                <p className={homeStyles.contactsIntro}>
                                    Une question sur nos cours, l&apos;adhésion ou le
                                    fonctionnement du club ? Notre équipe est à votre
                                    disposition pour vous répondre.
                                </p>

                                <div className={homeStyles.contactGrid}>
                                    <a
                                        href="tel:+33684908750"
                                        className={homeStyles.contactCard}
                                        aria-label="Téléphoner au club"
                                    >
                                        <span className={homeStyles.contactLabel}>
                                            Téléphone
                                        </span>
                                        <span className={homeStyles.contactValue}>
                                            06 84 90 87 50
                                        </span>
                                        <span className={homeStyles.contactHint}>
                                            Du lundi au samedi · 9h00 à 18h00
                                        </span>
                                    </a>

                                    <a
                                        href="mailto:clubcaninbeauchamp@hotmail.com"
                                        className={homeStyles.contactCard}
                                        aria-label="Envoyer un email au club"
                                    >
                                        <span className={homeStyles.contactLabel}>
                                            Email
                                        </span>
                                        <span className={homeStyles.contactValue}>
                                            clubcaninbeauchamp@hotmail.com
                                        </span>
                                    </a>

                                    <a
                                        href="https://www.google.com/maps/search/?api=1&query=49.003558,2.212043"
                                        target="_blank"
                                        rel="noreferrer"
                                        className={homeStyles.contactCard}
                                        aria-label="Ouvrir l'adresse sur Google Maps"
                                    >
                                        <span className={homeStyles.contactLabel}>
                                            Adresse
                                        </span>
                                        <span className={homeStyles.contactValue}>
                                            49 Chaussée Jules César
                                        </span>
                                        <span className={homeStyles.contactHint}>
                                            95250 Beauchamp · Voir l&apos;itinéraire
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
