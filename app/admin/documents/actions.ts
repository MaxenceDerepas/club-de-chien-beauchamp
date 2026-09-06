"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { uploadFile, deleteFile } from "@/lib/cloudinary";
import {
    createDocumentCategory,
    updateDocumentCategory,
    deleteDocumentCategory,
    addDocumentToCategory,
    removeDocumentFromCategory,
    getDocumentCategory,
    updateDocumentInCategory,
    type DocumentCategory,
} from "@/lib/documents";

export async function createCategoryAction(formData: FormData) {
    await requireAdminSession();
    const name = String(formData.get("name") || "").trim();
    const icon = (String(formData.get("icon") || "document")) as DocumentCategory["icon"];
    if (!name) return;
    await createDocumentCategory(name, icon);
    revalidatePath("/admin/documents");
}

export async function updateCategoryAction(formData: FormData) {
    await requireAdminSession();
    const id = String(formData.get("id") || "");
    const name = String(formData.get("name") || "").trim();
    const icon = (String(formData.get("icon") || "document")) as DocumentCategory["icon"];
    if (!id || !name) return;
    await updateDocumentCategory(id, { name, icon });
    revalidatePath("/admin/documents");
}

export async function deleteCategoryAction(formData: FormData) {
    await requireAdminSession();
    const id = String(formData.get("id") || "");
    if (!id) return;

    // Delete all documents' files from Cloudinary first
    const cat = await getDocumentCategory(id);
    if (cat) {
        for (const doc of cat.documents) {
            if (doc.publicId) {
                await deleteFile(doc.publicId);
            }
        }
    }

    await deleteDocumentCategory(id);
    revalidatePath("/admin/documents");
}

export async function uploadDocumentAction(formData: FormData) {
    await requireAdminSession();
    const categoryId = String(formData.get("categoryId") || "");
    const name = String(formData.get("name") || "").trim();
    const file = formData.get("file") as File | null;

    if (!categoryId || !file || file.size === 0) return;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await uploadFile(buffer, "documents", file.name);

    const displayName = name || file.name.replace(/\.[^.]+$/, "");

    await addDocumentToCategory(categoryId, {
        name: displayName,
        fileUrl: result.url,
        publicId: result.publicId,
        originalFilename: file.name,
    });

    revalidatePath("/admin/documents");
    revalidatePath("/membre");
}

export async function deleteDocumentAction(formData: FormData) {
    await requireAdminSession();
    const categoryId = String(formData.get("categoryId") || "");
    const documentId = String(formData.get("documentId") || "");
    const publicId = String(formData.get("publicId") || "");

    if (!categoryId || !documentId) return;

    if (publicId) {
        await deleteFile(publicId);
    }

    await removeDocumentFromCategory(categoryId, documentId);
    revalidatePath("/admin/documents");
    revalidatePath("/membre");
}

export async function renameDocumentAction(formData: FormData) {
    await requireAdminSession();
    const categoryId = String(formData.get("categoryId") || "");
    const documentId = String(formData.get("documentId") || "");
    const name = String(formData.get("name") || "").trim();

    if (!categoryId || !documentId || !name) return;

    await updateDocumentInCategory(categoryId, documentId, { name });
    revalidatePath("/admin/documents");
    revalidatePath("/membre");
}
