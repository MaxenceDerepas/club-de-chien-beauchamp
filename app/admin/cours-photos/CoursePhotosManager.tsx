"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    COURSE_IDS,
    COURSE_LABELS,
    type CourseId,
    type CourseImage,
} from "@/lib/course-constants";
import {
    uploadCoursePhoto,
    deleteCoursePhoto,
    reorderCoursePhotos,
} from "./actions";
import styles from "./cours-photos.module.css";

type Props = {
    initialData: Record<string, CourseImage[]>;
};

export default function CoursePhotosManager({ initialData }: Props) {
    const router = useRouter();
    const [activeCourse, setActiveCourse] = useState<CourseId>("chiots");
    const [data, setData] = useState<Record<string, CourseImage[]>>(initialData);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragIndexRef = useRef<number | null>(null);

    const images = data[activeCourse] ?? [];

    const handleTabClick = (courseId: CourseId) => {
        setActiveCourse(courseId);
        setError("");
    };

    const handleUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            setUploading(true);
            setError("");

            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.set("courseId", activeCourse);
                formData.set("file", file);

                const result = await uploadCoursePhoto(formData);
                if (result.error) {
                    setError(result.error);
                    break;
                }
                if (result.success && result.image) {
                    setData((prev) => ({
                        ...prev,
                        [activeCourse]: [
                            ...(prev[activeCourse] ?? []),
                            { url: result.image.url, publicId: result.image.publicId },
                        ],
                    }));
                }
            }

            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            router.refresh();
        },
        [activeCourse, router],
    );

    const handleDelete = useCallback(
        async (publicId: string) => {
            if (!confirm("Supprimer cette photo ?")) return;

            const formData = new FormData();
            formData.set("courseId", activeCourse);
            formData.set("publicId", publicId);

            const result = await deleteCoursePhoto(formData);
            if (result.error) {
                setError(result.error);
                return;
            }

            setData((prev) => ({
                ...prev,
                [activeCourse]: (prev[activeCourse] ?? []).filter(
                    (img) => img.publicId !== publicId,
                ),
            }));
            router.refresh();
        },
        [activeCourse, router],
    );

    /* ── Drag-and-drop reorder ── */
    const handleDragStart = (index: number) => {
        dragIndexRef.current = index;
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragIndexRef.current === null || dragIndexRef.current === index) return;

        const from = dragIndexRef.current;
        const newImages = [...images];
        const [moved] = newImages.splice(from, 1);
        newImages.splice(index, 0, moved);

        setData((prev) => ({ ...prev, [activeCourse]: newImages }));
        dragIndexRef.current = index;
    };

    const handleDragEnd = useCallback(async () => {
        dragIndexRef.current = null;

        const currentImages = data[activeCourse] ?? [];
        if (currentImages.length < 2) return;

        const formData = new FormData();
        formData.set("courseId", activeCourse);
        formData.set("order", JSON.stringify(currentImages.map((img) => img.publicId)));

        await reorderCoursePhotos(formData);
        router.refresh();
    }, [activeCourse, data, router]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <a href="/admin" className={styles.backLink}>
                    ← Retour
                </a>
                <h1 className={styles.title}>Photos des cours</h1>
            </div>

            {/* Course tabs */}
            <div className={styles.tabs}>
                {COURSE_IDS.map((id) => (
                    <button
                        key={id}
                        type="button"
                        className={`${styles.tab} ${activeCourse === id ? styles.tabActive : ""}`}
                        onClick={() => handleTabClick(id)}
                    >
                        {COURSE_LABELS[id]}
                    </button>
                ))}
            </div>

            {/* Upload */}
            <div className={styles.uploadArea}>
                <label className={styles.uploadLabel}>
                    + Ajouter des photos
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className={styles.hiddenInput}
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
                {uploading && (
                    <span className={styles.uploadStatus}>Upload en cours...</span>
                )}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <p className={styles.hint}>
                Glissez-déposez les photos pour modifier l&apos;ordre. La première photo est celle affichée par défaut.
            </p>

            {/* Photo grid */}
            {images.length === 0 ? (
                <p className={styles.empty}>
                    Aucune photo configurée pour ce cours.
                    <br />
                    Les photos par défaut du site seront utilisées.
                </p>
            ) : (
                <div className={styles.grid}>
                    {images.map((img, index) => (
                        <div
                            key={img.publicId}
                            className={styles.photoCard}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                        >
                            <span className={styles.photoOrder}>{index + 1}</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={img.url}
                                alt={`Photo ${index + 1}`}
                                className={styles.photoImg}
                            />
                            <button
                                type="button"
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(img.publicId)}
                                title="Supprimer"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
