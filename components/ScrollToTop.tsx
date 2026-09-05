"use client";

import { useState, useEffect } from "react";
import styles from "./scroll-to-top.module.css";

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function onScroll() {
            setVisible(window.scrollY > 400);
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    function scrollUp() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (!visible) return null;

    return (
        <button
            type="button"
            className={styles.btn}
            onClick={scrollUp}
            aria-label="Retour en haut"
        >
            ↑
        </button>
    );
}
