/**
 * Course constants and types — safe to import from client components.
 * No MongoDB or server-only dependencies.
 */

export type CourseImage = {
    url: string;
    publicId: string;
};

/** The 7 course IDs used on the homepage */
export const COURSE_IDS = [
    "chiots",
    "premiers",
    "ados",
    "collectif",
    "evenements",
    "obeissance",
    "ring",
] as const;

export type CourseId = (typeof COURSE_IDS)[number];

export const COURSE_LABELS: Record<CourseId, string> = {
    chiots: "L'école des chiots",
    premiers: "Premiers cours",
    ados: "Cours \"ados\"",
    collectif: "Cours collectif",
    evenements: "Événements",
    obeissance: "Obéissance",
    ring: "Ring",
};
