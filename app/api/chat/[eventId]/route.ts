import { NextRequest, NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/member-auth";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getMessagesByEvent, addMessage } from "@/lib/chat";
import { getEventById } from "@/lib/events";

type RouteContext = { params: Promise<{ eventId: string }> };

async function isMemberApprovedForEvent(
    eventId: string,
    memberId: string,
): Promise<boolean> {
    const event = await getEventById(eventId);
    if (!event) return false;
    return event.registrations.some(
        (r) => r.memberId === memberId && r.status === "approved",
    );
}

export async function GET(request: NextRequest, context: RouteContext) {
    const member = await getCurrentMember();
    const isAdmin = await isAdminAuthenticated();

    if (!member && !isAdmin) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { eventId } = await context.params;
    if (!eventId) {
        return NextResponse.json(
            { error: "ID événement manquant" },
            { status: 400 },
        );
    }

    if (member && !isAdmin) {
        const approved = await isMemberApprovedForEvent(
            eventId,
            member._id?.toString() || "",
        );
        if (!approved) {
            return NextResponse.json(
                { error: "Inscription non validée pour cet événement" },
                { status: 403 },
            );
        }
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
        Number.parseInt(searchParams.get("limit") || "100", 10) || 100,
        500,
    );

    const messages = await getMessagesByEvent(eventId, limit);

    const serialized = messages.map((m) => ({
        _id: m._id?.toString(),
        eventId: m.eventId,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        text: m.text,
        createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({ messages: serialized });
}

export async function POST(request: NextRequest, context: RouteContext) {
    const member = await getCurrentMember();
    const isAdmin = await isAdminAuthenticated();

    if (!member && !isAdmin) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { eventId } = await context.params;
    if (!eventId) {
        return NextResponse.json(
            { error: "ID événement manquant" },
            { status: 400 },
        );
    }

    if (member && !isAdmin) {
        const approved = await isMemberApprovedForEvent(
            eventId,
            member._id?.toString() || "",
        );
        if (!approved) {
            return NextResponse.json(
                { error: "Inscription non validée pour cet événement" },
                { status: 403 },
            );
        }
    }

    let body: { text?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Corps de requête invalide" },
            { status: 400 },
        );
    }

    const text = (body.text || "").trim();
    if (!text) {
        return NextResponse.json(
            { error: "Le message ne peut pas être vide" },
            { status: 400 },
        );
    }

    if (text.length > 2000) {
        return NextResponse.json(
            { error: "Message trop long (2000 caractères max)" },
            { status: 400 },
        );
    }

    let senderId: string;
    let senderName: string;
    let senderRole: "member" | "admin";

    if (member) {
        senderId = member._id?.toString() || "";
        senderName =
            [member.firstName, member.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() ||
            member.dogName ||
            "Adhérent";
        senderRole = "member";
    } else {
        senderId = "admin";
        senderName = "Équipe du club";
        senderRole = "admin";
    }

    const message = await addMessage({
        eventId,
        senderId,
        senderName,
        senderRole,
        text,
    });

    return NextResponse.json({
        message: {
            _id: message._id?.toString(),
            eventId: message.eventId,
            senderId: message.senderId,
            senderName: message.senderName,
            senderRole: message.senderRole,
            text: message.text,
            createdAt: message.createdAt.toISOString(),
        },
    });
}
