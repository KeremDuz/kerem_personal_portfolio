"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitCommit, Star, GitFork, ExternalLink } from "lucide-react";

interface GitHubRepo {
    name: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    url: string;
}

interface ContributionDay {
    level: number; // 0-4
}

// Static fallback data (used if API fails or for privacy)
const fallbackRepos: GitHubRepo[] = [
    {
        name: "network-scanner",
        description: "Python ile yazılmış ağ güvenlik tarayıcısı",
        language: "Python",
        stars: 12,
        forks: 3,
        url: "https://github.com/keremduz",
    },
    {
        name: "ctf-writeups",
        description: "CTF yarışma çözümleri ve writeup koleksiyonu",
        language: "Markdown",
        stars: 8,
        forks: 2,
        url: "https://github.com/keremduz",
    },
    {
        name: "portfolio-website",
        description: "Next.js ile oluşturulmuş kişisel portföy sitesi",
        language: "TypeScript",
        stars: 5,
        forks: 1,
        url: "https://github.com/keremduz",
    },
];

const languageColors: Record<string, string> = {
    Python: "#3572A5",
    TypeScript: "#3178C6",
    JavaScript: "#F1E05A",
    Markdown: "#083FA1",
    Go: "#00ADD8",
    Rust: "#DEA584",
    Shell: "#89E051",
    C: "#555555",
};

// Generate mock contribution data
function generateContributions(): ContributionDay[][] {
    const weeks: ContributionDay[][] = [];
    for (let w = 0; w < 52; w++) {
        const week: ContributionDay[] = [];
        for (let d = 0; d < 7; d++) {
            // Create a realistic-looking pattern
            const rand = Math.random();
            let level = 0;
            if (rand > 0.5) level = 1;
            if (rand > 0.7) level = 2;
            if (rand > 0.85) level = 3;
            if (rand > 0.95) level = 4;
            week.push({ level });
        }
        weeks.push(week);
    }
    return weeks;
}

const contributionColors = [
    "rgba(255,255,255,0.04)",
    "rgba(0,255,65,0.15)",
    "rgba(0,255,65,0.3)",
    "rgba(0,255,65,0.5)",
    "rgba(0,255,65,0.8)",
];

export default function GitHubActivity() {
    const [repos] = useState(fallbackRepos);
    const [contributions] = useState(generateContributions);

    return (
        <section id="github" className="relative py-24 md:py-32">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600/15 to-transparent" />

            <div className="max-w-6xl mx-auto px-6">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-14 text-center"
                >
                    <span className="font-mono text-sm text-gray-500 tracking-wider uppercase block mb-3">
                        {"// github.activity()"}
                    </span>
                    <h2 className="section-title">
                        <span className="text-gray-100">GitHub</span>{" "}
                        <span className="text-cyber-green">Aktivitesi</span>
                    </h2>
                </motion.div>

                {/* Contribution Graph */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="glass-card p-5 md:p-6 mb-8 overflow-x-auto"
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-mono text-xs text-gray-500">
                            <GitCommit size={12} className="inline mr-1" />
                            Contribution Graph
                        </p>
                        <a
                            href="https://github.com/keremduz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-gray-500 hover:text-cyber-green transition-colors flex items-center gap-1"
                        >
                            @keremduz
                            <ExternalLink size={10} />
                        </a>
                    </div>

                    <div className="flex gap-[3px] min-w-[700px]">
                        {contributions.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-[3px]">
                                {week.map((day, di) => (
                                    <motion.div
                                        key={di}
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.2,
                                            delay: wi * 0.01 + di * 0.005,
                                        }}
                                        className="w-[10px] h-[10px] md:w-[11px] md:h-[11px] rounded-[2px]"
                                        style={{ backgroundColor: contributionColors[day.level] }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-2 mt-4 justify-end">
                        <span className="text-[10px] text-gray-600 font-mono">Az</span>
                        {contributionColors.map((color, i) => (
                            <div
                                key={i}
                                className="w-[10px] h-[10px] rounded-[2px]"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        <span className="text-[10px] text-gray-600 font-mono">Çok</span>
                    </div>
                </motion.div>

                {/* Repos */}
                <div className="grid md:grid-cols-3 gap-5">
                    {repos.map((repo, index) => (
                        <motion.a
                            key={repo.name}
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="glass-card p-5 group block"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-mono text-sm font-semibold text-gray-200 group-hover:text-cyber-green transition-colors">
                                    {repo.name}
                                </h3>
                                <ExternalLink
                                    size={14}
                                    className="text-gray-600 group-hover:text-cyber-green transition-colors"
                                />
                            </div>

                            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                                {repo.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                                <span className="flex items-center gap-1.5">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{
                                            backgroundColor: languageColors[repo.language] || "#666",
                                        }}
                                    />
                                    {repo.language}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star size={12} />
                                    {repo.stars}
                                </span>
                                <span className="flex items-center gap-1">
                                    <GitFork size={12} />
                                    {repo.forks}
                                </span>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
