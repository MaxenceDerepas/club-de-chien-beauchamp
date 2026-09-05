import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminSession, verifySessionCookieValue } from "@/lib/admin-auth";
import { getCurrentMember } from "@/lib/member-auth";
import clientPromise from "@/lib/mongodb";

export async function POST() {
    // Verify admin access
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(adminSession.name)?.value;
    const isAdminSession = verifySessionCookieValue(sessionValue);
    const member = await getCurrentMember();
    const isMemberAdmin = member?.isAdmin ?? false;

    if (!isAdminSession && !isMemberAdmin) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("club-canin");

    const healthResult = await db.collection("health_courses").updateMany(
        {},
        { $pull: { registrations: { status: "pending" } } as any },
    );

    const eventResult = await db.collection("events").updateMany(
        {},
        { $pull: { registrations: { status: "pending" } } as any },
    );

    const obedResult = await db.collection("obedience_sessions").updateMany(
        {},
        { $pull: { registrations: { status: "pending" } } as any },
    );

    return NextResponse.json({
        success: true,
        healthCourses: healthResult.modifiedCount,
        events: eventResult.modifiedCount,
        obedience: obedResult.modifiedCount,
    });
}
