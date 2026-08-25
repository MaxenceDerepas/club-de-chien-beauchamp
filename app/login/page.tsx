import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/member-auth";
import LoginForm from "./LoginForm";
import styles from "./login.module.css";

export default async function LoginPage() {
    const member = await getCurrentMember();
    if (member) {
        redirect("/membre");
    }

    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Espace adhérent</h1>
                <p className={styles.subtitle}>
                    Connectez-vous pour accéder à votre espace personnel.
                </p>

                <LoginForm />
            </div>
        </main>
    );
}
