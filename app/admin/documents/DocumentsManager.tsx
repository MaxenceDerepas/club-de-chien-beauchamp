"use client";

import { useState, useRef, useTransition } from "react";
import {
    createCategoryAction,
    updateCategoryAction,
    deleteCategoryAction,
    uploadDocumentAction,
    deleteDocumentAction,
    renameDocumentAction,
} from "./actions";
import styles from "./documents.module.css";

type DocData = {
    id: string;
    name: string;
    fileUrl: string;
    publicId: string;
    originalFilename: string;
};

type CategoryData = {
    id: string;
    name: string;
    icon: string;
    documents: DocData[];
};

type Props = {
    categories: CategoryData[];
};

function fileExtension(filename: string) {
    const ext = filename.split(".").pop()?.toUpperCase() || "?";
    return ext.length > 4 ? ext.slice(0, 4) : ext;
}

export default function DocumentsManager({ categories }: Props) {
    const [newCatName, setNewCatName] = useState("");
    const [newCatIcon, setNewCatIcon] = useState("document");
    const [isPending, startTransition] = useTransition();
    const [editingDoc, setEditingDoc] = useState<{ catId: string; docId: string; name: string } | null>(null);
    const [editingCat, setEditingCat] = useState<{ id: string; name: string; icon: string } | null>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    function handleCreateCategory() {
        if (!newCatName.trim()) return;
        const fd = new FormData();
        fd.set("name", newCatName.trim());
        fd.set("icon", newCatIcon);
        startTransition(async () => {
            await createCategoryAction(fd);
            setNewCatName("");
        });
    }

    function handleDeleteCategory(id: string) {
        if (!confirm("Supprimer cette catégorie et tous ses documents ?")) return;
        const fd = new FormData();
        fd.set("id", id);
        startTransition(async () => {
            await deleteCategoryAction(fd);
        });
    }

    function handleUpdateCategory() {
        if (!editingCat || !editingCat.name.trim()) return;
        const fd = new FormData();
        fd.set("id", editingCat.id);
        fd.set("name", editingCat.name.trim());
        fd.set("icon", editingCat.icon);
        startTransition(async () => {
            await updateCategoryAction(fd);
            setEditingCat(null);
        });
    }

    function handleUpload(categoryId: string) {
        const input = fileInputRefs.current[categoryId];
        if (!input?.files?.[0]) return;

        const file = input.files[0];
        const fd = new FormData();
        fd.set("categoryId", categoryId);
        fd.set("file", file);
        fd.set("name", ""); // Empty = use filename
        startTransition(async () => {
            await uploadDocumentAction(fd);
            if (input) input.value = "";
        });
    }

    function handleDeleteDoc(categoryId: string, doc: DocData) {
        if (!confirm(`Supprimer "${doc.name}" ?`)) return;
        const fd = new FormData();
        fd.set("categoryId", categoryId);
        fd.set("documentId", doc.id);
        fd.set("publicId", doc.publicId);
        startTransition(async () => {
            await deleteDocumentAction(fd);
        });
    }

    function handleRenameDoc() {
        if (!editingDoc || !editingDoc.name.trim()) return;
        const fd = new FormData();
        fd.set("categoryId", editingDoc.catId);
        fd.set("documentId", editingDoc.docId);
        fd.set("name", editingDoc.name.trim());
        startTransition(async () => {
            await renameDocumentAction(fd);
            setEditingDoc(null);
        });
    }

    return (
        <>
            {/* New category form */}
            <div className={styles.addCategoryForm}>
                <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Nom de la catégorie</label>
                    <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Ex : Procès-verbaux"
                        className={styles.fieldInput}
                    />
                </div>
                <div className={styles.formField} style={{ maxWidth: 180 }}>
                    <label className={styles.fieldLabel}>Icône</label>
                    <select
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        className={styles.fieldSelect}
                    >
                        <option value="document">Document</option>
                        <option value="heart">Santé</option>
                        <option value="education">Éducation</option>
                    </select>
                </div>
                <button
                    type="button"
                    className={styles.addCategoryBtn}
                    onClick={handleCreateCategory}
                    disabled={isPending || !newCatName.trim()}
                >
                    + Nouvelle catégorie
                </button>
            </div>

            {/* Categories */}
            {categories.length === 0 && (
                <p className={styles.emptyMsg}>Aucune catégorie. Créez-en une ci-dessus.</p>
            )}

            {categories.map((cat) => (
                <div key={cat.id} className={styles.categoryCard}>
                    {/* Category header */}
                    <div className={styles.categoryHeader}>
                        {editingCat?.id === cat.id ? (
                            <div className={styles.editOverlay}>
                                <input
                                    type="text"
                                    value={editingCat.name}
                                    onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                                    className={styles.editInput}
                                    autoFocus
                                />
                                <select
                                    value={editingCat.icon}
                                    onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })}
                                    className={styles.fieldSelect}
                                    style={{ width: 120 }}
                                >
                                    <option value="document">Document</option>
                                    <option value="heart">Santé</option>
                                    <option value="education">Éducation</option>
                                </select>
                                <button type="button" className={styles.editSaveBtn} onClick={handleUpdateCategory} disabled={isPending}>
                                    OK
                                </button>
                                <button type="button" className={styles.editCancelBtn} onClick={() => setEditingCat(null)}>
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className={styles.categoryName}>{cat.name}</span>
                                <div className={styles.categoryActions}>
                                    <button
                                        type="button"
                                        className={styles.iconBtn}
                                        title="Renommer"
                                        onClick={() => setEditingCat({ id: cat.id, name: cat.name, icon: cat.icon })}
                                    >
                                        ✎
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                        title="Supprimer la catégorie"
                                        onClick={() => handleDeleteCategory(cat.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Documents list */}
                    <div className={styles.docList}>
                        {cat.documents.length === 0 && (
                            <p className={styles.emptyMsg}>Aucun document dans cette catégorie.</p>
                        )}
                        {cat.documents.map((doc) => (
                            <div key={doc.id} className={styles.docRow}>
                                <div className={styles.docIcon}>
                                    {fileExtension(doc.originalFilename)}
                                </div>
                                <div className={styles.docInfo}>
                                    {editingDoc?.docId === doc.id ? (
                                        <div className={styles.editOverlay}>
                                            <input
                                                type="text"
                                                value={editingDoc.name}
                                                onChange={(e) => setEditingDoc({ ...editingDoc, name: e.target.value })}
                                                className={styles.editInput}
                                                autoFocus
                                                onKeyDown={(e) => e.key === "Enter" && handleRenameDoc()}
                                            />
                                            <button type="button" className={styles.editSaveBtn} onClick={handleRenameDoc} disabled={isPending}>
                                                OK
                                            </button>
                                            <button type="button" className={styles.editCancelBtn} onClick={() => setEditingDoc(null)}>
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={styles.docName}>{doc.name}</div>
                                            <div className={styles.docFilename}>{doc.originalFilename}</div>
                                        </>
                                    )}
                                </div>
                                {!editingDoc || editingDoc.docId !== doc.id ? (
                                    <div className={styles.docActions}>
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.iconBtn}
                                            title="Voir le fichier"
                                        >
                                            ↗
                                        </a>
                                        <button
                                            type="button"
                                            className={styles.iconBtn}
                                            title="Renommer"
                                            onClick={() => setEditingDoc({ catId: cat.id, docId: doc.id, name: doc.name })}
                                        >
                                            ✎
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                            title="Supprimer"
                                            onClick={() => handleDeleteDoc(cat.id, doc)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>

                    {/* Upload form */}
                    <div className={styles.uploadForm}>
                        <div className={styles.formField}>
                            <label className={styles.fieldLabel}>Ajouter un document</label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                                ref={(el) => { fileInputRefs.current[cat.id] = el; }}
                                className={styles.fieldInput}
                            />
                        </div>
                        <button
                            type="button"
                            className={styles.uploadBtn}
                            onClick={() => handleUpload(cat.id)}
                            disabled={isPending}
                        >
                            {isPending ? "Upload…" : "Uploader"}
                        </button>
                    </div>
                </div>
            ))}
        </>
    );
}
