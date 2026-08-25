import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "club_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

function getEnv(name: string) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

const ADMIN_USERNAME = () => getEnv("ADMIN_USERNAME");
const ADMIN_PASSWORD = () => getEnv("ADMIN_PASSWORD");
const ADMIN_SESSION_SECRET = () => getEnv("ADMIN_SESSION_SECRET");

type SessionPayload = {
    username: string;
    exp: number;
};

function sign(value: string) {
    return createHmac("sha256", ADMIN_SESSION_SECRET())
        .update(value)
        .digest("hex");
}

export function verifyCredentials(username: string, password: string) {
    return username === ADMIN_USERNAME() && password === ADMIN_PASSWORD();
}

export function createSessionCookieValue() {
    const payload: SessionPayload = {
        username: ADMIN_USERNAME(),
        exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = sign(encoded);

    return `${encoded}.${signature}`;
}

export function verifySessionCookieValue(cookieValue?: string | null) {
    if (!cookieValue) return false;

    const [encoded, signature] = cookieValue.split(".");
    if (!encoded || !signature) return false;

    const expectedSignature = sign(encoded);

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) return false;
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return false;

    try {
        const payload = JSON.parse(
            Buffer.from(encoded, "base64url").toString("utf8"),
        ) as SessionPayload;

        if (!payload?.exp) return false;

        return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
        return false;
    }
}

export async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return verifySessionCookieValue(sessionValue);
}

export async function requireAdminSession() {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
        redirect("/admin");
    }
}

export const adminSession = {
    name: SESSION_COOKIE_NAME,
    maxAge: SESSION_DURATION_SECONDS,
};
