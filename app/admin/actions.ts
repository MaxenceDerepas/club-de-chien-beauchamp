"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    adminSession,
    createSessionCookieValue,
    verifyCredentials,
} from "@/lib/admin-auth";

export async function loginAdmin(formData: FormData) {
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!verifyCredentials(username, password)) {
        redirect("/admin?error=1");
    }

    const cookieStore = await cookies();

    cookieStore.set(adminSession.name, createSessionCookieValue(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: adminSession.maxAge,
    });

    redirect("/admin");
}

export async function logoutAdmin() {
    const cookieStore = await cookies();

    cookieStore.set(adminSession.name, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    redirect("/admin");
}
