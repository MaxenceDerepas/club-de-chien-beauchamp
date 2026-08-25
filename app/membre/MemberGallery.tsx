"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./membre.module.css";

type Photo = {
    id: string;
    imageUrl: string;
};

type Album = {
    id: string;
    title: string;
    coverUrl: string;
    photoCount: number;
    photos: Photo[];
};

type Props = {
    albums: Album[];
};

export default function MemberGallery({ albums }: Props) {
    const [openAlbumId, setOpenAlbumId] = useState<string | null>(null);
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

    const openAlbum = albums.find((a) => a.id === openAlbumId) ?? null;

    if (albums.length === 0) {
        return (
            <div className={styles.galleryEmpty}>
                <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    aria-hidden="true"
                    className={styles.galleryEmptyIcon}
                >
                    <rect
                        x="8"
                        y="12"
                        width="48"
                        height="40"
                        rx="4"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    />
                    <circle
                        cx="22"
                        cy="26"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    />
                    <path
                        d="M14 46l12-12 10 10 6-6 8 8"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <p className={styles.galleryEmptyText}>
                    La galerie est vide pour le moment.
                </p>
            </div>
        );
    }

    // Album detail view
    if (openAlbum) {
        return (
            <>
                <div className={styles.albumDetailHeader}>
                    <button
                        type="button"
                        className={styles.albumBackBtn}
                        onClick={() => {
                            setOpenAlbumId(null);
                            setLightboxIdx(null);
                        }}
                    >
                        ← Retour aux albums
                    </button>
                    <h2 className={styles.albumDetailTitle}>
                        {openAlbum.title}
                    </h2>
                </div>

                <div className={styles.albumPhotosGrid}>
                    {openAlbum.photos.map((photo, idx) => (
                        <div
                            key={photo.id}
                            className={styles.albumPhotoCard}
                            onClick={() => setLightboxIdx(idx)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setLightboxIdx(idx);
                                }
                            }}
                        >
                            <Image
                                src={photo.imageUrl}
                                alt={`${openAlbum.title} - ${idx + 1}`}
                                fill
                                className={styles.albumPhotoImg}
                            />
                        </div>
                    ))}
                </div>

                {/* Lightbox */}
                {lightboxIdx !== null && (
                    <div
                        className={styles.lightbox}
                        onClick={() => setLightboxIdx(null)}
                    >
                        <div
                            className={styles.lightboxContent}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                className={styles.lightboxClose}
                                onClick={() => setLightboxIdx(null)}
                            >
                                ✕
                            </button>

                            {openAlbum.photos.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`}
                                        onClick={() =>
                                            setLightboxIdx((prev) =>
                                                prev === null
                                                    ? 0
                                                    : prev === 0
                                                      ? openAlbum.photos
                                                            .length - 1
                                                      : prev - 1,
                                            )
                                        }
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`}
                                        onClick={() =>
                                            setLightboxIdx((prev) =>
                                                prev === null
                                                    ? 0
                                                    : prev ===
                                                        openAlbum.photos
                                                            .length -
                                                            1
                                                      ? 0
                                                      : prev + 1,
                                            )
                                        }
                                    >
                                        ›
                                    </button>
                                </>
                            )}

                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={openAlbum.photos[lightboxIdx].imageUrl}
                                alt={`${openAlbum.title} - ${lightboxIdx + 1}`}
                                className={styles.lightboxImg}
                            />

                            <span className={styles.lightboxCounter}>
                                {lightboxIdx + 1} / {openAlbum.photos.length}
                            </span>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Albums grid view
    return (
        <div className={styles.galleryGrid}>
            {albums.map((album) => (
                <article
                    key={album.id}
                    className={styles.galleryCard}
                    onClick={() => setOpenAlbumId(album.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpenAlbumId(album.id);
                        }
                    }}
                >
                    <div className={styles.galleryCardHeader}>
                        <h3 className={styles.galleryCardTitle}>
                            {album.title}
                        </h3>
                        <span className={styles.galleryCategoryTag}>
                            {album.photoCount} photo
                            {album.photoCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className={styles.galleryImageWrap}>
                        <Image
                            src={album.coverUrl}
                            alt={album.title}
                            fill
                            className={styles.galleryImage}
                        />
                    </div>
                </article>
            ))}
        </div>
    );
}
