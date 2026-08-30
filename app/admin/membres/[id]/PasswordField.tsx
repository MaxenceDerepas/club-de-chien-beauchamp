"use client";

import { useState } from "react";
import styles from "../membres.module.css";

function generatePassword() {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let pwd = "";
    for (let i = 0; i < 8; i++) {
        pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    return pwd;
}

export default function PasswordField() {
    const [password, setPassword] = useState("");

    return (
        <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
                Nouveau mot de passe
            </label>

            <div className={styles.passwordField}>
                <input
                    id="password"
                    name="password"
                    type="text"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Laisser vide pour ne pas changer"
                    style={{
                        fontFamily: "monospace",
                        fontSize: "1.1rem",
                        letterSpacing: "0.1em",
                    }}
                />

                <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setPassword(generatePassword())}
                >
                    Générer
                </button>
            </div>

            <p className={styles.hint}>
                {password
                    ? "Un mail sera envoyé à l’adhérent avec le nouveau mot de passe."
                    : "Laisse vide pour conserver l’ancien mot de passe."}
            </p>
        </div>
    );
}
