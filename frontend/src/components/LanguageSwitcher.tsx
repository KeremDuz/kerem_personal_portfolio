"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const changeLanguage = (nextLocale: string) => {
        // Keep the current search params if possible, though mostly the pathname is sufficient
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <div className="flex gap-1 p-1 border border-cyber-green/20 rounded-md bg-dark-bg/60 shadow-inner">
            <button
                onClick={() => changeLanguage("tr")}
                className={`px-2 py-0.5 font-mono text-xs rounded transition-all duration-300 ${locale === "tr"
                        ? "bg-cyber-green text-dark-bg font-bold shadow-[0_0_8px_rgba(0,255,157,0.4)]"
                        : "text-gray-400 hover:text-cyber-green hover:bg-cyber-green/10"
                    }`}
            >
                TR
            </button>
            <button
                onClick={() => changeLanguage("en")}
                className={`px-2 py-0.5 font-mono text-xs rounded transition-all duration-300 ${locale === "en"
                        ? "bg-cyber-green text-dark-bg font-bold shadow-[0_0_8px_rgba(0,255,157,0.4)]"
                        : "text-gray-400 hover:text-cyber-green hover:bg-cyber-green/10"
                    }`}
            >
                EN
            </button>
        </div>
    );
}
