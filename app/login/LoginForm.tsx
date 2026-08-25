"use client";

import { useActionState } from "react";
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
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
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
