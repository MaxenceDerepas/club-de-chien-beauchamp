import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://club-de-chien-beauchamp.vercel.app";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#0c8fb4",
};

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Club Beauchampois d'Éducation Canine — Cours & Activités à Beauchamp (95)",
        template: "%s | Club Beauchampois d'Éducation Canine",
    },
    description:
        "Club d'éducation canine à Beauchamp (Val-d'Oise, 95). Cours chiots, ados, collectifs, obéissance, ring et parcours de santé. Ouvert toute l'année, le samedi et dimanche.",
    keywords: [
        "club canin Beauchamp",
        "éducation canine 95",
        "cours chiot Val-d'Oise",
        "dressage chien Beauchamp",
        "club canin Val-d'Oise",
        "obéissance canine",
        "ring canin",
        "parcours de santé canin",
        "cours collectif chien",
        "éducation chien 95250",
    ],
    authors: [{ name: "Club Beauchampois d'Éducation Canine" }],
    creator: "Club Beauchampois d'Éducation Canine",
    openGraph: {
        type: "website",
        locale: "fr_FR",
        url: SITE_URL,
        siteName: "Club Beauchampois d'Éducation Canine",
        title: "Club Beauchampois d'Éducation Canine — Cours & Activités à Beauchamp (95)",
        description:
            "Club d'éducation canine à Beauchamp (Val-d'Oise). Cours chiots, ados, collectifs, obéissance, ring et parcours de santé.",
        images: [
            {
                url: "/images/hero-accueil.jpg",
                width: 1200,
                height: 630,
                alt: "Club Beauchampois d'Éducation Canine — terrain d'entraînement",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Club Beauchampois d'Éducation Canine",
        description:
            "Club d'éducation canine à Beauchamp (95). Cours chiots, ados, collectifs, obéissance et ring.",
        images: ["/images/hero-accueil.jpg"],
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    alternates: {
        canonical: SITE_URL,
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="fr">
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}
