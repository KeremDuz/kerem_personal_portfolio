"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowUpRight, Clock, Tag, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface BlogPost {
    title: string;
    excerpt: string;
    content?: React.ReactNode;
    date: string;
    category: "ctf" | "security" | "travel" | "dev";
    readTime: string;
    tags: string[];
    link: string;
}

const posts: BlogPost[] = [
    {
        title: "FUD: Behavioral and Structural File Upload Detection",
        excerpt: "Intelligent Identification of File Upload Interfaces in Modern Web Architectures. A hybrid, behavioral-driven approach to automatically identify file upload functionalities.",
        content: (
            <div className="font-serif text-gray-300 space-y-6 leading-relaxed text-justify">
                {/* Header */}
                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                        FUD: Behavioral and Structural <br /> File Upload Detection
                    </h1>
                    <h2 className="text-xl text-gray-400 italic">
                        Intelligent Identification of File Upload Interfaces in Modern Web Architectures
                    </h2>
                    <div className="pt-6 space-y-1">
                        <p className="font-bold text-lg text-gray-200">Kerem DÜZ</p>
                        <p className="text-gray-400">February 2026</p>
                    </div>
                </div>

                {/* System Overview */}
                <section>
                    <h3 className="text-xl font-bold text-[#3b82f6] border-b border-gray-700 pb-2 mb-4 mt-8">
                        System Overview
                    </h3>
                    <p className="mb-4">
                        The <span className="font-bold text-gray-200">File Upload Detector (FUD)</span> project introduces a hybrid, behavioral-driven approach to automatically identify file upload functionalities across the modern web. Traditional detection mechanisms predominantly rely on static keyword-based heuristics—searching for terms like "upload", "browse", or "file"—which frequently fail when encountering modern, JavaScript-heavy applications. Such applications often utilize non-standard labels, customized UI components, or dynamic form logic that remains invisible to conventional scrapers.
                    </p>
                    <p className="mb-4">
                        FUD overcomes these technical barriers by integrating <span className="font-bold text-gray-200">Hybrid Execution Analysis</span>. By leveraging a high-performance <span className="font-bold text-gray-200">Headless Browser Engine</span> and intelligent <span className="font-bold text-gray-200">DOM Injection</span>, the system moves beyond mere text-based identification to perform deep structural analysis in real-time. This approach allows for the detection of upload interfaces hidden within <span className="font-bold text-gray-200">Shadow DOMs</span>, complex nested iframes, or those managed by third-party dynamic libraries.
                    </p>
                    <p>
                        The system is deployed as a scalable <span className="font-bold text-gray-200">Asynchronous Microservice</span>, capable of handling concurrent scanning requests with high throughput and low resource latency, making it an essential tool for large-scale security auditing of web infrastructures.
                    </p>
                </section>

                {/* Dataset Construction */}
                <section>
                    <h3 className="text-xl font-bold text-[#3b82f6] border-b border-gray-700 pb-2 mb-4 mt-8">
                        Dataset Construction and Feature Engineering
                    </h3>
                    <p className="mb-4">
                        The foundation of the FileUpload Detector (FUD) is built upon a diverse dataset of target URLs, including high-traffic domains, enterprise portals, and complex web applications. The dataset was meticulously curated to represent a wide spectrum of file upload implementations, ranging from standard HTML forms to sophisticated, asynchronous uploaders. Each URL was subjected to manual verification to establish a ground truth for "Upload-Enabled" vs. "Non-Upload" interfaces.
                    </p>
                    <p className="mb-4">
                        To ensure precise identification, FUD extracts a series of engineered features that represent the structural, behavioral, and relational properties of the target page:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 marker:text-gray-500">
                        <li>
                            <span className="font-bold text-gray-200">Input Signature Distribution:</span> Quantitative analysis of <code className="bg-gray-800 px-1 py-0.5 rounded text-sm">&lt;input type="file"&gt;</code> tags and their associated attributes such as <code className="bg-gray-800 px-1 py-0.5 rounded text-sm">accept</code> and <code className="bg-gray-800 px-1 py-0.5 rounded text-sm">multiple</code>.
                        </li>
                        <li>
                            <span className="font-bold text-gray-200">Library-Specific Heuristics:</span> Detection of DOM signatures belonging to specialized upload frameworks, including <em>Dropzone.js</em>, <em>Uppy</em>, <em>FilePond</em>, and <em>Plupload</em>.
                        </li>
                        <li>
                            <span className="font-bold text-gray-200">Asynchronous & Dynamic Patterns:</span> Identification of late-loading (hydrated) elements that are injected into the DOM after the initial page load, capturing inputs managed by SPAs (Single Page Applications) without requiring traditional event listener analysis.
                        </li>
                        <li>
                            <span className="font-bold text-gray-200">DOM Hierarchy & Structural Proximity:</span> Analysis of the spatial and logical relationship between "Upload" buttons and hidden input fields, including depth analysis within the Shadow DOM via recursive injection.
                        </li>
                        <li>
                            <span className="font-bold text-gray-200">Technical Attribute Metadata:</span> Extraction of form-level metadata, such as <code className="bg-gray-800 px-1 py-0.5 rounded text-sm">enctype="multipart/form-data"</code> and specific API endpoints typically associated with file handling.
                        </li>
                    </ul>
                    <p className="mt-4">
                        This multi-layered feature design ensures robust detection capabilities across multi-language environments and visually obfuscated or non-standard upload interfaces, significantly reducing the likelihood of false negatives.
                    </p>
                </section>

                {/* Evolution */}
                <section>
                    <h3 className="text-xl font-bold text-[#3b82f6] border-b border-gray-700 pb-2 mb-4 mt-8">
                        Evolution of Detection Strategy (Methodology)
                    </h3>
                    <p className="mb-4">
                        The development of FileUpload Detector (FUD) followed an iterative, experimental process to overcome the limitations of traditional web scraping. Each stage was evaluated against a manually labeled ground truth dataset of 341 unique URLs.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold text-lg text-gray-200 mb-1">3.1 Phase I: Heuristics & Static Analysis</h4>
                            <p>
                                Initially, the system relied on <span className="font-bold text-gray-200">Keyword-Based Heuristics</span> (searching for "upload", "attachment", etc.). While this provided a baseline accuracy of <strong>84.6%</strong>, it suffered from significant false positives in multi-language environments. A follow-up attempt using static <span className="font-bold text-gray-200">Raw HTML Detection</span> (<code className="bg-gray-800 px-1 py-0.5 rounded text-sm">&lt;input type="file"&gt;</code>) proved even less effective (<strong>46.3%</strong> accuracy), as modern applications often hide or abstract these elements.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-gray-200 mb-1">3.2 Phase II: From Static Regex to Rendered Analysis</h4>
                            <p>
                                To improve discovery, we implemented specialized <span className="font-bold text-gray-200">Regex Patterns</span> targeting common library signatures. While static Regex was faster, the breakthrough occurred when moving to <span className="font-bold text-gray-200">Rendered HTML Analysis</span>. By evaluating the page after JavaScript execution, discovery rates jumped significantly (<strong>95.8%</strong>) as dynamically generated upload patterns became visible.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-gray-200 mb-1">3.3 Phase III: Transition to Modern Headless Rendering</h4>
                            <p>
                                The transition from legacy automation tools to a <span className="font-bold text-gray-200">Next-Generation Browser Engine</span> was driven by a need for higher concurrency and speed. Initially, a slight drop in accuracy (from 94.7% to 92.3%) was observed due to timing discrepancies in asynchronous page loads.
                            </p>
                            <ul className="list-disc pl-6 mt-2 marker:text-gray-500">
                                <li>
                                    <span className="font-bold text-gray-200">Performance Tuning:</span> To maximize throughput, the engine was optimized to block redundant network resources such as images, media, and heavy CSS at the protocol layer. This focused the rendering engine exclusively on DOM elements relevant to file-handling logic, significantly reducing latency.
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-gray-200 mb-1">3.4 Phase IV: Service-Oriented Architecture (Current Production)</h4>
                            <p>
                                The final iteration transformed the detection engine into a fully independent microservice to support enterprise-scale scanning.
                            </p>
                            <ul className="list-disc pl-6 mt-2 marker:text-gray-500">
                                <li>
                                    <span className="font-bold text-gray-200">Asynchronous API Integration:</span> The engine now runs behind a high-performance interface server.
                                </li>
                                <li>
                                    <span className="font-bold text-gray-200">Lifespan Management:</span> Utilizing context managers, the browser instance is initialized once at startup and reused across requests, reducing latency by ~600ms per scan compared to Phase III.
                                </li>
                                <li>
                                    <span className="font-bold text-gray-200">Concurrency Control:</span> Semaphore-based locking mechanisms limit active browser contexts to prevent resource exhaustion on the host machine while maintaining high throughput.
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Performance Results */}
                <section>
                    <h3 className="text-xl font-bold text-[#3b82f6] border-b border-gray-700 pb-2 mb-4 mt-8">
                        Performance Results & Key Findings
                    </h3>
                    <p className="mb-6">The comparative performance of each development stage is summarized below:</p>

                    {/* Table */}
                    <div className="overflow-x-auto mb-8 border border-gray-700 rounded-lg">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800/50 border-b border-gray-600">
                                    <th className="p-3 font-bold text-gray-200 border-r border-gray-700">Detection Stage</th>
                                    <th className="p-3 font-bold text-gray-200 border-r border-gray-700">Accuracy</th>
                                    <th className="p-3 font-bold text-gray-200">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                <tr>
                                    <td className="p-3 border-r border-gray-700">Keyword Search</td>
                                    <td className="p-3 border-r border-gray-700">84.6%</td>
                                    <td className="p-3">High False Positives</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border-r border-gray-700">Raw <code>&lt;input&gt;</code> Check</td>
                                    <td className="p-3 border-r border-gray-700">46.3%</td>
                                    <td className="p-3">Insufficient for Modern Web</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border-r border-gray-700">Rendered HTML (Total)</td>
                                    <td className="p-3 border-r border-gray-700">95.8%</td>
                                    <td className="p-3">Significant Discovery Jump</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border-r border-gray-700">Legacy Browser Engine</td>
                                    <td className="p-3 border-r border-gray-700">94.7%</td>
                                    <td className="p-3">Accurate but Slow</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border-r border-gray-700">Modern Headless Engine</td>
                                    <td className="p-3 border-r border-gray-700">92.3%</td>
                                    <td className="p-3">Tradeoff during migration</td>
                                </tr>
                                <tr className="bg-[#3b82f6]/10">
                                    <td className="p-3 border-r border-gray-700 font-bold text-white">FUD Microservice (Current)</td>
                                    <td className="p-3 border-r border-gray-700 font-bold text-white">96.76%</td>
                                    <td className="p-3 font-bold text-white">Optimal Accuracy & Performance</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50">
                        <p className="font-bold text-lg text-gray-200 mb-3">Key Insights:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-[#3b82f6]">
                            <li>
                                <span className="font-bold text-gray-200">Shadow DOM & Iframe Blindness:</span> Traditional crawlers are blind to ~15% of upload interfaces hidden in Shadow DOM or nested iframes. FUD's <code className="bg-gray-800 px-1 py-0.5 rounded text-sm">JS Strict Scan</code> successfully penetrates these layers.
                            </li>
                            <li>
                                <span className="font-bold text-gray-200">The Hydration Challenge:</span> Tools that fail to wait for full DOM hydration often miss dynamic uploaders. FUD overcomes this by emulating authentic browser event loops to ensure all components are loaded.
                            </li>
                            <li>
                                <span className="font-bold text-gray-200">Resource Efficiency:</span> By intercepting and blocking non-essential media (images/CSS) reduced the average scan time per URL by <span className="font-bold text-white">40%</span> without compromising detection integrity.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Conclusion */}
                <section>
                    <h3 className="text-xl font-bold text-[#3b82f6] border-b border-gray-700 pb-2 mb-4 mt-8">
                        Conclusion
                    </h3>
                    <p>
                        FUD validates that a <span className="font-bold text-gray-200">structural, resource-optimized browser approach</span> is superior to static analysis for mapping the modern web's attack surface. By combining lightweight static checks with heavy-duty DOM analysis only when necessary, FUD delivers a scalable, accurate, and framework-agnostic solution.
                    </p>
                    <p className="mt-4">
                        This tool not only advances the accuracy of file upload identification but also lays the groundwork for automated vulnerability scanners targeting unrestricted file upload flaws on a mass scale.
                    </p>
                </section>
            </div>
        ),
        date: "Feb 2026",
        category: "security",
        readTime: "15 min",
        tags: ["FUD", "Behavioral Analysis", "Web Security", "Research"],
        link: "#",
    },
];

export default function Blog() {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const t = useTranslations("Blog");

    const categoryConfig = {
        ctf: { color: "#8b5cf6", label: t("cat_ctf") },
        security: { color: "#00ff41", label: t("cat_security") },
        travel: { color: "#f59e0b", label: t("cat_travel") },
        dev: { color: "#00f3ff", label: t("cat_dev") },
    };

    return (
        <section id="blog" className="relative py-24 md:py-32">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/15 to-transparent" />

            <div className="max-w-6xl mx-auto px-6">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-14 text-center"
                >
                    <span lang="en" className="font-mono text-sm text-purple-400/50 tracking-wider uppercase block mb-3">
                        {t("tag")}
                    </span>
                    <h2 className="section-title">
                        <span className="text-gray-100">{t("title1")}</span>{" "}
                        <span className="text-purple-400">{t("title2")}</span>{" "}
                        <span className="text-gray-100">{t("title3")}</span>
                    </h2>
                    <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                        {t("desc")}
                    </p>
                </motion.div>

                {/* Posts Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {posts.map((post, index) => {
                        const cat = categoryConfig[post.category];
                        return (
                            <motion.div
                                key={post.title}
                                onClick={() => setSelectedPost(post)}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="glass-card p-6 group cursor-pointer hover:bg-white/5 transition-all"
                            >
                                {/* Top row */}
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        lang={post.category === "ctf" ? "en" : "tr"}
                                        className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider"
                                        style={{
                                            color: cat.color,
                                            backgroundColor: `${cat.color}15`,
                                            border: `1px solid ${cat.color}20`,
                                        }}
                                    >
                                        {cat.label}
                                    </span>
                                    <ArrowUpRight
                                        size={18}
                                        className="text-gray-600 group-hover:text-cyber-green group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                                    />
                                </div>

                                {/* Title */}
                                <h3 className="font-mono font-semibold text-gray-100 mb-2 group-hover:text-cyber-green transition-colors leading-snug">
                                    {post.title}
                                </h3>

                                {/* Excerpt */}
                                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                    {post.excerpt}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-4 text-xs text-gray-600 font-mono">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {post.readTime}
                                    </span>
                                    <span>{post.date}</span>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-800/50">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-dark-surface/60 border border-gray-800/50 text-gray-500"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedPost && selectedPost.content && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
                        onClick={() => setSelectedPost(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl relative shadow-2xl custom-scrollbar"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/80 text-gray-400 hover:text-white transition-all z-10 backdrop-blur-md"
                            >
                                <X size={24} />
                            </button>

                            {/* Content Container */}
                            <div className="p-8 md:p-12 lg:p-16">
                                {selectedPost.content}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
