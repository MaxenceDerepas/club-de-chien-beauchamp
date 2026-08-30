import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminSession, verifySessionCookieValue } from "@/lib/admin-auth";
import { getCurrentMember } from "@/lib/member-auth";
import { saveMemberAnnouncement } from "@/lib/content";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const sessionValue = cookieStore.get(adminSession.name)?.value;
        const isAdminSession = verifySessionCookieValue(sessionValue);

        const member = await getCurrentMember();
        const isMemberAdmin = member?.isAdmin ?? false;

        if (!isAdminSession && !isMemberAdmin) {
            return NextResponse.json(
                { success: false, error: "Non autorisé." },
                { status: 401 },
            );
        }

        const body = await req.json();
        const text = String(body?.text || "").trim();
        const enabled = Boolean(body?.enabled);

        await saveMemberAnnouncement({ text, enabled });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}
