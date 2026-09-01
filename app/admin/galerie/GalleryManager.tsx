"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    createAlbumAction,
    deleteAlbumAction,
    uploadSinglePhotoAction,
    deletePhotoFromAlbumAction,
    setCoverAction,
} from "./actions";
import styles from "./galerie.module.css";

type AlbumPhoto = {
    id: string;
    imageUrl: string;
};

type Album = {
    id: string;
    title: string;
    visibility: "all" | "event" | "members";
    eventId: string;
    eventTitle: string;
    allowedMemberIds: string[];
    allowedMemberNames: string[];
    coverUrl: string;
    photoCount: number;
    photos: AlbumPhoto[];
    createdAt: string;
};

type EventOption = {
    id: string;
    title: string;
    date: string;
};

type MemberOption = {
    id: string;
    name: string;
    dogName: string;
};

type Props = {
    albums: Album[];
    events: EventOption[];
    members: MemberOption[];
};

export default function GalleryManager({ albums, events, members }: Props) {
    const [createState, createAction, isCreating] = useActionState(
        createAlbumAction,
        null,
    );
    const [openAlbumId, setOpenAlbumId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [deletingAlbumId, setDeletingAlbumId] = useState<string | null>(null);
    const [visibility, setVisibility] = useState<"all" | "event" | "members">("all");
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [memberSearch, setMemberSearch] = useState("");

    const openAlbum = albums.find((a) => a.id === openAlbumId) ?? null;

    return (
        <>
            {/* Create album form */}
            <div className={styles.uploadSection}>
                <h3 className={styles.uploadTitle}>Créer un album</h3>
                <form action={createAction} className={styles.uploadForm}>
                    <div className={styles.uploadFields}>
                        <div className={styles.field}>
                            <label htmlFor="title" className={styles.label}>
                                Titre de l&apos;album *
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                className={styles.input}
                                required
                                placeholder="Ex: Photos du cours du 15 juin"
                            />
                        </div>

                        <div className={styles.field}>
                            <label
                                htmlFor="visibility"
                                className={styles.label}
                            >
                                Visibilité
                            </label>
                            <select
                                id="visibility"
                                name="visibility"
                                className={styles.select}
                                value={visibility}
                                onChange={(e) => {
                                    setVisibility(
                                        e.target.value as "all" | "event" | "members",
                                    );
                                    if (e.target.value !== "members") {
                                        setSelectedMemberIds([]);
                                        setMemberSearch("");
                                    }
                                }}
                            >
                                <option value="all">
                                    Tous les adhérents
                                </option>
                                <option value="event">
                                    Inscrits à un événement
                                </option>
                                <option value="members">
                                    Adhérents spécifiques
                                </option>
                            </select>
                        </div>

                        {visibility === "event" && (
                            <div className={styles.field}>
                                <label
                                    htmlFor="eventId"
                                    className={styles.label}
                                >
                                    Événement lié
                                </label>
                                <select
                                    id="eventId"
                                    name="eventId"
                                    className={styles.select}
                                    required
                                >
                                    <option value="">
                                        -- Choisir un événement --
                                    </option>
                                    {events.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.title}
                                            {e.date ? ` (${e.date})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {visibility === "members" && (
                            <div className={`${styles.field} ${styles.fieldFull}`}>
                                <label className={styles.label}>
                                    Adhérents autorisés
                                </label>

                                {selectedMemberIds.length > 0 && (
                                    <div className={styles.selectedMembers}>
                                        {selectedMemberIds.map((mid) => {
                                            const m = members.find((x) => x.id === mid);
                                            return (
                                                <span key={mid} className={styles.memberChip}>
                                                    {m ? `${m.name} (${m.dogName})` : mid}
                                                    <button
                                                        type="button"
                                                        className={styles.memberChipRemove}
                                                        onClick={() =>
                                                            setSelectedMemberIds((prev) =>
                                                                prev.filter((id) => id !== mid),
                                                            )
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}

                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Rechercher un adhérent…"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                />

                                {memberSearch.trim() && (
                                    <div className={styles.memberDropdown}>
                                        {members
                                            .filter(
                                                (m) =>
                                                    !selectedMemberIds.includes(m.id) &&
                                                    (`${m.name} ${m.dogName}`
                                                        .toLowerCase()
                                                        .includes(memberSearch.toLowerCase())),
                                            )
                                            .slice(0, 10)
                                            .map((m) => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    className={styles.memberDropdownItem}
                                                    onClick={() => {
                                                        setSelectedMemberIds((prev) => [...prev, m.id]);
                                                        setMemberSearch("");
                                                    }}
                                                >
                                                    {m.name} — {m.dogName}
                                                </button>
                                            ))}
                                        {members.filter(
                                            (m) =>
                                                !selectedMemberIds.includes(m.id) &&
                                                (`${m.name} ${m.dogName}`
                                                    .toLowerCase()
                                                    .includes(memberSearch.toLowerCase())),
                                        ).length === 0 && (
                                            <div className={styles.memberDropdownEmpty}>
                                                Aucun résultat
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedMemberIds.map((mid) => (
                                    <input
                                        key={mid}
                                        type="hidden"
                                        name="allowedMemberIds"
                                        value={mid}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={styles.uploadButton}
                        disabled={isCreating}
                    >
                        {isCreating ? "Création..." : "Créer l'album"}
                    </button>

                    {createState?.error && (
                        <p className={styles.errorMsg}>{createState.error}</p>
                    )}
                    {createState?.success && (
                        <p className={styles.successMsg}>Album créé !</p>
                    )}
                </form>
            </div>

            {/* Albums list or album detail */}
            {openAlbum ? (
                <div className={styles.albumDetail}>
                    <div className={styles.albumDetailHeader}>
                        <div>
                            <h3 className={styles.albumDetailTitle}>
                                {openAlbum.title}
                            </h3>
                            <span className={styles.visibilityBadge}>
                                {openAlbum.visibility === "all"
                                    ? "Tous les adhérents"
                                    : openAlbum.visibility === "event"
                                      ? `Inscrits : ${openAlbum.eventTitle}`
                                      : `${openAlbum.allowedMemberNames.length} adhérent(s) spécifiques`}
                            </span>
                        </div>
                        <button
                            type="button"
                            className={styles.backBtn}
                            onClick={() => setOpenAlbumId(null)}
                        >
                            ← Retour aux albums
                        </button>
                    </div>

                    {/* Upload photos to album */}
                    <div className={styles.photoUploadRow}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className={styles.input}
                        />
                        <button
                            type="button"
                            className={styles.uploadButton}
                            disabled={isUploading}
                            onClick={async () => {
                                const files = fileInputRef.current?.files;
                                if (!files || files.length === 0) {
                                    setUploadError("Sélectionnez au moins une photo.");
                                    return;
                                }
                                setIsUploading(true);
                                setUploadError("");
                                setUploadSuccess("");
                                let uploaded = 0;
                                let lastError = "";
                                for (let i = 0; i < files.length; i++) {
                                    setUploadProgress(`${i + 1} / ${files.length}...`);
                                    const fd = new FormData();
                                    fd.set("photo", files[i]);
                                    const result = await uploadSinglePhotoAction(openAlbum.id, fd);
                                    if (result.error) {
                                        lastError = result.error;
                                    } else {
                                        uploaded++;
                                    }
                                }
                                setIsUploading(false);
                                setUploadProgress("");
                                if (lastError && uploaded === 0) {
                                    setUploadError(lastError);
                                } else if (lastError) {
                                    setUploadSuccess(`${uploaded} photo${uploaded > 1 ? "s" : ""} ajoutée${uploaded > 1 ? "s" : ""} (certaines ont échoué).`);
                                } else {
                                    setUploadSuccess(`${uploaded} photo${uploaded > 1 ? "s" : ""} ajoutée${uploaded > 1 ? "s" : ""} !`);
                                }
                                if (fileInputRef.current) fileInputRef.current.value = "";
                                router.refresh();
                            }}
                        >
                            {isUploading ? `Upload ${uploadProgress}` : "Ajouter les photos"}
                        </button>
                        {uploadError && (
                            <span className={styles.errorMsg}>{uploadError}</span>
                        )}
                        {uploadSuccess && (
                            <span className={styles.successMsg}>{uploadSuccess}</span>
                        )}
                    </div>

                    {/* Photos grid */}
                    {openAlbum.photos.length === 0 ? (
                        <p className={styles.empty}>
                            Aucune photo dans cet album.
                        </p>
                    ) : (
                        <div className={styles.photosGrid}>
                            {openAlbum.photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className={styles.photoCard}
                                >
                                    <div className={styles.photoImageWrap}>
                                        <Image
                                            src={photo.imageUrl}
                                            alt=""
                                            fill
                                            className={styles.photoImage}
                                        />
                                        {openAlbum.coverUrl ===
                                            photo.imageUrl && (
                                            <span className={styles.coverBadge}>
                                                Couverture
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.photoActions}>
                                        {openAlbum.coverUrl !==
                                            photo.imageUrl && (
                                            <form action={setCoverAction}>
                                                <input
                                                    type="hidden"
                                                    name="albumId"
                                                    value={openAlbum.id}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="imageUrl"
                                                    value={photo.imageUrl}
                                                />
                                                <button
                                                    type="submit"
                                                    className={
                                                        styles.setCoverBtn
                                                    }
                                                >
                                                    Définir couverture
                                                </button>
                                            </form>
                                        )}
                                        <form
                                            action={deletePhotoFromAlbumAction}
                                        >
                                            <input
                                                type="hidden"
                                                name="albumId"
                                                value={openAlbum.id}
                                            />
                                            <input
                                                type="hidden"
                                                name="photoId"
                                                value={photo.id}
                                            />
                                            <input
                                                type="hidden"
                                                name="imageUrl"
                                                value={photo.imageUrl}
                                            />
                                            <button
                                                type="submit"
                                                className={styles.deleteBtn}
                                            >
                                                Supprimer
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {albums.length === 0 ? (
                        <p className={styles.empty}>
                            Aucun album créé pour le moment.
                        </p>
                    ) : (
                        <div className={styles.albumsGrid}>
                            {albums.map((album) => (
                                <div
                                    key={album.id}
                                    className={styles.albumCard}
                                    onClick={() => setOpenAlbumId(album.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {
                                            e.preventDefault();
                                            setOpenAlbumId(album.id);
                                        }
                                    }}
                                >
                                    <div className={styles.albumCoverWrap}>
                                        {album.coverUrl ? (
                                            <Image
                                                src={album.coverUrl}
                                                alt={album.title}
                                                fill
                                                className={styles.albumCoverImg}
                                            />
                                        ) : (
                                            <div
                                                className={
                                                    styles.albumCoverPlaceholder
                                                }
                                            >
                                                <svg
                                                    viewBox="0 0 48 48"
                                                    fill="none"
                                                    width="48"
                                                    height="48"
                                                >
                                                    <rect
                                                        x="6"
                                                        y="10"
                                                        width="36"
                                                        height="28"
                                                        rx="3"
                                                        stroke="#b0c4ce"
                                                        strokeWidth="2"
                                                    />
                                                    <circle
                                                        cx="17"
                                                        cy="21"
                                                        r="3"
                                                        stroke="#b0c4ce"
                                                        strokeWidth="2"
                                                    />
                                                    <path
                                                        d="M10 34l9-9 7 7 4-4 8 6"
                                                        stroke="#b0c4ce"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                        <span className={styles.albumPhotoCount}>
                                            {album.photoCount} photo
                                            {album.photoCount !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className={styles.albumInfo}>
                                        <span className={styles.albumTitle}>
                                            {album.title}
                                        </span>
                                        <span
                                            className={`${styles.visibilityTag} ${album.visibility !== "all" ? styles.visibilityEvent : ""}`}
                                        >
                                            {album.visibility === "all"
                                                ? "Tous"
                                                : album.visibility === "event"
                                                  ? album.eventTitle
                                                  : `${album.allowedMemberNames.length} adhérent(s)`}
                                        </span>
                                    </div>
                                    <div
                                        className={styles.albumActions}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {deletingAlbumId === album.id ? (
                                            <div className={styles.confirmRow}>
                                                <span
                                                    className={
                                                        styles.confirmText
                                                    }
                                                >
                                                    Supprimer l&apos;album et
                                                    toutes ses photos ?
                                                </span>
                                                <form
                                                    action={deleteAlbumAction}
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="albumId"
                                                        value={album.id}
                                                    />
                                                    <button
                                                        type="submit"
                                                        className={
                                                            styles.confirmYes
                                                        }
                                                    >
                                                        Oui
                                                    </button>
                                                </form>
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.confirmNo
                                                    }
                                                    onClick={() =>
                                                        setDeletingAlbumId(null)
                                                    }
                                                >
                                                    Non
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                className={styles.deleteBtn}
                                                onClick={() =>
                                                    setDeletingAlbumId(album.id)
                                                }
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
}
