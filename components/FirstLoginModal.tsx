"use client";

import { useState } from "react";
import { changePasswordAction } from "@/app/membre/actions";
import styles from "./first-login-modal.module.css";

export default function FirstLoginModal() {
    const [open, setOpen] = useState(true);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [isPending, setIsPending] = useState(false);

    if (!open) return null;

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
            setMessage("Le mot de passe doit contenir au moins 4 caractères.");
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
                setMessage("Mot de passe modifié !");
                setTimeout(() => setOpen(false), 1200);
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
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>Bienvenue !</h2>
                <p className={styles.text}>
                    C&apos;est votre première connexion. Nous vous recommandons
                    de modifier votre mot de passe pour sécuriser votre compte.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="fl-currentPassword" className={styles.label}>
                            Mot de passe actuel
                        </label>
                        <input
                            id="fl-currentPassword"
                            name="currentPassword"
                            type="password"
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="fl-newPassword" className={styles.label}>
                            Nouveau mot de passe
                        </label>
                        <input
                            id="fl-newPassword"
                            name="newPassword"
                            type="password"
                            required
                            minLength={4}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="fl-confirmPassword" className={styles.label}>
                            Confirmer le nouveau mot de passe
                        </label>
                        <input
                            id="fl-confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={4}
                            className={styles.input}
                        />
                    </div>

                    {status === "success" && (
                        <p className={styles.success}>{message}</p>
                    )}
                    {status === "error" && (
                        <p className={styles.error}>{message}</p>
                    )}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.skipBtn}
                            onClick={() => setOpen(false)}
                        >
                            Plus tard
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className={styles.submitBtn}
                        >
                            {isPending ? "Modification..." : "Modifier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
