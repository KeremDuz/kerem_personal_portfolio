"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type SectionHeadingProps = {
    /** The `// tag()` eyebrow. Always Latin, so it opts out of translation lang. */
    eyebrow: string;
    title: ReactNode;
    description?: ReactNode;
    align?: "center" | "left";
};

/**
 * Every section opened with its own slightly-different eyebrow/title/spacing
 * stack. This is that pattern in one place, so the page has a single rhythm.
 */
export default function SectionHeading({
    eyebrow,
    title,
    description,
    align = "center",
}: SectionHeadingProps) {
    const centered = align === "center";

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`mb-14 ${centered ? "text-center" : "text-left"}`}
        >
            <span lang="en" className={`eyebrow ${centered ? "justify-center" : ""}`}>
                {eyebrow}
            </span>

            <h2 className="section-title mt-4 text-gray-100">{title}</h2>

            {description && (
                <p
                    className={`mt-4 max-w-xl text-[15px] leading-relaxed text-gray-400 md:text-base ${centered ? "mx-auto" : ""}`}
                >
                    {description}
                </p>
            )}
        </motion.div>
    );
}
