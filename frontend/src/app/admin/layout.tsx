import type { Metadata } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.keremduz.com"),
    title: "Admin Panel",
    robots: { index: false, follow: false },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" className={`dark ${fontVariables}`} suppressHydrationWarning>
            <body className="bg-dark-bg text-gray-200 font-sans antialiased" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
