"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
    role: "assistant" | "user";
    content: string;
};

const INITIAL_MESSAGE = "Merhaba, ben Kerem'in dijital asistanıyım. Kerem Düz hakkında veya güncel CVE/zafiyet konularında soru sorabilirsin.";

export default function AgentAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [aiMode, setAiMode] = useState<"langgraph" | "crewai">("langgraph");
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: INITIAL_MESSAGE },
    ]);

    const apiBaseUrl = useMemo(() => {
        return process.env.NEXT_PUBLIC_AGENT_API_URL ?? "http://localhost:8010";
    }, []);

    const endpoint = aiMode === "langgraph" ? "/ask-langgraph" : "/ask";

    const askAssistant = async () => {
        const trimmed = question.trim();
        if (!trimmed || isLoading) return;

        setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
        setQuestion("");
        setIsLoading(true);

        try {
            const response = await fetch(`${apiBaseUrl}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: trimmed }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `API Error: ${response.status}`);
            }

            const data = (await response.json()) as { result?: string };
            const assistantText = data.result?.trim() || "Üzgünüm, şu an cevap üretemedim.";

            setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        `Şu an backend'e bağlanamadım. API adresi: ${apiBaseUrl}. Lütfen servisin çalıştığını ve URL'nin doğru olduğunu kontrol et.`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[3000]">
            {isOpen ? (
                <div className="w-[min(92vw,380px)] h-[560px] max-h-[78vh] rounded-2xl border border-cyber-green/20 bg-dark-surface/95 backdrop-blur-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-green/15 bg-black/40">
                        <div>
                            <p className="font-mono text-cyber-green text-sm">Kerem AI Assistant</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <button
                                    onClick={() => setAiMode("langgraph")}
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                                        aiMode === "langgraph"
                                            ? "bg-cyber-green/20 text-cyber-green border border-cyber-green/40"
                                            : "text-gray-500 hover:text-gray-300"
                                    }`}
                                >
                                    LangGraph
                                </button>
                                <button
                                    onClick={() => setAiMode("crewai")}
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                                        aiMode === "crewai"
                                            ? "bg-cyber-green/20 text-cyber-green border border-cyber-green/40"
                                            : "text-gray-500 hover:text-gray-300"
                                    }`}
                                >
                                    CrewAI
                                </button>
                            </div>
                        </div>
                        <button
                            aria-label="Chat penceresini kapat"
                            onClick={() => setIsOpen(false)}
                            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/10"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-black/20">
                        {messages.map((message, index) => (
                            <div
                                key={`${message.role}-${index}`}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                                        message.role === "user"
                                            ? "bg-cyber-green text-black"
                                            : "bg-white/10 text-gray-100 border border-white/15"
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-white/10 text-gray-200 border border-white/15">
                                    Ajanlar düşünüyor...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-cyber-green/15 bg-black/35">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        askAssistant();
                                    }
                                }}
                                placeholder="Soru sor..."
                                className="flex-1 rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyber-green/50"
                            />
                            <button
                                onClick={askAssistant}
                                disabled={isLoading}
                                className="w-10 h-10 rounded-xl bg-cyber-green text-black flex items-center justify-center disabled:opacity-50"
                                aria-label="Mesaj gönder"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-cyber-green text-black flex items-center justify-center shadow-xl shadow-cyber-green/30 animate-pulse-neon"
                    aria-label="Dijital asistana aç"
                >
                    <MessageCircle size={24} />
                </button>
            )}
        </div>
    );
}
