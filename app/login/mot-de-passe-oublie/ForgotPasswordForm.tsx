"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordResetAction, type ForgotPasswordState } from "./actions";
import styles from "../login.module.css";

const initialState: ForgotPasswordState = {};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className={styles.button} disabled={pending}>
            {pending ? "Envoi en cours…" : "Envoyer le lien"}
        </button>
    );
}

export default function ForgotPasswordForm() {
    const [state, formAction] = useActionState(
        requestPasswordResetAction,
        initialState,
    );

    if (state.success) {
        return (
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
                Si un compte correspond à cet identifiant, un email de
                réinitialisation a été envoyé. Vérifiez votre boîte de
                réception (et vos spams).
            </div>
        );
    }

    return (
        <form className={styles.form} action={formAction}>
            <div className={styles.field}>
                <label htmlFor="identifier">Identifiant</label>
                <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder="Votre identifiant"
                    autoComplete="username"
                    required
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
