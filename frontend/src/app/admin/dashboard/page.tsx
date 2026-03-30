"use client";

import React, { useState, useEffect, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authAPI, visitorAPI, travelAPI, blogAPI, projectAPI, certificateAPI, uploadAPI, timelineAPI, aboutAPI } from "@/lib/api";
import { Terminal, MapPin, Shield, Coffee, Save } from "lucide-react";

// ─── Types ──────────────────────────────────────────
interface Stats {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    uniqueIPs: number;
    recentVisitors: any[];
    topPages: { page: string; count: number }[];
    topCountries: { country: string; count: number }[];
}

interface Counts {
    travels: number;
    blogs: number;
    projects: number;
    certificates: number;
}

type ActiveTab = "overview" | "visitors" | "ga" | "travel" | "blogs" | "projects" | "certificates" | "timeline" | "about";

// ─── Main Dashboard ─────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
    const [stats, setStats] = useState<Stats | null>(null);
    const [counts, setCounts] = useState<Counts>({ travels: 0, blogs: 0, projects: 0, certificates: 0 });
    const [visitorList, setVisitorList] = useState<any[]>([]);
    const [visitorPage, setVisitorPage] = useState(1);
    const [visitorPagination, setVisitorPagination] = useState<any>(null);
    const [expandedIp, setExpandedIp] = useState<string | null>(null);

    // Content lists
    const [travels, setTravels] = useState<any[]>([]);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [timelines, setTimelines] = useState<any[]>([]);
    const [aboutData, setAboutData] = useState<any>(null);

    // ─── Auth Check ─────────────────────────────────
    useEffect(() => {
        if (!authAPI.isAuthenticated()) {
            router.push("/admin");
            return;
        }
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [statsData, travelsData, blogsData, projectsData, certsData, timelinesData, aboutRes] = await Promise.all([
                visitorAPI.getStats(),
                travelAPI.getAllAdmin(),
                blogAPI.getAllAdmin(),
                projectAPI.getAllAdmin(),
                certificateAPI.getAllAdmin(),
                timelineAPI.getAllAdmin(),
                aboutAPI.get(),
            ]);
            setStats(statsData);
            setTravels(travelsData);
            setBlogs(blogsData);
            setProjects(projectsData);
            setCertificates(certsData);
            setTimelines(timelinesData);
            setAboutData(aboutRes);
            setCounts({
                ...counts,
                travels: travelsData.length,
                blogs: blogsData.length,
                projects: projectsData.length,
                certificates: certsData.length,
            });
        } catch (err) {
            console.error("Dashboard load error:", err);
            authAPI.logout();
            router.push("/admin");
        } finally {
            setLoading(false);
        }
    };

    const loadVisitors = useCallback(async (page: number) => {
        try {
            const data = await visitorAPI.getVisitors(page, 20);
            setVisitorList(data.visitors);
            setVisitorPagination(data.pagination);
            setVisitorPage(page);
        } catch (err) {
            console.error("Visitor load error:", err);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "visitors") {
            loadVisitors(1);
        }
    }, [activeTab, loadVisitors]);

    const handleLogout = () => {
        authAPI.logout();
        router.push("/admin");
    };

    const handleDelete = async (type: string, id: string) => {
        if (!confirm("Bu öğeyi silmek istediğinize emin misiniz?")) return;
        try {
            switch (type) {
                case "travel": await travelAPI.delete(id); break;
                case "blog": await blogAPI.delete(id); break;
                case "project": await projectAPI.delete(id); break;
                case "certificate": await certificateAPI.delete(id); break;
                case "timeline": await timelineAPI.delete(id); break;
            }
            loadDashboard();
        } catch (err: any) {
            alert("Silme hatası: " + err.message);
        }
    };

    const handleToggleActive = async (type: string, id: string, currentlyActive: boolean) => {
        try {
            const data = { isActive: !currentlyActive };
            switch (type) {
                case "travel": await travelAPI.update(id, data); break;
                case "blog": await blogAPI.update(id, data); break;
                case "project": await projectAPI.update(id, data); break;
                case "certificate": await certificateAPI.update(id, data); break;
                case "timeline": await timelineAPI.update(id, data); break;
            }
            loadDashboard();
        } catch (err: any) {
            alert("Durum değiştirme hatası: " + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-cyber-green/20 border-t-cyber-green rounded-full animate-spin" />
                    <p className="font-mono text-sm text-gray-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    // ─── Sidebar tabs ───────────────────────────────
    const tabs: { id: ActiveTab; label: string; icon: string }[] = [
        { id: "overview", label: "Genel Bakış", icon: "📊" },
        { id: "visitors", label: "Yerel Ziyaretçiler", icon: "👥" },
        { id: "ga", label: "Google Analytics", icon: "📈" },
        { id: "about", label: "Hakkımda", icon: "👨‍💻" },
        { id: "timeline", label: "Deneyim & Eğitim", icon: "⏳" },
        { id: "travel", label: "Seyahatler", icon: "🌍" },
        { id: "blogs", label: "Blog Yazıları", icon: "📝" },
        { id: "projects", label: "Projeler", icon: "💻" },
        { id: "certificates", label: "Sertifikalar", icon: "🏅" },
    ];

    return (
        <div className="min-h-screen flex">
            {/* ─── Sidebar ────────────────────────────── */}
            <aside className="w-64 bg-[#0d0d1a] border-r border-gray-800 flex flex-col fixed h-full">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="font-mono text-lg font-bold text-gradient-cyber">
                        ⚡ Kerem DÜZ
                    </h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono transition-all ${activeTab === tab.id
                                ? "bg-cyber-green/10 text-cyber-green border border-cyber-green/20"
                                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <span>🚪</span>
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* ─── Main Content ───────────────────────── */}
            <main className="flex-1 ml-64 p-8">
                {/* ─── Overview Tab ───────────────────── */}
                {activeTab === "overview" && (
                    <div>
                        <h2 className="font-mono text-2xl font-bold text-gray-100 mb-8">
                            Genel Bakış
                        </h2>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: "Bugün", value: stats?.today || 0, color: "text-cyber-green" },
                                { label: "Bu Hafta", value: stats?.thisWeek || 0, color: "text-cyan-400" },
                                { label: "Bu Ay", value: stats?.thisMonth || 0, color: "text-purple-400" },
                                { label: "Toplam", value: stats?.total || 0, color: "text-amber-400" },
                            ].map((stat) => (
                                <div key={stat.label} className="glass-card p-6">
                                    <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
                                        {stat.label}
                                    </p>
                                    <p className={`text-3xl font-mono font-bold ${stat.color}`}>
                                        {stat.value.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1 font-mono">ziyaretçi</p>
                                </div>
                            ))}
                        </div>

                        {/* Content stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: "Seyahat Noktası", value: counts.travels, icon: "🌍" },
                                { label: "Blog Yazısı", value: counts.blogs, icon: "📝" },
                                { label: "Proje", value: counts.projects, icon: "💻" },
                                { label: "Sertifika", value: counts.certificates, icon: "🏅" },
                            ].map((item) => (
                                <div key={item.label} className="glass-card p-6 flex items-center gap-4">
                                    <span className="text-3xl">{item.icon}</span>
                                    <div>
                                        <p className="text-2xl font-mono font-bold text-gray-100">{item.value}</p>
                                        <p className="text-xs text-gray-500 font-mono">{item.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Visitors + Top Pages */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Visitors */}
                            <div className="glass-card p-6">
                                <h3 className="font-mono text-sm text-gray-400 uppercase tracking-wider mb-4">
                                    Son Ziyaretçiler
                                </h3>
                                <div className="space-y-3">
                                    {stats?.recentVisitors.map((v: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-cyber-green/10 flex items-center justify-center text-xs font-mono text-cyber-green">
                                                    {v.device === "mobile" ? "📱" : "🖥️"}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-300 font-mono">{v.page}</p>
                                                    <p className="text-xs text-gray-600">{v.browser} • {v.os}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-600 font-mono">
                                                {new Date(v.visitedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                    )) || <p className="text-gray-600 text-sm">Henüz ziyaretçi yok</p>}
                                </div>
                            </div>

                            {/* Top Pages */}
                            <div className="glass-card p-6">
                                <h3 className="font-mono text-sm text-gray-400 uppercase tracking-wider mb-4">
                                    En Çok Ziyaret Edilen Sayfalar
                                </h3>
                                <div className="space-y-3">
                                    {stats?.topPages.map((p: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between py-2">
                                            <span className="text-sm text-gray-300 font-mono">{p.page}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-cyber-green to-cyan-400 rounded-full"
                                                        style={{
                                                            width: `${((p.count / (stats.topPages[0]?.count || 1)) * 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 font-mono w-8 text-right">
                                                    {p.count}
                                                </span>
                                            </div>
                                        </div>
                                    )) || <p className="text-gray-600 text-sm">Veri yok</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Visitors Tab ────────────────────── */}
                {activeTab === "visitors" && (
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-mono text-2xl font-bold text-gray-100">
                                Ziyaretçi Logları
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 font-mono">
                                    Tekil IP: {stats?.uniqueIPs || 0}
                                </span>
                            </div>
                        </div>

                        <div className="glass-card overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase">Tarih</th>
                                        <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase">IP</th>
                                        <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase">Sayfa</th>
                                        <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase">Tarayıcı</th>
                                        <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase">Cihaz</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visitorList.map((v: any, i: number) => {
                                        const isExpanded = expandedIp === v.ip;
                                        return (
                                            <React.Fragment key={i}>
                                                <tr
                                                    onClick={() => setExpandedIp(isExpanded ? null : v.ip)}
                                                    className={`border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer ${isExpanded ? 'bg-white/5' : ''}`}
                                                >
                                                    <td className="px-4 py-3 text-sm font-mono text-gray-400">
                                                        {new Date(v.visitedAt).toLocaleString("tr-TR")}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-mono text-cyber-green/70">
                                                        <div className="flex items-center gap-2">
                                                            <span>{isExpanded ? '▼' : '▶'}</span>
                                                            {v.ip}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-mono text-gray-300">
                                                        {v.actions && v.actions.length > 0 ? (
                                                            <span className="text-cyber-green text-xs">
                                                                {v.actions.length} işlem kaydı
                                                            </span>
                                                        ) : (
                                                            v.page
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-400">{v.browser}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-400">
                                                        {v.device === "mobile" ? "📱 Mobil" : v.device === "tablet" ? "📱 Tablet" : "🖥️ Masaüstü"}
                                                    </td>
                                                </tr>
                                                {isExpanded && v.actions && (
                                                    <tr className="bg-[#0a0a16] border-b border-gray-800/50">
                                                        <td colSpan={5} className="p-0">
                                                            <div className="pl-12 pr-4 py-4 max-h-60 overflow-y-auto space-y-2">
                                                                <h4 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Ziyaretçinin Tüm Hareketleri</h4>
                                                                {v.actions.map((action: any, aIdx: number) => (
                                                                    <div key={aIdx} className="flex items-center gap-4 text-sm font-mono py-1.5 border-l-2 border-cyber-green/30 pl-3 hover:border-cyber-green transition-colors">
                                                                        <span className="text-gray-500 min-w-[140px]">
                                                                            {new Date(action.visitedAt).toLocaleString("tr-TR")}
                                                                        </span>
                                                                        <span className="text-gray-300">{action.page}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                    {visitorList.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-600 font-mono">
                                                Henüz ziyaretçi kaydı yok
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {visitorPagination && visitorPagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {Array.from({ length: Math.min(visitorPagination.pages, 10) }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => loadVisitors(p)}
                                        className={`px-3 py-2 rounded-lg font-mono text-sm transition-all ${p === visitorPage
                                            ? "bg-cyber-green/10 text-cyber-green border border-cyber-green/20"
                                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Travel Tab ─────────────────────── */}
                {activeTab === "travel" && (
                    <ContentListView
                        title="Seyahat Noktaları"
                        items={travels}
                        type="travel"
                        onDelete={(id) => handleDelete("travel", id)}
                        onToggleActive={(id, active) => handleToggleActive("travel", id, active)}
                        onSave={async (data, id) => {
                            if (id) await travelAPI.update(id, data);
                            else await travelAPI.create(data);
                            loadDashboard();
                        }}
                        columns={[
                            { key: "label", label: "Şehir" },
                            { key: "country", label: "Ülke" },
                            { key: "description", label: "Tarih" },
                            { key: "media", label: "Medya", render: (v: any[]) => `${v?.length || 0} dosya` },
                        ]}
                        formFields={[
                            { key: "label", label: "Şehir", type: "text", required: true },
                            { key: "country", label: "Ülke", type: "text", required: true },
                            { key: "lat", label: "Enlem", type: "number", required: true },
                            { key: "lng", label: "Boylam", type: "number", required: true },
                            { key: "description", label: "Tarih / Açıklama", type: "text", required: true },
                            { key: "image", label: "Kapak Görseli", type: "image", required: true },
                            { key: "media", label: "Medya Galerisi (Klasör)", type: "media" },
                            { key: "color", label: "Renk", type: "text" },
                            { key: "order", label: "Sıra", type: "number" },
                        ]}
                    />
                )}

                {/* ─── Blogs Tab ──────────────────────── */}
                {activeTab === "blogs" && (
                    <ContentListView
                        title="Blog Yazıları"
                        items={blogs}
                        type="blog"
                        onDelete={(id) => handleDelete("blog", id)}
                        onToggleActive={(id, active) => handleToggleActive("blog", id, active)}
                        onSave={async (data, id) => {
                            if (id) await blogAPI.update(id, data);
                            else await blogAPI.create(data);
                            loadDashboard();
                        }}
                        columns={[
                            { key: "title", label: "Başlık" },
                            { key: "category", label: "Kategori" },
                            { key: "date", label: "Tarih" },
                            { key: "tags", label: "Etiketler", render: (v: string[]) => v?.join(", ") || "-" },
                        ]}
                        formFields={[
                            { key: "title", label: "Başlık", type: "text", required: true },
                            { key: "excerpt", label: "Özet", type: "textarea", required: true },
                            { key: "content", label: "İçerik", type: "textarea" },
                            { key: "date", label: "Tarih", type: "text", required: true },
                            { key: "category", label: "Kategori", type: "select", options: ["ctf", "security", "travel", "dev"], required: true },
                            { key: "readTime", label: "Okuma Süresi", type: "text", required: true },
                            { key: "tags", label: "Etiketler (virgülle)", type: "text" },
                            { key: "link", label: "Link", type: "text" },
                        ]}
                    />
                )}

                {/* ─── Projects Tab ───────────────────── */}
                {activeTab === "projects" && (
                    <ContentListView
                        title="Projeler"
                        items={projects}
                        type="project"
                        onDelete={(id) => handleDelete("project", id)}
                        onToggleActive={(id, active) => handleToggleActive("project", id, active)}
                        onSave={async (data, id) => {
                            if (id) await projectAPI.update(id, data);
                            else await projectAPI.create(data);
                            loadDashboard();
                        }}
                        columns={[
                            { key: "title", label: "Proje Adı" },
                            { key: "tags", label: "Teknolojiler", render: (v: string[]) => v?.join(", ") || "-" },
                            { key: "link", label: "Link" },
                        ]}
                        formFields={[
                            { key: "title", label: "Proje Adı", type: "text", required: true },
                            { key: "description", label: "Açıklama", type: "textarea", required: true },
                            { key: "tags", label: "Teknolojiler (virgülle)", type: "text" },
                            { key: "icon", label: "İkon", type: "select", options: ["shield", "code", "terminal", "wifi", "lock", "database", "globe"] },
                            { key: "link", label: "Link", type: "text" },
                            { key: "order", label: "Sıra", type: "number" },
                        ]}
                    />
                )}

                {/* ─── Certificates Tab ───────────────── */}
                {activeTab === "certificates" && (
                    <ContentListView
                        title="Sertifikalar"
                        items={certificates}
                        type="certificate"
                        onDelete={(id) => handleDelete("certificate", id)}
                        onToggleActive={(id, active) => handleToggleActive("certificate", id, active)}
                        onSave={async (data, id) => {
                            if (id) await certificateAPI.update(id, data);
                            else await certificateAPI.create(data);
                            loadDashboard();
                        }}
                        columns={[
                            { key: "title", label: "Sertifika Adı" },
                            { key: "issuer", label: "Kurum" },
                            { key: "date", label: "Tarih" },
                        ]}
                        formFields={[
                            { key: "title", label: "Sertifika Adı", type: "text", required: true },
                            { key: "issuer", label: "Kurum", type: "text", required: true },
                            { key: "date", label: "Tarih", type: "text", required: true },
                            { key: "color", label: "Renk", type: "text" },
                            { key: "icon", label: "İkon", type: "select", options: ["shield", "code", "globe", "award"] },
                            { key: "image", label: "Görsel", type: "image" },
                            { key: "link", label: "Link", type: "text" },
                            { key: "order", label: "Sıra", type: "number" },
                        ]}
                    />
                )}

                {/* ─── Google Analytics Tab ──────────────── */}
                {activeTab === "ga" && (
                    <GATab />
                )}

                {/* ─── Timeline Tab ─────────────────────── */}
                {activeTab === "timeline" && (
                    <ContentListView
                        title="Deneyim & Eğitim (Timeline)"
                        items={timelines}
                        type="timeline"
                        onDelete={(id) => handleDelete("timeline", id)}
                        onToggleActive={(id, active) => handleToggleActive("timeline", id, active)}
                        onSave={async (data, id) => {
                            if (id) await timelineAPI.update(id, data);
                            else await timelineAPI.create(data);
                            loadDashboard();
                        }}
                        columns={[
                            { key: "year", label: "Yıl" },
                            { key: "title", label: "Başlık" },
                            { key: "subtitle", label: "Alt Başlık" },
                            { key: "type", label: "Tür" },
                        ]}
                        formFields={[
                            { key: "year", label: "Yıl Değeri", type: "text", required: true },
                            { key: "title", label: "Başlık", type: "text", required: true },
                            { key: "subtitle", label: "Alt Başlık (Firma/Okul)", type: "text", required: true },
                            { key: "description", label: "Açıklama", type: "textarea", required: true },
                            { key: "type", label: "Tür", type: "select", options: ["education", "work", "certification"], required: true },
                            { key: "tags", label: "Etiketler (virgülle)", type: "text" },
                            { key: "order", label: "Sıralama (Küçük önce)", type: "number" },
                        ]}
                    />
                )}

                {/* ─── About Tab ────────────────────────── */}
                {activeTab === "about" && (
                    <AboutForm
                        data={aboutData}
                        onSave={async (data) => {
                            await aboutAPI.upsert(data);
                            loadDashboard();
                        }}
                    />
                )}
            </main>
        </div>
    );
}

// ─── Form Field Types ───────────────────────────────
interface FormField {
    key: string;
    label: string;
    type: "text" | "textarea" | "number" | "select" | "image" | "media";
    required?: boolean;
    options?: string[];
}

// ─── Reusable Content List with Create/Edit ─────────
function ContentListView({
    title,
    items,
    type,
    onDelete,
    onToggleActive,
    onSave,
    columns,
    formFields,
}: {
    title: string;
    items: any[];
    type: string;
    onDelete: (id: string) => void;
    onToggleActive: (id: string, currentlyActive: boolean) => void;
    onSave: (data: any, id?: string) => Promise<void>;
    columns: { key: string; label: string; render?: (value: any) => string }[];
    formFields: FormField[];
}) {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingField(fieldKey);
        setError("");
        try {
            const data = await uploadAPI.upload(file, type);
            setFormData(prev => ({ ...prev, [fieldKey]: data.url }));
        } catch (err: any) {
            setError(err.message || "Yükleme hatası oluştu.");
        } finally {
            setUploadingField(null);
        }
    };

    const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingField(fieldKey);
        setError("");
        try {
            const uploadedMedia = [...(formData[fieldKey] || [])];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const data = await uploadAPI.upload(file, type);
                uploadedMedia.push({
                    type: file.type.startsWith("video/") ? "video" : "image",
                    src: data.url
                });
                setFormData(prev => ({ ...prev, [fieldKey]: [...uploadedMedia] }));
            }
        } catch (err: any) {
            setError(err.message || "Çoklu yükleme sırasında bir hata oluştu.");
        } finally {
            setUploadingField(null);
            if (e.target) e.target.value = "";
        }
    };

    const openCreateForm = () => {
        setEditingItem(null);
        setFormData({});
        setError("");
        setShowForm(true);
    };

    const openEditForm = (item: any) => {
        setEditingItem(item);
        const data: Record<string, any> = {};
        formFields.forEach((field) => {
            if (field.key === "tags" && Array.isArray(item[field.key])) {
                data[field.key] = item[field.key].join(", ");
            } else {
                data[field.key] = item[field.key] ?? "";
            }
        });
        setFormData(data);
        setError("");
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const processed: Record<string, any> = { ...formData };

            // Convert comma-separated strings to arrays for tags
            formFields.forEach((field) => {
                if (field.key === "tags" && typeof processed[field.key] === "string") {
                    processed[field.key] = processed[field.key]
                        .split(",")
                        .map((t: string) => t.trim())
                        .filter(Boolean);
                }
                if (field.type === "number" && processed[field.key] !== undefined && processed[field.key] !== "") {
                    processed[field.key] = Number(processed[field.key]);
                }
            });

            await onSave(processed, editingItem?._id);
            setShowForm(false);
            setFormData({});
            setEditingItem(null);
        } catch (err: any) {
            setError(err.message || "Kaydetme hatası oluştu.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-mono text-2xl font-bold text-gray-100">{title}</h2>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-mono">{items.length} kayıt</span>
                    <button
                        onClick={openCreateForm}
                        className="px-4 py-2 bg-cyber-green/10 border border-cyber-green/30 rounded-lg font-mono text-sm text-cyber-green hover:bg-cyber-green/20 transition-all"
                    >
                        + Yeni Ekle
                    </button>
                </div>
            </div>

            {/* ─── Create/Edit Form ──────────────────── */}
            {showForm && (
                <div className="glass-card p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-mono text-lg text-gray-100">
                            {editingItem ? "Düzenle" : "Yeni Ekle"}
                        </h3>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-gray-500 hover:text-gray-300 font-mono text-sm"
                        >
                            ✕ Kapat
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formFields.map((field) => (
                            <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                                    {field.label} {field.required && <span className="text-red-400">*</span>}
                                </label>
                                {field.type === "textarea" ? (
                                    <textarea
                                        value={formData[field.key] || ""}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                        required={field.required}
                                        rows={3}
                                        className="w-full px-3 py-2 bg-dark-bg/50 border border-gray-700 rounded-lg font-mono text-sm text-gray-200 placeholder-gray-600 focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/20 focus:outline-none transition-all resize-vertical"
                                    />
                                ) : field.type === "select" ? (
                                    <select
                                        value={formData[field.key] || ""}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                        required={field.required}
                                        className="w-full px-3 py-2 bg-dark-bg/50 border border-gray-700 rounded-lg font-mono text-sm text-gray-200 focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/20 focus:outline-none transition-all"
                                    >
                                        <option value="">Seçiniz...</option>
                                        {field.options?.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : field.type === "media" ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <label className={`flex-1 flex items-center justify-center px-4 py-2 border border-dashed rounded-lg font-mono text-xs cursor-pointer transition-all ${uploadingField === field.key ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed' : 'bg-dark-bg/50 border-gray-700 text-gray-400 hover:border-cyber-green/50 hover:text-cyber-green'}`}>
                                                {uploadingField === field.key ? "Yükleniyor..." : "📁 Klasör Seç"}
                                                <input
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    multiple
                                                    {...{ webkitdirectory: "true", mozdirectory: "true" }}
                                                    onChange={(e) => handleMultipleFileUpload(e, field.key)}
                                                    className="hidden"
                                                    disabled={uploadingField === field.key}
                                                />
                                            </label>
                                            <label className={`flex-1 flex items-center justify-center px-4 py-2 border border-dashed rounded-lg font-mono text-xs cursor-pointer transition-all ${uploadingField === field.key ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed' : 'bg-dark-bg/50 border-gray-700 text-gray-400 hover:border-cyber-green/50 hover:text-cyber-green'}`}>
                                                {uploadingField === field.key ? "Yükleniyor..." : "📄 Dosyaları Seç"}
                                                <input
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    multiple
                                                    onChange={(e) => handleMultipleFileUpload(e, field.key)}
                                                    className="hidden"
                                                    disabled={uploadingField === field.key}
                                                />
                                            </label>
                                        </div>
                                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-dark-bg/50 rounded-lg border border-gray-800">
                                            {formData[field.key]?.map((m: any, idx: number) => (
                                                <div key={idx} className="w-12 h-12 rounded border border-gray-700 bg-gray-900 overflow-hidden relative group">
                                                    {m.type === "image" ? (
                                                        <img src={m.src} alt="preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-full h-full text-[10px] text-gray-400">🎬</div>
                                                    )}
                                                    <button type="button" onClick={() => {
                                                        const newMedia = [...formData[field.key]];
                                                        newMedia.splice(idx, 1);
                                                        setFormData(prev => ({ ...prev, [field.key]: newMedia }));
                                                    }} className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                                </div>
                                            ))}
                                            {(!formData[field.key] || formData[field.key].length === 0) && (
                                                <p className="text-[10px] text-gray-600 font-mono w-full text-center py-2">Henüz medya yüklenmedi</p>
                                            )}
                                        </div>
                                    </div>
                                ) : field.type === "image" ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData[field.key] || ""}
                                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                            placeholder="URL girin veya dosya yükleyin"
                                            className="flex-1 w-full px-3 py-2 bg-dark-bg/50 border border-gray-700 rounded-lg font-mono text-sm text-gray-200 placeholder-gray-600 focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/20 focus:outline-none transition-all"
                                        />
                                        <label className={`flex-shrink-0 flex items-center justify-center px-4 rounded-lg font-mono text-sm cursor-pointer transition-all ${uploadingField === field.key ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20 border border-cyber-green/20'}`}>
                                            {uploadingField === field.key ? "Yükleniyor.." : "Yükle"}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, field.key)}
                                                className="hidden"
                                                disabled={uploadingField === field.key}
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <input
                                        type={field.type === "number" ? "number" : "text"}
                                        step={field.type === "number" ? "any" : undefined}
                                        value={formData[field.key] ?? ""}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                        required={field.required}
                                        className="w-full px-3 py-2 bg-dark-bg/50 border border-gray-700 rounded-lg font-mono text-sm text-gray-200 placeholder-gray-600 focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/20 focus:outline-none transition-all"
                                    />
                                )}
                            </div>
                        ))}

                        {error && (
                            <div className="md:col-span-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-red-400 text-sm font-mono">{error}</p>
                            </div>
                        )}

                        <div className="md:col-span-2 flex gap-3 justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-sm font-mono text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-cyber-green/10 border border-cyber-green/30 rounded-lg font-mono text-sm text-cyber-green hover:bg-cyber-green/20 transition-all disabled:opacity-50"
                            >
                                {saving ? "Kaydediliyor..." : editingItem ? "Güncelle" : "Kaydet"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ─── Table ─────────────────────────────── */}
            <div className="glass-card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800">
                            {columns.map((col) => (
                                <th key={col.key} className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="text-right px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any) => (
                            <tr key={item._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-sm text-gray-300 font-mono">
                                        {col.render ? col.render(item[col.key]) : (item[col.key] || "-")}
                                    </td>
                                ))}
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => onToggleActive(item._id, item.isActive)}
                                        className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${item.isActive
                                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}
                                    >
                                        {item.isActive ? "✓ Aktif" : "✗ Pasif"}
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEditForm(item)}
                                            className="px-3 py-1.5 text-xs font-mono text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => onDelete(item._id)}
                                            className="px-3 py-1.5 text-xs font-mono text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 2} className="px-4 py-8 text-center text-gray-600 font-mono">
                                    Henüz kayıt yok
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── About Form Interface ────────────────────────────
function AboutForm({ data, onSave }: { data: any, onSave: (data: any) => Promise<void> }) {
    const t = useTranslations("About");
    const [formData, setFormData] = useState<any>(data || {});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (data && Object.keys(data).length > 0) {
            setFormData(data);
        } else {
            // First time use: preload from static i18n values
            setFormData({
                terminal_title: "kerem@portfolio ~ $ cat about.txt",
                p1_1: t("intro.p1_1"),
                p1_2: t("intro.p1_2"),
                p1_3: t("intro.p1_3"),
                p2: t("intro.p2"),
                p3: t("intro.p3"),
                focusLabel: t("stats.focusLabel"),
                focusValue: t("stats.focusValue"),
                expertiseLabel: t("stats.expertiseLabel"),
                expertiseValue: t("stats.expertiseValue"),
                locationLabel: t("stats.locationLabel"),
                locationValue: t("stats.locationValue"),
                fuelLabel: t("stats.fuelLabel"),
                fuelValue: t("stats.fuelValue"),
            });
        }
    }, [data, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            alert("Hakkımda bilgileri güncellendi!");
        } catch (err: any) {
            alert("Kaydetme hatası: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (data) setFormData(data);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="font-mono text-2xl font-bold text-gray-100">Hakkımda Görsel Düzenleyici</h2>
                    <p className="text-gray-400 font-mono text-sm mt-1">Sitedeki görünümüyle birebir düzenleyin. Değiştirmek için metinlerin üzerine tıklayın.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 font-mono text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Geri Al
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-cyber-green text-black px-6 py-2 rounded-lg font-mono text-sm font-bold opacity-90 hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                        <Save size={16} />
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-5 gap-8 items-start">
                {/* Left — Terminal-style bio */}
                <div className="md:col-span-3 glass-card p-6 md:p-8">
                    {/* Terminal header */}
                    <div className="flex items-center gap-2 mb-8 pb-3 border-b border-gray-800">
                        <div className="w-3 h-3 rounded-full bg-red-500/70 shrink-0" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70 shrink-0" />
                        <div className="w-3 h-3 rounded-full bg-green-500/70 shrink-0" />
                        <input
                            type="text"
                            value={formData.terminal_title || ""}
                            onChange={(e) => setFormData({ ...formData, terminal_title: e.target.value })}
                            className="ml-3 font-mono text-xs text-gray-400 bg-transparent border-0 border-b border-transparent hover:border-gray-700 focus:border-cyber-green/50 focus:outline-none flex-1 transition-all"
                            placeholder="Terminal başlığı"
                            required
                        />
                    </div>

                    <div className="space-y-4 font-mono text-sm leading-relaxed">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-cyber-green">{">"}</span>
                            <input
                                type="text"
                                value={formData.p1_1 || ""}
                                onChange={(e) => setFormData({ ...formData, p1_1: e.target.value })}
                                className="text-gray-300 bg-transparent border-b border-transparent bg-white/5 hover:border-gray-700 focus:border-cyber-green/50 focus:outline-none transition-all w-24 p-1 rounded-t line-clamp-1"
                                placeholder="Giriş"
                                required
                            />
                            <input
                                type="text"
                                value={formData.p1_2 || ""}
                                onChange={(e) => setFormData({ ...formData, p1_2: e.target.value })}
                                className="text-cyber-green font-semibold bg-transparent border-b border-transparent bg-white/5 hover:border-gray-700 focus:border-cyber-green/50 focus:outline-none transition-all w-28 p-1 rounded-t line-clamp-1"
                                placeholder="İsim"
                                required
                            />
                            <input
                                type="text"
                                value={formData.p1_3 || ""}
                                onChange={(e) => setFormData({ ...formData, p1_3: e.target.value })}
                                className="text-gray-300 bg-transparent border-b border-transparent bg-white/5 hover:border-gray-700 focus:border-cyber-green/50 focus:outline-none transition-all flex-1 min-w-[150px] p-1 rounded-t"
                                placeholder="Devamı"
                                required
                            />
                        </div>
                        
                        <div className="flex gap-3 items-start mt-6">
                            <span className="text-cyber-green mt-2">{">"}</span>
                            <textarea
                                value={formData.p2 || ""}
                                onChange={(e) => setFormData({ ...formData, p2: e.target.value })}
                                className="text-gray-400 bg-transparent border border-transparent bg-white/5 hover:border-gray-700 focus:border-cyber-green/50 focus:bg-white/10 focus:shadow-inner focus:outline-none transition-all flex-1 min-h-[120px] w-full resize-y rounded p-3"
                                placeholder="Paragraf 2"
                                required
                            />
                        </div>

                        <div className="flex gap-3 items-start mt-4">
                            <span className="text-cyber-green mt-2">{">"}</span>
                            <textarea
                                value={formData.p3 || ""}
                                onChange={(e) => setFormData({ ...formData, p3: e.target.value })}
                                className="text-gray-400 bg-transparent border border-transparent bg-white/5 hover:border-gray-700 focus:border-cyber-green/50 focus:bg-white/10 focus:shadow-inner focus:outline-none transition-all flex-1 min-h-[120px] w-full resize-y rounded p-3"
                                placeholder="Paragraf 3"
                                required
                            />
                        </div>
                        <p className="text-gray-500 mt-4 pl-1">
                            <span className="text-cyber-green animate-blink">█</span>
                        </p>
                    </div>
                </div>

                {/* Right — Quick facts */}
                <div className="md:col-span-2 space-y-4">
                    {[
                        {
                            id: "focus",
                            icon: Terminal,
                            labelKey: "focusLabel",
                            valueKey: "focusValue",
                            color: "#00ff41",
                        },
                        {
                            id: "expertise",
                            icon: Shield,
                            labelKey: "expertiseLabel",
                            valueKey: "expertiseValue",
                            color: "#00f3ff",
                        },
                        {
                            id: "location",
                            icon: MapPin,
                            labelKey: "locationLabel",
                            valueKey: "locationValue",
                            color: "#f59e0b",
                        },
                        {
                            id: "fuel",
                            icon: Coffee,
                            labelKey: "fuelLabel",
                            valueKey: "fuelValue",
                            color: "#f97316",
                        },
                    ].map((item, i) => (
                        <div
                            key={item.id}
                            className="glass-card p-4 flex items-center gap-4 group hover:border-gray-700 transition-colors"
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                    backgroundColor: `${item.color}15`,
                                    border: `1px solid ${item.color}25`,
                                }}
                            >
                                <item.icon
                                    size={18}
                                    style={{ color: item.color }}
                                    strokeWidth={1.5}
                                />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                <input
                                    type="text"
                                    value={formData[item.labelKey] || ""}
                                    onChange={(e) => setFormData({ ...formData, [item.labelKey]: e.target.value })}
                                    className="text-gray-500 text-xs font-mono uppercase tracking-wider bg-transparent border-b border-transparent bg-white/5 hover:border-gray-700 focus:border-cyber-green/50 focus:outline-none transition-all w-full p-0.5 rounded-t"
                                    placeholder="Başlık"
                                    required
                                />
                                <input
                                    type="text"
                                    value={formData[item.valueKey] || ""}
                                    onChange={(e) => setFormData({ ...formData, [item.valueKey]: e.target.value })}
                                    className="text-gray-200 text-sm font-medium bg-transparent border-b border-transparent bg-white/5 hover:border-gray-700 focus:border-cyber-green/50 focus:outline-none transition-all w-full leading-tight p-0.5 rounded-t"
                                    placeholder="Değer"
                                    required
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </form>
    );
}

// ─── Google Analytics Tab Component ─────────────────
function GATab() {
    const [embedUrl, setEmbedUrl] = useState<string>("");
    const [savedUrl, setSavedUrl] = useState<string>("");

    useEffect(() => {
        const stored = localStorage.getItem("ga_looker_studio_url");
        if (stored) {
            setSavedUrl(stored);
            setEmbedUrl(stored);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem("ga_looker_studio_url", embedUrl);
        setSavedUrl(embedUrl);
        alert("Google Analytics panosu kaydedildi!");
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="glass-card p-6 border-l-4 border-cyber-green">
                <h2 className="text-xl font-mono text-gray-100 mb-2">Google Analytics Entegrasyonu</h2>
                <p className="text-sm font-mono text-gray-400 leading-relaxed mb-4">
                    Siteye Google Analytics (GA4) kodları yerleştirilmiştir. Ziyaretçi bildirim detaylarını, sayfa sürelerini ve lokasyonlarını kendi panelinizden görmek için Google'ın ücretsiz aracı olan <strong>Looker Studio</strong> (eski adıyla Data Studio) kullanıyoruz. <br /><br />
                    1. <a href="https://lookerstudio.google.com/" target="_blank" rel="noreferrer" className="text-cyber-green underline">Looker Studio</a> sayfasına gidin ve GA4 mülkünüzü seçerek bir rapor oluşturun.<br />
                    2. Raporu oluşturduktan sonra sağ üstteki "Paylaş" sekmesinden "Raporu Yerleştir (Embed)" diyerek verilen iframe içindeki URL bağlantısını (src="..." arasındaki linki) kopyalayın.<br />
                    3. Kopyaladığınız linki aşağıdaki alana yapıştırın ve kaydedin.
                </p>
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={embedUrl}
                        onChange={(e) => setEmbedUrl(e.target.value)}
                        placeholder="https://lookerstudio.google.com/embed/reporting/..."
                        className="flex-1 px-4 py-2 bg-dark-bg/50 border border-gray-700 rounded-lg font-mono text-sm text-gray-200 focus:border-cyber-green/50 focus:outline-none transition-all"
                    />
                    <button
                        onClick={handleSave}
                        className="bg-cyber-green text-black px-6 py-2 rounded-lg font-mono text-sm font-bold opacity-90 hover:opacity-100 transition-opacity"
                    >
                        Kaydet
                    </button>
                    {savedUrl && (
                        <button
                            onClick={() => {
                                localStorage.removeItem("ga_looker_studio_url");
                                setSavedUrl("");
                                setEmbedUrl("");
                            }}
                            className="bg-red-500/20 text-red-400 px-6 py-2 rounded-lg font-mono text-sm font-bold hover:bg-red-500/30 transition-all border border-red-500/30"
                        >
                            Kaldır
                        </button>
                    )}
                </div>
            </div>

            {savedUrl ? (
                <div className="glass-card overflow-hidden h-[800px] w-full border border-gray-800 rounded-lg">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={savedUrl} 
                        frameBorder="0" 
                        allowFullScreen 
                        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    />
                </div>
            ) : (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-[400px] border border-dashed border-gray-800">
                    <div className="text-6xl mb-4 opacity-50">📊</div>
                    <h3 className="text-xl font-mono text-gray-500 mb-2">Henüz Rapor Eklenmedi</h3>
                    <p className="text-sm font-mono text-gray-600 max-w-md">
                        Looker Studio üzerinden aldığınız Embed URL'sini yukarıdaki alana yapıştırarak tüm Google Analytics verilerinizi bu panel üzerinden canlı olarak takip edebilirsiniz.
                    </p>
                </div>
            )}
        </div>
    );
}
