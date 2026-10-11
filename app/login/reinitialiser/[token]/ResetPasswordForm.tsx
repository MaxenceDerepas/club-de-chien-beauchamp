"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordState } from "./actions";
import styles from "../../login.module.css";

const initialState: ResetPasswordState = {};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className={styles.button} disabled={pending}>
            {pending ? "Mise à jour…" : "Valider le nouveau mot de passe"}
        </button>
    );
}

export default function ResetPasswordForm({ token }: { token: string }) {
    const [state, formAction] = useActionState(resetPasswordAction, initialState);
    const [showPassword, setShowPassword] = useState(false);

    if (state.success) {
        return (
            <div>
                <div
                    style={{
                        padding: "16px 14px",
                        background: "rgba(90, 255, 130, 0.15)",
                        border: "2px solid rgba(130, 255, 170, 0.6)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        textAlign: "center",
                        lineHeight: 1.5,
                    }}
                >
                    Votre mot de passe a été mis à jour avec succès.
                </div>
                <p style={{ textAlign: "center", marginTop: 18 }}>
                    <Link
                        href="/login"
                        style={{
                            color: "white",
                            textDecoration: "underline",
                            opacity: 0.9,
                            fontWeight: 700,
                        }}
                    >
                        Se connecter
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <form className={styles.form} action={formAction}>
            <input type="hidden" name="token" value={token} />

            <div className={styles.field}>
                <label htmlFor="password">Nouveau mot de passe</label>
                <div className={styles.passwordRow}>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Votre nouveau mot de passe"
                        autoComplete="new-password"
                        required
                        minLength={6}
                    />
                    <button
                        type="button"
                        className={styles.togglePassword}
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                            showPassword
                                ? "Masquer le mot de passe"
                                : "Afficher le mot de passe"
                        }
                    >
                        {showPassword ? "Masquer" : "Afficher"}
                    </button>
                </div>
            </div>

            <div className={styles.field}>
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    autoComplete="new-password"
                    required
                    minLength={6}
                />
            </div>

            {state.error ? (
                <p className={styles.error} role="alert">
                    {state.error}
                </p>
            ) : null}

            <SubmitButton />
        </form>
    );
}
