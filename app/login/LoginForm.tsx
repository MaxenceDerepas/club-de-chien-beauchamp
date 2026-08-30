"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginMemberAction, type LoginState } from "./actions";
import styles from "./login.module.css";

const initialState: LoginState = {};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className={styles.button} disabled={pending}>
            {pending ? "Connexion…" : "Se connecter"}
        </button>
    );
}

export default function LoginForm() {
    const [state, formAction] = useActionState(loginMemberAction, initialState);
    const [showPassword, setShowPassword] = useState(false);

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

            <div className={styles.field}>
                <label htmlFor="password">Mot de passe</label>
                <div className={styles.passwordRow}>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Votre mot de passe"
                        autoComplete="current-password"
                        required
                    />
                    <button
                        type="button"
                        className={styles.togglePassword}
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                        {showPassword ? "Masquer" : "Afficher"}
                    </button>
                </div>
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
