"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImage, deleteImage, extractPublicId } from "@/lib/cloudinary";
import {
    createMember as createMemberInDb,
    deleteMemberById,
    getMemberById,
    listMembers,
    updateMember as updateMemberInDb,
} from "@/lib/members";
import { requireAdminSession } from "@/lib/admin-auth";
import { hashMemberPassword } from "@/lib/member-auth";
import { sendBulkMail, sendTransactionalMail } from "@/lib/mailer";
import { CreateMemberFormState } from "./form-state";

function getValues(formData: FormData): CreateMemberFormState["values"] {
    return {
        firstName: String(formData.get("firstName") || "").trim(),
        lastName: String(formData.get("lastName") || "").trim(),
        address: String(formData.get("address") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        phoneCompany: String(formData.get("phoneCompany") || "").trim(),
        policyNumber: String(formData.get("policyNumber") || "").trim(),
        email: String(formData.get("email") || "").trim(),

        owner1Name: String(formData.get("owner1Name") || "").trim(),
        owner1BirthDate: String(formData.get("owner1BirthDate") || "").trim(),
        owner1Email: String(formData.get("owner1Email") || "").trim(),

        owner2Name: String(formData.get("owner2Name") || "").trim(),
        owner2BirthDate: String(formData.get("owner2BirthDate") || "").trim(),
        owner2Email: String(formData.get("owner2Email") || "").trim(),

        dogName: String(formData.get("dogName") || "").trim(),
        dogBreed: String(formData.get("dogBreed") || "").trim(),
        dogSex: String(formData.get("dogSex") || "unknown") as
            | "male"
            | "female"
            | "unknown",
        dogBirthDate: String(formData.get("dogBirthDate") || "").trim(),
        dogLofNumber: String(formData.get("dogLofNumber") || "").trim(),
        dogIdentificationNumber: String(
            formData.get("dogIdentificationNumber") || "",
        ).trim(),
        rabiesBoosterDate: String(
            formData.get("rabiesBoosterDate") || "",
        ).trim(),

        username: String(formData.get("username") || "").trim(),
        dogPhotoUrl: String(formData.get("dogPhotoUrl") || "").trim(),
        registrationDate: String(formData.get("registrationDate") || "").trim(),
        membershipActive: formData.get("membershipActive") === "on",
        siteAccessEnabled: formData.get("siteAccessEnabled") === "on",
        isAdmin: formData.get("isAdmin") === "on",
        notes: String(formData.get("notes") || "").trim(),
        healthCourse: formData.get("healthCourse") === "on",
        obedience: formData.get("obedience") === "on",
        imageRightsClub: formData.get("imageRightsClub") === "on",
        imageRightsExternal: formData.get("imageRightsExternal") === "on",
        level: String(formData.get("level") || "chiot") as
            | "chiot"
            | "premier_cours"
            | "ruban_violet"
            | "ruban_bleu"
            | "ruban_blanc"
            | "ruban_rouge"
            | "ruban_noir",
    };
}

function optionalDate(value: string) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
async function saveDogPhotoFile(file: File | null) {
    if (!file || file.size === 0) return "";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await uploadImage(buffer, "members");
    return result.url;
}

async function deletePhotoFile(photoUrl: string) {
    if (!photoUrl) return;
    const publicId = extractPublicId(photoUrl);
    if (publicId) { await deleteImage(publicId); }
}

export async function createMemberAction(
    _prevState: CreateMemberFormState,
    formData: FormData,
): Promise<CreateMemberFormState> {
    await requireAdminSession();

    const values = getValues(formData);
    const password = String(formData.get("password") || "").trim();

    if (!values.firstName) {
        return { error: "Le prénom est obligatoire.", values };
    }

    if (!values.lastName) {
        return { error: "Le nom est obligatoire.", values };
    }

    if (!values.dogName) {
        return { error: "Le nom du chien est obligatoire.", values };
    }

    if (!values.username) {
        return { error: "L’identifiant est obligatoire.", values };
    }

    if (!password) {
        return { error: "Le mot de passe est obligatoire.", values };
    }

    const dogPhotoFile = formData.get("dogPhoto") as File | null;

    try {
        const { hash, salt } = hashMemberPassword(password);
        const now = new Date();
        const dogPhotoUrl = await saveDogPhotoFile(dogPhotoFile);

        await createMemberInDb({
            level: values.level,
            firstName: values.firstName,
            lastName: values.lastName,
            address: values.address,
            phone: values.phone,
            phoneCompany: values.phoneCompany,
            policyNumber: values.policyNumber,
            email: values.email.toLowerCase(),

            owner1Name: values.owner1Name,
            owner1BirthDate: optionalDate(values.owner1BirthDate),
            owner1Email: values.owner1Email,

            owner2Name: values.owner2Name,
            owner2BirthDate: optionalDate(values.owner2BirthDate),
            owner2Email: values.owner2Email,

            dogName: values.dogName,
            dogBreed: values.dogBreed,
            dogSex: values.dogSex,
            dogBirthDate: optionalDate(values.dogBirthDate),
            dogLofNumber: values.dogLofNumber,
            dogIdentificationNumber: values.dogIdentificationNumber,
            rabiesBoosterDate: optionalDate(values.rabiesBoosterDate),

            registrationDate: optionalDate(values.registrationDate) || now,
            membershipActive: values.membershipActive,
            siteAccessEnabled: values.siteAccessEnabled,
            isAdmin: values.isAdmin,
            healthCourse: values.healthCourse,
            obedience: values.obedience,
            imageRightsClub: values.imageRightsClub,
            imageRightsExternal: values.imageRightsExternal,
            dogPhotoUrl,

            username: values.username,
            usernameLower: values.username.toLowerCase(),
            passwordHash: hash,
            passwordSalt: salt,

            notes: values.notes,
            createdAt: now,
            updatedAt: now,
        });
        // Welcome email (fire-and-forget)
        if (values.email) {
            sendTransactionalMail({
                to: { email: values.email, name: `${values.firstName} ${values.lastName}` },
                subject: "Bienvenue au Club Beauchampois d'Éducation Canine",
                text: `Bonjour ${values.firstName},\n\nBienvenue au Club Beauchampois d'Éducation Canine !\n\nVotre compte adhérent a été créé. Vous pouvez vous connecter à votre espace membre avec :\n\n  Identifiant : ${values.username}\n  Mot de passe : ${password}\n\nNous vous conseillons de changer votre mot de passe lors de votre première connexion.\n\nÀ bientôt sur le terrain !\nClub Beauchampois d'Éducation Canine`,
            }).catch((err) =>
                console.error("Welcome email error", err),
            );
        }
    } catch (error: any) {
        if (error?.code === 11000) {
            return {
                error: "Cet identifiant est déjà utilisé.",
                values,
            };
        }

        return {
            error: "Une erreur est survenue lors de la création du membre.",
            values,
        };
    }

    revalidatePath("/admin/membres");
    redirect("/admin/membres");
}

export async function updateMemberAction(id: string, formData: FormData) {
    await requireAdminSession();
    const dogPhotoFile = formData.get("dogPhoto") as File | null;

    const existingMember = await getMemberById(id);
    if (!existingMember) {
        redirect("/admin/membres");
    }

    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const dogName = String(formData.get("dogName") || "").trim();
    const username = String(formData.get("username") || "").trim();
    const newPassword = String(formData.get("password") || "").trim();

    if (!firstName || !lastName || !dogName || !username) {
        redirect(
            `/admin/membres/${id}?error=${encodeURIComponent("Veuillez remplir tous les champs obligatoires.")}`,
        );
    }
    const uploadedDogPhotoUrl = await saveDogPhotoFile(dogPhotoFile);

    if (uploadedDogPhotoUrl && existingMember.dogPhotoUrl) {
        await deletePhotoFile(existingMember.dogPhotoUrl);
    }

    const updatePayload: Parameters<typeof updateMemberInDb>[1] = {
        level: String(formData.get("level") || "chiot") as
            | "chiot"
            | "premier_cours"
            | "ruban_violet"
            | "ruban_bleu"
            | "ruban_blanc"
            | "ruban_rouge"
            | "ruban_noir",
        healthCourse: formData.get("healthCourse") === "on",
        obedience: formData.get("obedience") === "on",
        imageRightsClub: formData.get("imageRightsClub") === "on",
        imageRightsExternal: formData.get("imageRightsExternal") === "on",
        firstName,
        lastName,
        address: String(formData.get("address") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        phoneCompany: String(formData.get("phoneCompany") || "").trim(),
        policyNumber: String(formData.get("policyNumber") || "").trim(),
        email: String(formData.get("email") || "")
            .trim()
            .toLowerCase(),

        owner1Name: String(formData.get("owner1Name") || "").trim(),
        owner1BirthDate: optionalDate(
            String(formData.get("owner1BirthDate") || "").trim(),
        ),
        owner1Email: String(formData.get("owner1Email") || "").trim(),

        owner2Name: String(formData.get("owner2Name") || "").trim(),
        owner2BirthDate: optionalDate(
            String(formData.get("owner2BirthDate") || "").trim(),
        ),
        owner2Email: String(formData.get("owner2Email") || "").trim(),

        dogName,
        dogBreed: String(formData.get("dogBreed") || "").trim(),
        dogSex: String(formData.get("dogSex") || "unknown") as
            | "male"
            | "female"
            | "unknown",
        dogPhotoUrl: uploadedDogPhotoUrl || existingMember.dogPhotoUrl || "",
        dogBirthDate: optionalDate(
            String(formData.get("dogBirthDate") || "").trim(),
        ),
        dogLofNumber: String(formData.get("dogLofNumber") || "").trim(),
        dogIdentificationNumber: String(
            formData.get("dogIdentificationNumber") || "",
        ).trim(),
        rabiesBoosterDate: optionalDate(
            String(formData.get("rabiesBoosterDate") || "").trim(),
        ),

        registrationDate:
            optionalDate(
                String(formData.get("registrationDate") || "").trim(),
            ) || existingMember.registrationDate,
        membershipActive: formData.get("membershipActive") === "on",
        siteAccessEnabled: formData.get("siteAccessEnabled") === "on",
        isAdmin: formData.get("isAdmin") === "on",

        username,
        usernameLower: username.toLowerCase(),
        notes: String(formData.get("notes") || "").trim(),
    };

    if (newPassword) {
        const { hash, salt } = hashMemberPassword(newPassword);
        updatePayload.passwordHash = hash;
        updatePayload.passwordSalt = salt;
    }

    try {
        await updateMemberInDb(id, updatePayload);
    } catch (error: any) {
        if (error?.code === 11000) {
            redirect(
                `/admin/membres/${id}?error=${encodeURIComponent(
                    "Cet identifiant est déjà utilisé.",
                )}`,
            );
        }

        redirect(
            `/admin/membres/${id}?error=${encodeURIComponent(
                "Une erreur est survenue lors de la modification du membre.",
            )}`,
        );
    }

    revalidatePath("/admin/membres");
    revalidatePath(`/admin/membres/${id}`);
    redirect("/admin/membres");
}

export async function deleteMemberAction(formData: FormData) {
    await requireAdminSession();

    const id = String(formData.get("id") || "");
    if (!id) return;

    const member = await getMemberById(id);
    if (member?.dogPhotoUrl) {
        await deletePhotoFile(member.dogPhotoUrl);
    }

    await deleteMemberById(id);
    revalidatePath("/admin/membres");
}

export async function deleteMemberPhotoAction(formData: FormData) {
    await requireAdminSession();

    const id = String(formData.get("id") || "");
    if (!id) return;

    const member = await getMemberById(id);
    if (!member) return;

    if (member.dogPhotoUrl) {
        await deletePhotoFile(member.dogPhotoUrl);
    }

    await updateMemberInDb(id, { dogPhotoUrl: "", updatedAt: new Date() });

    revalidatePath("/admin/membres");
    revalidatePath(`/admin/membres/${id}`);
}

export type SendBulkEmailState = {
    status: "idle" | "success" | "error";
    message?: string;
    sentCount?: number;
};

export async function sendBulkEmailAction(
    _prev: SendBulkEmailState,
    formData: FormData,
): Promise<SendBulkEmailState> {
    await requireAdminSession();

    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const ids = formData.getAll("memberIds").map((v) => String(v));

    if (!subject) {
        return { status: "error", message: "Merci de saisir un objet." };
    }
    if (!message) {
        return { status: "error", message: "Merci de saisir un message." };
    }
    if (ids.length === 0) {
        return {
            status: "error",
            message: "Sélectionne au moins un adhérent.",
        };
    }

    const members = await listMembers();
    const selected = members.filter(
        (m) => m._id && ids.includes(m._id.toString()),
    );
    const bcc = selected
        .map((m) => (m.email || "").trim())
        .filter((e) => e.length > 0);

    if (bcc.length === 0) {
        return {
            status: "error",
            message: "Aucun des adhérents sélectionnés n’a d’adresse email.",
        };
    }

    try {
        await sendBulkMail({ subject, text: message, bcc });
    } catch (err) {
        console.error("sendBulkEmailAction error", err);
        const detail =
            err instanceof Error ? err.message : "Erreur inconnue.";
        return {
            status: "error",
            message: `Échec de l’envoi du mail : ${detail}`,
        };
    }

    return {
        status: "success",
        message: `Mail envoyé à ${bcc.length} adhérent(s).`,
        sentCount: bcc.length,
    };
}
