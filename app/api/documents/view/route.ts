import { NextRequest, NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/member-auth";

const MIME_TYPES: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    txt: "text/plain",
    csv: "text/csv",
};

function getMimeType(url: string): string {
    const ext = url.split(".").pop()?.toLowerCase() || "";
    return MIME_TYPES[ext] || "application/octet-stream";
}

function getFilename(url: string): string {
    const parts = url.split("/");
    return parts[parts.length - 1] || "document";
}

export async function GET(request: NextRequest) {
    // Require member authentication
    const member = await getCurrentMember();
    if (!member) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const url = request.nextUrl.searchParams.get("url");
    if (!url || !url.includes("cloudinary.com")) {
        return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return NextResponse.json(
                { error: "Fichier introuvable" },
                { status: 404 },
            );
        }

        const buffer = await response.arrayBuffer();
        const contentType = getMimeType(url);
        const filename = getFilename(url);

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${filename}"`,
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Erreur lors du chargement du fichier" },
            { status: 500 },
        );
    }
}
