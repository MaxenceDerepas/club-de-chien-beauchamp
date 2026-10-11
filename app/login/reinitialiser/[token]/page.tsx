import type { Metadata } from "next";
import Link from "next/link";
import { validatePasswordResetToken } from "@/lib/password-reset";
import ResetPasswordForm from "./ResetPasswordForm";
import styles from "../../login.module.css";

export const metadata: Metadata = {
    title: "Réinitialiser le mot de passe",
    robots: { index: false, follow: false },
};

type Props = {
    params: Promise<{ token: string }>;
};

export default async function ResetPasswordPage({ params }: Props) {
    const { token } = await params;

    const memberId = await validatePasswordResetToken(token);

    if (!memberId) {
        return (
            <main className={styles.page}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Lien invalide</h1>
                    <p className={styles.subtitle}>
                        Ce lien de réinitialisation est expiré ou a déjà été
                        utilisé. Veuillez refaire une demande.
                    </p>
                    <p style={{ textAlign: "center" }}>
                        <Link
                            href="/login/mot-de-passe-oublie"
                            style={{
                                color: "white",
                                textDecoration: "underline",
                                opacity: 0.9,
                            }}
                        >
                            Nouvelle demande
                        </Link>
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Nouveau mot de passe</h1>
                <p className={styles.subtitle}>
                    Choisissez votre nouveau mot de passe.
                </p>

                <ResetPasswordForm token={token} />
            </div>
        </main>
    );
}
