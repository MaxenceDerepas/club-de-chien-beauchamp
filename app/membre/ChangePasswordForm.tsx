"use client";

import { useState } from "react";
import { changePasswordAction } from "./actions";
import styles from "./membre.module.css";

export default function ChangePasswordForm() {
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setStatus("idle");
        setMessage("");

        const form = e.currentTarget;
        const formData = new FormData(form);

        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (newPassword.length < 4) {
            setStatus("error");
            setMessage("Le nouveau mot de passe doit contenir au moins 4 caractères.");
            setIsPending(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus("error");
            setMessage("Les mots de passe ne correspondent pas.");
            setIsPending(false);
            return;
        }

        try {
            const result = await changePasswordAction(formData);
            if (result.success) {
                setStatus("success");
                setMessage("Mot de passe modifié avec succès.");
                form.reset();
            } else {
                setStatus("error");
                setMessage(result.error || "Erreur lors de la modification.");
            }
        } catch {
            setStatus("error");
            setMessage("Erreur lors de la modification.");
        }

        setIsPending(false);
    }

    return (
        <form onSubmit={handleSubmit} className={styles.passwordForm}>
            <div className={styles.passwordFields}>
                <div className={styles.passwordFieldGroup}>
                    <label htmlFor="currentPassword" className={styles.passwordLabel}>
                        Mot de passe actuel
                    </label>
                    <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        required
                        className={styles.passwordInput}
                    />
                </div>

                <div className={styles.passwordFieldGroup}>
                    <label htmlFor="newPassword" className={styles.passwordLabel}>
                        Nouveau mot de passe
                    </label>
                    <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        minLength={4}
                        className={styles.passwordInput}
                    />
                </div>

                <div className={styles.passwordFieldGroup}>
                    <label htmlFor="confirmPassword" className={styles.passwordLabel}>
                        Confirmer le nouveau mot de passe
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={4}
                        className={styles.passwordInput}
                    />
                </div>
            </div>

            {status === "success" && (
                <p className={styles.passwordSuccess}>{message}</p>
            )}
            {status === "error" && (
                <p className={styles.passwordError}>{message}</p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className={styles.passwordSubmit}
            >
                {isPending ? "Modification..." : "Modifier le mot de passe"}
            </button>
        </form>
    );
}
