"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./image-cluster.module.css";

const images = [
    {
        id: 0,
        src: "/images/club-1.png",
        alt: "Photo du club 1",
    },
    {
        id: 1,
        src: "/images/club-2.png",
        alt: "Photo du club 2",
    },
    {
        id: 2,
        src: "/images/club-3.png",
        alt: "Photo du club 3",
    },
    {
        id: 3,
        src: "/images/club-4.png",
        alt: "Photo du club 4",
    },
    {
        id: 4,
        src: "/images/club-5.png",
        alt: "Photo du club 5",
    },
];

export default function ImageCluster() {
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    /* ── Mobile carousel state ── */
    const [currentSlide, setCurrentSlide] = useState(0);
    const touchStartX = useRef(0);
    const touchDeltaX = useRef(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 980px)");
        const handler = (e: MediaQueryListEvent | MediaQueryList) =>
            setIsMobile(e.matches);
        handler(mq);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchDeltaX.current = 0;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    }, []);

    const handleTouchEnd = useCallback(() => {
        const threshold = 50;
        if (touchDeltaX.current < -threshold) {
            setCurrentSlide((prev) => Math.min(prev + 1, images.length - 1));
        } else if (touchDeltaX.current > threshold) {
            setCurrentSlide((prev) => Math.max(prev - 1, 0));
        }
    }, []);

    /* ── Auto-play for mobile ── */
    useEffect(() => {
        if (!isMobile) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [isMobile, currentSlide]);

    return (
        <section className={styles.wrapper}>
            <div className={styles.inner}>
                {/* Desktop: hover chevrons */}
                <div
                    className={styles.gallerySide}
                    onMouseLeave={() => setHoveredId(null)}
                >
                    <div className={styles.chevronRow}>
                        {images.map((img, index) => {
                            const isHovered = hoveredId === img.id;
                            const isShrunk = hoveredId !== null && !isHovered;

                            return (
                                <div
                                    key={img.id}
                                    className={[
                                        styles.chevronCard,
                                        index === 0
                                            ? styles.chevronFirst
                                            : index === images.length - 1
                                              ? styles.chevronLast
                                              : styles.chevronMiddle,
                                        styles[`chevron${index}`],
                                        isHovered ? styles.chevronHovered : "",
                                        isShrunk ? styles.chevronShrunk : "",
                                    ].join(" ")}
                                    onMouseEnter={() => setHoveredId(img.id)}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img.src}
                                        alt={img.alt}
                                        className={styles.chevronImage}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile: swipeable carousel */}
                <div
                    className={styles.carousel}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className={styles.carouselTrack}
                        style={{
                            transform: `translateX(-${currentSlide * 100}%)`,
                        }}
                    >
                        {images.map((img) => (
                            <div key={img.id} className={styles.carouselSlide}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img.src}
                                    alt={img.alt}
                                    className={styles.carouselImage}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.carouselDots}>
                        {images.map((img, i) => (
                            <button
                                key={img.id}
                                type="button"
                                className={`${styles.carouselDot} ${i === currentSlide ? styles.carouselDotActive : ""}`}
                                onClick={() => setCurrentSlide(i)}
                                aria-label={`Image ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.messagePanel}>
                    <h2>ACCUEIL</h2>
                    <p>
                        Notre{" "}
                        <span className={styles.messagePanelInfo}>
                            équipe de bénévoles accueille
                        </span>{" "}
                        les chiens de tout âge et de toute race les samedis
                        après-midi et dimanches matins
                    </p>
                    <p>
                        Lors de{" "}
                        <span className={styles.messagePanelInfo}>
                            cours collectifs
                        </span>
                        , notre objectif est de vous aider à mieux comprendre
                        votre compagnon tout en développant une relation
                        harmonieuse
                    </p>
                    <p>
                        Nous vous invitons à venir nous rencontrer le{" "}
                        <span className={styles.messagePanelInfo}>
                            samedi à 14h
                        </span>
                    </p>
                </div>
            </div>
        </section>
    );
}
