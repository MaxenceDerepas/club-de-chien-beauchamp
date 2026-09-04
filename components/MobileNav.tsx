"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./mobile-nav.module.css";

type NavItem = {
    href: string;
    label: string;
    dotClass: string;
    sublabel?: string;
};

type Props = {
    items: NavItem[];
    logoutAction?: () => void | Promise<void>;
};

export default function MobileNav({ items, logoutAction }: Props) {
    const [open, setOpen] = useState(false);

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const handleResize = () => {
            if (window.innerWidth > 980) setOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [open]);

    /* Lock body scroll when open */
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                className={styles.burger}
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={open}
            >
                <span className={`${styles.burgerLine} ${open ? styles.burgerLineOpen1 : ""}`} />
                <span className={`${styles.burgerLine} ${open ? styles.burgerLineOpen2 : ""}`} />
                <span className={`${styles.burgerLine} ${open ? styles.burgerLineOpen3 : ""}`} />
            </button>

            {open && <div className={styles.backdrop} onClick={close} />}

            <nav className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}>
                {items.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className={styles.drawerItem}
                        onClick={close}
                    >
                        <span className={`${styles.dot} ${styles[item.dotClass]}`} />
                        <span className={styles.drawerTextBlock}>
                            <span className={styles.drawerLabel}>{item.label}</span>
                            {item.sublabel && (
                                <span className={styles.drawerSublabel}>{item.sublabel}</span>
                            )}
                        </span>
                    </a>
                ))}
                {logoutAction && (
                    <form action={logoutAction} className={styles.logoutForm}>
                        <button type="submit" className={styles.drawerItem} onClick={close}>
                            <span className={`${styles.dot} ${styles.dotWhite}`} />
                            <span className={styles.drawerTextBlock}>
                                <span className={styles.drawerLabel}>Se déconnecter</span>
                            </span>
                        </button>
                    </form>
                )}
            </nav>
        </>
    );
}
