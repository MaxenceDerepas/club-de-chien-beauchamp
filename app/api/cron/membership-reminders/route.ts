import { NextRequest, NextResponse } from "next/server";
import { sendMembershipReminders } from "@/lib/membership-reminders";

export async function GET(request: NextRequest) {
    // Verify the request comes from Vercel Cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await sendMembershipReminders();

        console.log("Membership reminders result:", JSON.stringify(result));

        return NextResponse.json({
            ok: true,
            sent30days: result.sent30,
            sent7days: result.sent7,
            errors: result.errors,
        });
    } catch (err) {
        console.error("Membership reminders cron error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
