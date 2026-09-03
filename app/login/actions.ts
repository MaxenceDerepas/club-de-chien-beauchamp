"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    authenticateMember,
    createMemberSessionCookieValue,
    memberSession,
} from "@/lib/member-auth";

export type LoginState = {
    error?: string;
};

export async function loginMemberAction(
    _prevState: LoginState,
    formData: FormData,
): Promise<LoginState> {
    const identifier = String(formData.get("identifier") ?? "");
    const password = String(formData.get("password") ?? "");

    if (!identifier || !password) {
        return { error: "Veuillez renseigner vos identifiants." };
    }

    let member;
    try {
        member = await authenticateMember(identifier, password);
    } catch (err) {
        console.error("Member login error", err);
        return {
            error: "Une erreur est survenue. Merci de réessayer plus tard.",
        };
    }

    if (!member || !member._id) {
        return { error: "Identifiant ou mot de passe incorrect." };
    }

    const cookieStore = await cookies();
    cookieStore.set({
        name: memberSession.name,
        value: createMemberSessionCookieValue(member._id.toString()),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: memberSession.maxAge,
    });

    redirect("/membre");
}

export async function logoutMemberAction() {
    const cookieStore = await cookies();
    cookieStore.delete({ name: memberSession.name, path: "/" });
    redirect("/login");
}
