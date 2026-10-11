import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";
import styles from "../login.module.css";

export const metadata: Metadata = {
    title: "Mot de passe oublié",
    robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Mot de passe oublié</h1>
                <p className={styles.subtitle}>
                    Saisissez votre identifiant. Un email contenant un lien de
                    réinitialisation vous sera envoyé.
                </p>

                <ForgotPasswordForm />

                <p
                    style={{
                        textAlign: "center",
                        marginTop: 18,
                        fontSize: "0.9rem",
                    }}
                >
                    <Link
                        href="/login"
                        style={{
                            color: "white",
                            textDecoration: "underline",
                            opacity: 0.9,
                        }}
                    >
                        ← Retour à la connexion
                    </Link>
                </p>
            </div>
        </main>
    );
}
