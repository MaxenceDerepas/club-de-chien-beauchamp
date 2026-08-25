import "./globals.css";

export const metadata = {
    title: "Club Beauchampois d’Éducation Canine",
    description: "Site officiel du club canin",
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
