"use client";

import { motion } from "framer-motion";
import { ExternalLink, Shield, Code, Terminal, Wifi, Lock, Database, Globe } from "lucide-react";

const projects = [
    {
        title: "WiFi & Bluetooth Jammer",
        description:
            "ESP32 mikrodenetleyicisi ile 2.4GHz WiFi ve Bluetooth frekanslarını analiz eden çift modlu cihaz. Arduino IDE ve C++ ile geliştirildi.",
        tags: ["ESP32", "C++", "Arduino", "IoT Security"],
        icon: Wifi,
        link: "#",
    },
    {
        title: "WiFi Deauthenticator",
        description:
            "ESP8266 ile WiFi trafiğini izleyen ve güvenlik açıklarını test eden (Packet Monitoring/Deauth) sistem.",
        tags: ["ESP8266", "Network Security", "C++", "Packet Sniffing"],
        icon: Shield,
        link: "#",
    },
    {
        title: "E-Ticaret Sitesi",
        description:
            "Angular ve Spring Boot tabanlı kapsamlı alışveriş sitesi. JWT ile güvenli giriş, ürün ve sepet yönetimi özellikleri.",
        tags: ["Angular", "Spring Boot", "Java", "JWT"],
        icon: Globe,
        link: "#",
    },
    {
        title: "Kitap Envanter Sistemi",
        description:
            "Java tabanlı stok takip otomasyonu. Observer, Composite ve Strategy gibi Tasarım Kalıpları (Design Patterns) kullanılarak geliştirildi.",
        tags: ["Java", "Design Patterns", "OOP", "Automation"],
        icon: Database,
        link: "#",
    },
    {
        title: "File Upload Detector",
        description:
            "Web sitelerinde file upload noktalarını tespit eden ve potansiyel güvenlik açıklarını analiz eden Python aracı.",
        tags: ["Python", "Web Security", "Vulnerability Scanning"],
        icon: Lock,
        link: "#",
    },
    {
        title: "Portfolio Website",
        description:
            "Bu web sitesi! Next.js, Tailwind CSS ve Three.js ile geliştirilmiş, siber güvenlik temalı kişisel portfolyo.",
        tags: ["Next.js", "React", "TypScript", "Three.js"],
        icon: Code,
        link: "#",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export default function Projects() {
    return (
        <section id="projects" className="relative py-24 md:py-32">
            {/* Section divider gradient */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-green/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <span className="font-mono text-sm text-cyber-green/50 tracking-wider uppercase block mb-3">
                        {"// career.mode()"}
                    </span>
                    <h2 className="section-title">
                        <span className="text-gray-100">Siber Güvenlik</span>{" "}
                        <span className="text-gradient-cyber">&</span>{" "}
                        <span className="text-gray-100">Yazılım</span>
                    </h2>
                    <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                        Güvenlik odaklı projeler ve yazılım geliştirme çalışmalarım
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.title}
                            variants={cardVariants}
                            className="glass-card p-6 group cursor-pointer relative overflow-hidden"
                        >
                            {/* Top glow line */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-green/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Icon */}
                            <div className="mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyber-green/10 flex items-center justify-center border border-cyber-green/20 group-hover:border-cyber-green/40 transition-colors duration-300">
                                    <project.icon
                                        size={20}
                                        className="text-cyber-green"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <motion.a
                                    href={project.link}
                                    className="ml-auto text-gray-500 hover:text-cyber-green transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <ExternalLink size={16} strokeWidth={1.5} />
                                </motion.a>
                            </div>

                            {/* Title */}
                            <h3 className="font-mono text-lg font-semibold text-gray-100 mb-2 group-hover:text-cyber-green transition-colors duration-300">
                                {project.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                {project.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag) => (
                                    <span key={tag} className="badge text-[11px]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Skills Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-16"
                >
                    <div className="glass-card p-6 md:p-8">
                        <h3 className="font-mono text-sm text-cyber-green/60 mb-6 tracking-wider uppercase">
                            {"// tech_stack.list()"}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {[
                                "Python",
                                "Java",
                                "JavaScript",
                                "TypeScript",
                                "C/C++",
                                "Bash",
                                "Linux",
                                "Docker",
                                "Wireshark",
                                "Burp Suite",
                                "Metasploit",
                                "Nmap",
                                "Git",
                                "React",
                                "Node.js",
                                "SQL",
                                "Network Security",
                                "Penetration Testing",
                                "OWASP",
                                "Cryptography",
                            ].map((skill) => (
                                <motion.span
                                    key={skill}
                                    className="px-4 py-2 rounded-lg text-sm font-mono bg-dark-surface/80 border border-gray-800 text-gray-300 hover:border-cyber-green/30 hover:text-cyber-green hover:bg-cyber-green/5 transition-all duration-300 cursor-default"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                >
                                    {skill}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
