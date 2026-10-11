"use server";

import { ObjectId } from "mongodb";
import { getMembersCollection } from "@/lib/members";
import { hashMemberPassword } from "@/lib/member-auth";
import {
    validatePasswordResetToken,
    markTokenAsUsed,
} from "@/lib/password-reset";

export type ResetPasswordState = {
    error?: string;
    success?: boolean;
};

export async function resetPasswordAction(
    _prevState: ResetPasswordState,
    formData: FormData,
): Promise<ResetPasswordState> {
    const token = String(formData.get("token") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!token) {
        return { error: "Token manquant." };
    }

    if (!password || password.length < 6) {
        return {
            error: "Le mot de passe doit contenir au moins 6 caractères.",
        };
    }

    if (password !== confirmPassword) {
        return { error: "Les mots de passe ne correspondent pas." };
    }

    const memberId = await validatePasswordResetToken(token);
    if (!memberId) {
        return {
            error: "Ce lien de réinitialisation est expiré ou a déjà été utilisé. Veuillez refaire une demande.",
        };
    }

    try {
        const collection = await getMembersCollection();
        const { salt, hash } = hashMemberPassword(password);

        await collection.updateOne(
            { _id: new ObjectId(memberId) },
            {
                $set: {
                    passwordHash: hash,
                    passwordSalt: salt,
                    hasChangedPassword: true,
                    updatedAt: new Date(),
                },
            },
        );

        await markTokenAsUsed(token);
    } catch (err) {
        console.error("Password reset error:", err);
        return {
            error: "Une erreur est survenue. Merci de réessayer plus tard.",
        };
    }

    return { success: true };
}
