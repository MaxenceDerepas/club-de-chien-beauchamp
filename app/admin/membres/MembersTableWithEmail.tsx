"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    deleteMemberAction,
    sendBulkEmailAction,
    type SendBulkEmailState,
} from "./actions";
import styles from "./membres.module.css";

const initialSendState: SendBulkEmailState = { status: "idle" };

type MemberLevel =
    | "chiot"
    | "premier_cours"
    | "ruban_violet"
    | "ruban_bleu"
    | "ruban_blanc"
    | "ruban_rouge"
    | "ruban_noir";

type MemberItem = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dogName: string;
    dogBreed: string;
    phone: string;
    address: string;
    username: string;
    level: MemberLevel;
    membershipActive: boolean;
    siteAccessEnabled: boolean;
    dogPhotoUrl: string;
    healthCourse: boolean;
    obedience: boolean;
};

type Props = {
    members: MemberItem[];
};

const LEVEL_LABELS: Record<MemberLevel, string> = {
    chiot: "Chiot",
    premier_cours: "Premier cours",
    ruban_violet: "Ruban violet",
    ruban_bleu: "Ruban bleu",
    ruban_blanc: "Ruban blanc",
    ruban_rouge: "Ruban rouge",
    ruban_noir: "Ruban noir",
};

const LEVEL_COLORS: Record<MemberLevel, string> = {
    chiot: "#f5d957",
    premier_cours: "#9ad84c",
    ruban_violet: "#b08fd6",
    ruban_bleu: "#11b7e5",
    ruban_blanc: "#e6e6e6",
    ruban_rouge: "#ef6b6b",
    ruban_noir: "#2b2b2b",
};

type StatusFilter = "all" | "active" | "inactive";
type AccessFilter = "all" | "enabled" | "disabled";

export default function MembersTableWithEmail({ members }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [modalSearch, setModalSearch] = useState("");
    const [sendState, sendFormAction, isSending] = useActionState(
        sendBulkEmailAction,
        initialSendState,
    );

    useEffect(() => {
        if (sendState.status === "success") {
            setSubject("");
            setMessage("");
            setSelectedIds([]);
        }
    }, [sendState]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
    const [levelFilter, setLevelFilter] = useState<MemberLevel | "all">("all");

    const filteredMembers = useMemo(() => {
        const q = search.trim().toLowerCase();
        return members.filter((m) => {
            if (statusFilter === "active" && !m.membershipActive) return false;
            if (statusFilter === "inactive" && m.membershipActive) return false;
            if (accessFilter === "enabled" && !m.siteAccessEnabled) return false;
            if (accessFilter === "disabled" && m.siteAccessEnabled) return false;
            if (levelFilter !== "all" && m.level !== levelFilter) return false;

            if (!q) return true;
            const haystack = [
                m.firstName,
                m.lastName,
                m.email,
                m.dogName,
                m.dogBreed,
                m.phone,
                m.username,
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [members, search, statusFilter, accessFilter, levelFilter]);

    const selectableMembers = useMemo(
        () => members.filter((member) => member.email?.trim()),
        [members],
    );

    const visibleSelectableMembers = useMemo(() => {
        const q = modalSearch.trim().toLowerCase();
        if (!q) return selectableMembers;
        return selectableMembers.filter((m) =>
            [m.firstName, m.lastName, m.email, m.dogName, m.username]
                .join(" ")
                .toLowerCase()
                .includes(q),
        );
    }, [selectableMembers, modalSearch]);

    const selectedMembers = useMemo(
        () =>
            selectableMembers.filter((member) =>
                selectedIds.includes(member.id),
            ),
        [selectableMembers, selectedIds],
    );

    const allSelected =
        selectableMembers.length > 0 &&
        selectedIds.length === selectableMembers.length;

    function toggleMember(id: string) {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    }

    const visibleIds = visibleSelectableMembers.map((m) => m.id);
    const allVisibleSelected =
        visibleIds.length > 0 &&
        visibleIds.every((id) => selectedIds.includes(id));

    function toggleAll() {
        if (allVisibleSelected) {
            setSelectedIds((prev) =>
                prev.filter((id) => !visibleIds.includes(id)),
            );
            return;
        }
        setSelectedIds((prev) =>
            Array.from(new Set([...prev, ...visibleIds])),
        );
    }

    return (
        <>
            <div className={styles.bulkActionsRow}>
                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => setIsModalOpen(true)}
                    title="Ouvre une modale pour sélectionner des adhérents et composer un mail en copie cachée."
                >
                    Envoyer un mail à des adhérents
                </button>
            </div>

            <div className={styles.filtersRow}>
                <input
                    type="search"
                    className={styles.searchInput}
                    placeholder="Rechercher un adhérent, un chien, un email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className={styles.filterSelect}
                    value={levelFilter}
                    onChange={(e) =>
                        setLevelFilter(e.target.value as MemberLevel | "all")
                    }
                >
                    <option value="all">Tous les niveaux</option>
                    {(Object.keys(LEVEL_LABELS) as MemberLevel[]).map((lvl) => (
                        <option key={lvl} value={lvl}>
                            {LEVEL_LABELS[lvl]}
                        </option>
                    ))}
                </select>

                <select
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value as StatusFilter)
                    }
                >
                    <option value="all">Adhésion : toutes</option>
                    <option value="active">Adhésion active</option>
                    <option value="inactive">Adhésion inactive</option>
                </select>

                <select
                    className={styles.filterSelect}
                    value={accessFilter}
                    onChange={(e) =>
                        setAccessFilter(e.target.value as AccessFilter)
                    }
                >
                    <option value="all">Accès : tous</option>
                    <option value="enabled">Accès activé</option>
                    <option value="disabled">Accès désactivé</option>
                </select>

                <span className={styles.filterCount}>
                    {filteredMembers.length} / {members.length}
                </span>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Adhérent</th>
                            <th>Chien</th>
                            <th>Niveau</th>
                            <th>Contact</th>
                            <th>Adhésion</th>
                            <th>Accès adhérent</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={8} className={styles.emptyRow}>
                                    Aucun adhérent ne correspond aux filtres.
                                </td>
                            </tr>
                        ) : null}
                        {filteredMembers.map((member) => (
                            <tr key={member.id}>
                                <td>
                                    <div className={styles.tableAvatar}>
                                        {member.dogPhotoUrl ? (
                                            <img
                                                src={member.dogPhotoUrl}
                                                alt={member.dogName}
                                                className={styles.tableAvatarImg}
                                            />
                                        ) : (
                                            <span className={styles.tableAvatarFallback}>
                                                {member.dogName.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                        {member.healthCourse && (
                                            <span className={styles.tableAvatarTagHealth} title="Parcours de santé">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src="/images/Tag-Parcours-de-sante.png"
                                                    alt="Parcours de santé"
                                                />
                                            </span>
                                        )}
                                        {member.obedience && (
                                            <span className={styles.tableAvatarTagObedience} title="Obéissance">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src="/images/Tag-Obeissance.png"
                                                    alt="Obéissance"
                                                />
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.nameCell}>
                                        {member.firstName} {member.lastName}
                                    </div>
                                    <div>{member.email || "—"}</div>
                                </td>
                                <td>
                                    <div className={styles.nameCell}>
                                        {member.dogName}
                                    </div>
                                    <div>{member.dogBreed || "—"}</div>
                                </td>
                                <td>
                                    <span
                                        className={styles.levelBadge}
                                        style={{
                                            background:
                                                LEVEL_COLORS[member.level],
                                            color:
                                                member.level === "ruban_noir"
                                                    ? "#fff"
                                                    : "#163040",
                                        }}
                                    >
                                        {LEVEL_LABELS[member.level]}
                                    </span>
                                </td>
                                <td>
                                    <div>{member.phone || "—"}</div>
                                    <div>{member.address || "—"}</div>
                                </td>
                                <td>
                                    <span
                                        className={`${styles.status} ${
                                            member.membershipActive
                                                ? styles.statusOn
                                                : styles.statusOff
                                        }`}
                                    >
                                        {member.membershipActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className={`${styles.status} ${
                                            member.siteAccessEnabled
                                                ? styles.statusOn
                                                : styles.statusOff
                                        }`}
                                    >
                                        {member.siteAccessEnabled
                                            ? "Activé"
                                            : "Désactivé"}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <Link
                                            href={`/admin/membres/${member.id}`}
                                            className={styles.actionLink}
                                        >
                                            Modifier
                                        </Link>

                                        <form
                                            action={deleteMemberAction}
                                            onSubmit={(e) => {
                                                if (
                                                    !confirm(
                                                        `Supprimer définitivement ${member.firstName} ${member.lastName} ? Cette action est irréversible.`,
                                                    )
                                                ) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            <input
                                                type="hidden"
                                                name="id"
                                                value={member.id}
                                            />
                                            <button
                                                type="submit"
                                                className={styles.deleteButton}
                                            >
                                                Supprimer
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen ? (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setIsModalOpen(false)}
                >
                    <form
                        action={sendFormAction}
                        className={styles.modalCard}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {selectedIds.map((id) => (
                            <input
                                key={id}
                                type="hidden"
                                name="memberIds"
                                value={id}
                            />
                        ))}

                        <div className={styles.modalHeader}>
                            <div>
                                <h2 className={styles.modalTitle}>
                                    Envoyer un mail aux adhérents
                                </h2>
                                <p className={styles.modalText}>
                                    Le mail est envoyé directement depuis le
                                    serveur, avec les destinataires en copie
                                    cachée.
                                </p>
                            </div>

                            <button
                                type="button"
                                className={styles.modalClose}
                                onClick={() => setIsModalOpen(false)}
                            >
                                Fermer
                            </button>
                        </div>

                        <input
                            type="search"
                            className={styles.input}
                            placeholder="Rechercher un adhérent (nom, email, chien…)"
                            value={modalSearch}
                            onChange={(e) => setModalSearch(e.target.value)}
                            style={{ marginTop: 4 }}
                        />

                        <div className={styles.modalControls}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={toggleAll}
                                disabled={visibleIds.length === 0}
                            >
                                {allVisibleSelected
                                    ? modalSearch
                                        ? "Tout désélectionner (résultats)"
                                        : "Tout désélectionner"
                                    : modalSearch
                                      ? "Tout sélectionner (résultats)"
                                      : "Tout sélectionner"}
                            </button>

                            <span className={styles.selectionCount}>
                                {selectedIds.length} sélectionné(s)
                                {modalSearch
                                    ? ` · ${visibleSelectableMembers.length} affiché(s)`
                                    : ""}
                            </span>
                        </div>

                        <div className={styles.modalMembersList}>
                            {selectableMembers.length === 0 ? (
                                <div className={styles.emptySelection}>
                                    Aucun adhérent avec une adresse email.
                                </div>
                            ) : visibleSelectableMembers.length === 0 ? (
                                <div className={styles.emptySelection}>
                                    Aucun adhérent ne correspond à la
                                    recherche.
                                </div>
                            ) : (
                                visibleSelectableMembers.map((member) => (
                                    <label
                                        key={member.id}
                                        className={styles.memberOption}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(
                                                member.id,
                                            )}
                                            onChange={() =>
                                                toggleMember(member.id)
                                            }
                                        />
                                        <div>
                                            <div className={styles.nameCell}>
                                                {member.firstName}{" "}
                                                {member.lastName}
                                            </div>
                                            <div>{member.email}</div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className={styles.composeGrid}>
                            <div className={styles.field}>
                                <label
                                    htmlFor="bulk-mail-subject"
                                    className={styles.label}
                                >
                                    Objet du mail
                                </label>
                                <input
                                    id="bulk-mail-subject"
                                    name="subject"
                                    className={styles.input}
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Objet du message"
                                    required
                                />
                            </div>

                            <div
                                className={`${styles.field} ${styles.fieldFull}`}
                            >
                                <label
                                    htmlFor="bulk-mail-message"
                                    className={styles.label}
                                >
                                    Message
                                </label>
                                <textarea
                                    id="bulk-mail-message"
                                    name="message"
                                    className={styles.textarea}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Écris ici le contenu du mail..."
                                    required
                                />
                            </div>
                        </div>

                        {sendState.status !== "idle" && sendState.message ? (
                            <div
                                className={
                                    sendState.status === "success"
                                        ? styles.sendSuccess
                                        : styles.sendError
                                }
                                role="alert"
                            >
                                {sendState.message}
                            </div>
                        ) : null}

                        <div className={styles.modalActions}>
                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={
                                    isSending || selectedIds.length === 0
                                }
                            >
                                {isSending
                                    ? "Envoi en cours…"
                                    : `Envoyer le mail${
                                          selectedIds.length > 0
                                              ? ` (${selectedIds.length})`
                                              : ""
                                      }`}
                            </button>

                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => setIsModalOpen(false)}
                            >
                                Fermer
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}
        </>
    );
}
