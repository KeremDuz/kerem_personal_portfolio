"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

export default function AdminLoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await authAPI.login(username, password);
            router.push("/admin/dashboard");
        } catch (err: any) {
            setError(err.message || "Giriş başarısız.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 cyber-grid-bg">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-green/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="glass-card p-8 w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyber-green/10 border border-cyber-green/20 mb-4">
                        <svg
                            className="w-8 h-8 text-cyber-green"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <h1 className="font-mono text-2xl font-bold text-gradient-cyber">
                        Admin Panel
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 font-mono">
                        Yetkili erişim gereklidir
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                            Kullanıcı Adı
                        </label>
                        <input
                            id="admin-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-dark-bg/50 border border-gray-700 rounded-lg font-mono text-sm text-gray-200 placeholder-gray-600 focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/20 focus:outline-none transition-all"
                            placeholder="admin"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                            Şifre
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-dark-bg/50 border border-gray-700 rounded-lg font-mono text-sm text-gray-200 placeholder-gray-600 focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/20 focus:outline-none transition-all"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 text-sm font-mono">{error}</p>
                        </div>
                    )}

                    <button
                        id="admin-login-btn"
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-cyber-green/10 border border-cyber-green/30 rounded-lg font-mono text-sm text-cyber-green hover:bg-cyber-green/20 hover:border-cyber-green/50 focus:outline-none focus:ring-2 focus:ring-cyber-green/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Giriş yapılıyor...
                            </span>
                        ) : (
                            "Giriş Yap →"
                        )}
                    </button>
                </form>

                {/* Terminal-style footer */}
                <div className="mt-6 pt-4 border-t border-gray-800">
                    <p className="text-gray-600 text-xs font-mono text-center">
                        <span className="text-cyber-green/50">$</span> ssh admin@antigravity
                    </p>
                </div>
            </div>
        </div>
    );
}
