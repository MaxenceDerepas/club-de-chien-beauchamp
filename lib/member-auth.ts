import {
    createHmac,
    randomBytes,
    scryptSync,
    timingSafeEqual,
} from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getMembersCollection } from "@/lib/members";

const MEMBER_SESSION_COOKIE_NAME = "club_member_session";
const MEMBER_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret() {
    const value =
        process.env.MEMBER_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET;
    if (!value) {
        throw new Error(
            "Missing environment variable: MEMBER_SESSION_SECRET (or ADMIN_SESSION_SECRET)",
        );
    }
    return value;
}

type MemberSessionPayload = {
    id: string;
    exp: number;
};

function sign(value: string) {
    return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function createMemberSessionCookieValue(memberId: string) {
    const payload: MemberSessionPayload = {
        id: memberId,
        exp: Math.floor(Date.now() / 1000) + MEMBER_SESSION_DURATION_SECONDS,
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${encoded}.${sign(encoded)}`;
}

function parseMemberSessionCookieValue(cookieValue?: string | null) {
    if (!cookieValue) return null;
    const [encoded, signature] = cookieValue.split(".");
    if (!encoded || !signature) return null;

    const expected = sign(encoded);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;

    try {
        const payload = JSON.parse(
            Buffer.from(encoded, "base64url").toString("utf8"),
        ) as MemberSessionPayload;
        if (!payload?.exp || !payload?.id) return null;
        if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch {
        return null;
    }
}

export async function authenticateMember(
    identifier: string,
    password: string,
) {
    const username = identifier.trim().toLowerCase();
    if (!username || !password) return null;

    const collection = await getMembersCollection();
    const member = await collection.findOne({ usernameLower: username });
    if (!member) return null;
    if (!member.siteAccessEnabled) return null;
    if (!member.passwordHash || !member.passwordSalt) return null;

    const ok = verifyMemberPassword(
        password,
        member.passwordSalt,
        member.passwordHash,
    );
    if (!ok) return null;
    return member;
}

export async function getCurrentMember() {
    const cookieStore = await cookies();
    const raw = cookieStore.get(MEMBER_SESSION_COOKIE_NAME)?.value;
    const payload = parseMemberSessionCookieValue(raw);
    if (!payload) return null;

    if (!ObjectId.isValid(payload.id)) return null;
    const collection = await getMembersCollection();
    const member = await collection.findOne({ _id: new ObjectId(payload.id) });
    if (!member || !member.siteAccessEnabled) return null;
    return member;
}

export async function requireMemberSession() {
    const member = await getCurrentMember();
    if (!member) {
        redirect("/login");
    }
    return member;
}

export const memberSession = {
    name: MEMBER_SESSION_COOKIE_NAME,
    maxAge: MEMBER_SESSION_DURATION_SECONDS,
};


export function hashMemberPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = scryptSync(password, salt, 64).toString("hex");

    return {
        salt,
        hash: derivedKey,
    };
}

export function verifyMemberPassword(
    password: string,
    salt: string,
    storedHash: string,
) {
    const derivedKey = scryptSync(password, salt, 64);
    const storedBuffer = Buffer.from(storedHash, "hex");

    if (derivedKey.length !== storedBuffer.length) return false;

    return timingSafeEqual(derivedKey, storedBuffer);
}
