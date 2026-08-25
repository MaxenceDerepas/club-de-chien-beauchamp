import Image from "next/image";
import { requireMemberSession } from "@/lib/member-auth";
import { logoutMemberAction } from "@/app/login/actions";
import {
    preregisterForEventAction,
    preregisterForHealthCourseAction,
    cancelHealthCourseRegistrationAction,
} from "./actions";
import { listPublishedUpcomingEvents } from "@/lib/events";
import { listPublishedUpcomingHealthCourses } from "@/lib/health-courses";
import { listMembers } from "@/lib/members";
import { listAlbums } from "@/lib/gallery";
import { listEvents } from "@/lib/events";
import MemberGallery from "./MemberGallery";
import EventCard, {
    type EventCardData,
    type EventCardMemberInfo,
} from "@/components/EventCard";
import HealthCourseCalendar, {
    type CalendarSession,
    type CalendarMemberInfo,
} from "@/components/HealthCourseCalendar";
import MobileNav from "@/components/MobileNav";
import homeStyles from "@/app/home.module.css";
import styles from "./membre.module.css";

export const dynamic = "force-dynamic";

function getNavItems(showHealthCourse: boolean) {
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
        { href: "#documentation", label: "Documentation", dotClass: "dotPurple" },
        { href: "#contacts", label: "Contacts", dotClass: "dotPurple" },
        { href: "/", label: "Page Visiteur", dotClass: "dotWhite" },
    ];
    return items;
}

type DocumentationCategory = {
    id: string;
    title: string;
    icon: "heart" | "education";
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
];

export default async function MembrePage() {
    const member = await requireMemberSession();
    const displayName = member.dogName || member.firstName || "Adhérent";
    const avatarSrc = member.dogPhotoUrl?.trim() || null;
    const memberId = member._id?.toString();
    const hasHealthCourse = member.healthCourse ?? false;
    const hasObedience = member.obedience ?? false;

    const [allAlbums, allEvents, events] = await Promise.all([
        listAlbums(),
        listEvents(),
        listPublishedUpcomingEvents(),
    ]);

    // Filter albums: "all" visible to everyone, "event" only if member is registered
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
        ? await listPublishedUpcomingHealthCourses()
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

    const allMembers = await listMembers();
    const memberInfoById: Record<string, CalendarMemberInfo> = {};
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
                        {getNavItems(hasHealthCourse).map((item) => (
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

                    <MobileNav items={[
                        ...getNavItems(hasHealthCourse),
                        { href: "/login", label: "Se déconnecter", dotClass: "dotWhite" },
                    ]} />
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
                    </div>
                    <h2 className={styles.memberName}>{displayName}</h2>
                </aside>

                <div className={styles.main}>
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
                            eventCards.map((card) => (
                                <EventCard
                                    key={card.id}
                                    event={card}
                                    currentMemberId={memberId || ""}
                                    currentMemberLevel={member.level}
                                    memberInfoById={eventMemberInfoById}
                                    preregisterAction={
                                        preregisterForEventAction
                                    }
                                />
                            ))
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
                </div>
            </div>
        </main>
    );
}
