"use client";

import { useMemo } from "react";
import { ArrowDown, Globe2, MapPin, Terminal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import CyberGrid from "./CyberGrid";
import HeroPortrait from "./HeroPortrait";
import RoleTypewriter from "./RoleTypewriter";

export default function Hero() {
    const t = useTranslations("Hero");

    // Stable reference so the memoized typewriter is not remounted on re-render.
    const roles = useMemo(
        () => [t("roles.0"), t("roles.1"), t("roles.2"), t("roles.3")],
        [t]
    );

    return (
        <section
            id="hero"
            // Mobile stacks: photo band on top, copy flowing underneath it.
            // From `lg` the copy is vertically centred beside the photo column.
            className="relative flex min-h-[100svh] flex-col overflow-hidden pb-16 pt-24 lg:justify-center lg:pb-20"
        >
            {/* Ambient background, painted under the photograph */}
            <div aria-hidden="true" className="absolute inset-0 z-0 aurora" />
            <div aria-hidden="true" className="absolute inset-0 z-0 grid-lines mask-fade-radial" />

            {/* The photograph itself — full-bleed against the right edge */}
            <HeroPortrait alt={t("photoAlt")} />

            {/* Particles drift over the photo, tying it into the background */}
            <CyberGrid />

            {/* Scrim: guarantees text contrast wherever the copy meets the photo.
                Vertical on mobile (copy sits under the band), horizontal from
                `lg` up (copy sits to the left of the column). */}
            <div
                aria-hidden="true"
                className="absolute inset-0 z-[2] bg-gradient-to-t from-dark-bg via-dark-bg/70 to-transparent lg:bg-gradient-to-r lg:from-dark-bg lg:via-dark-bg/45 lg:to-transparent"
            />
            <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 z-[2] h-32 bg-gradient-to-b from-transparent to-dark-bg"
            />

            {/* Reserves the photo band on mobile so the copy starts below it
                rather than on top of his face. Collapses at `lg`, where the
                photo moves to its own column. */}
            <div aria-hidden="true" className="h-[34vh] shrink-0 lg:hidden" />

            <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
                <div className="max-w-xl lg:max-w-2xl">
                    <h1 className="mb-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                        <span className="text-gray-100">{t("greeting")}</span>
                        <span className="text-gradient-cyber">{t("name")}</span>
                    </h1>

                    <div className="mb-6 flex min-h-[1.9em] items-center gap-2">
                        <span aria-hidden="true" className="font-mono text-base text-cyber-green md:text-lg">
                            $
                        </span>
                        <RoleTypewriter roles={roles} />
                    </div>

                    <p className="mb-8 max-w-lg text-base leading-relaxed text-gray-400 md:text-lg">
                        {t("subtitle")}
                    </p>

                    <div className="mb-8 flex flex-wrap gap-3">
                        <Link href="/projects" className="btn btn-primary">
                            <Terminal size={16} strokeWidth={1.75} />
                            {t("ctaProjects")}
                        </Link>
                        <a href="#travel" className="btn btn-ghost">
                            <Globe2 size={16} strokeWidth={1.75} />
                            {t("ctaTravel")}
                        </a>
                    </div>
                </div>
            </div>

            {/* Where the photo was taken. Sits above the chat launcher, which is
                fixed to the bottom-right corner. */}
            <p className="absolute bottom-28 right-7 z-10 hidden items-center gap-1.5 font-mono text-[11px] tracking-wide text-gray-500 lg:flex">
                <MapPin size={12} className="text-cyber-green/60" strokeWidth={2} />
                {t("photoLocation")}
                <span className="text-gray-700">&mdash;</span>
                <span className="text-gray-700">2025</span>
            </p>

            <a
                href="#about"
                aria-label={t("scroll")}
                className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-cyber-green/40 transition-colors hover:text-cyber-green lg:flex"
            >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{t("scroll")}</span>
                <ArrowDown size={16} className="animate-bounce" />
            </a>
        </section>
    );
}
