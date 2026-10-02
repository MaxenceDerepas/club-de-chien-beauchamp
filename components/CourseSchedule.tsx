"use client";

import { useState } from "react";
import styles from "./course-schedule.module.css";

export default function CourseSchedule() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                className={styles.widgetButton}
                onClick={() => setOpen(true)}
                title="Horaires des cours"
                aria-label="Voir les horaires des cours"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.widgetIcon}
                >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className={styles.widgetLabel}>Horaires des cours</span>
            </button>

            {open && (
                <div className={styles.overlay} onClick={() => setOpen(false)}>
                    <div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={() => setOpen(false)}
                            aria-label="Fermer"
                        >
                            ✕
                        </button>

                        <div className={styles.columns}>
                            <div className={styles.dayColumn}>
                                <h4 className={styles.dayTitle}>SAMEDI</h4>

                                <div className={styles.timeBlock}>
                                    <span className={styles.timeLabel}>
                                        De 14h30 à 15h00 :
                                    </span>
                                    <ul className={styles.courseList}>
                                        <li>École des chiots</li>
                                        <li>Cours adolescents</li>
                                        <li>Premiers cours</li>
                                    </ul>
                                </div>

                                <div className={styles.timeBlock}>
                                    <span className={styles.timeLabel}>
                                        De 15h00 à 16h00 :
                                    </span>
                                    <ul className={styles.courseList}>
                                        <li>Cours collectif</li>
                                    </ul>
                                </div>
                            </div>

                            <div className={styles.divider} />

                            <div className={styles.dayColumn}>
                                <h4 className={styles.dayTitle}>DIMANCHE</h4>

                                <div className={styles.timeBlock}>
                                    <span className={styles.timeLabel}>
                                        De 9h00 à 9h30 :
                                    </span>
                                    <ul className={styles.courseList}>
                                        <li>École des chiots</li>
                                        <li>Cours adolescents</li>
                                        <li>Premiers cours</li>
                                    </ul>
                                </div>

                                <div className={styles.timeBlock}>
                                    <span className={styles.timeLabel}>
                                        De 9h30 à 10h30 :
                                    </span>
                                    <ul className={styles.courseList}>
                                        <li>Cours collectif</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
