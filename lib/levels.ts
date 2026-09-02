export const MEMBER_LEVELS = [
    "chiot",
    "premier_cours",
    "ruban_violet",
    "ruban_bleu",
    "ruban_blanc",
    "ruban_rouge",
    "ruban_noir",
    "equipe",
] as const;

export type MemberLevel = (typeof MEMBER_LEVELS)[number];

/** Vérifie si le niveau du membre est >= au niveau minimum requis */
export function meetsMinLevel(
    memberLevel: MemberLevel,
    minLevel: MemberLevel,
): boolean {
    return MEMBER_LEVELS.indexOf(memberLevel) >= MEMBER_LEVELS.indexOf(minLevel);
}
