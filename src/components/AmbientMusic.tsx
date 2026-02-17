"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Music } from "lucide-react";

export default function AmbientMusic() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3);
    const [showControls, setShowControls] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // Create ambient synth pad instead of loading external audio
    const startAmbient = () => {
        if (audioContextRef.current) return;

        const ctx = new AudioContext();
        audioContextRef.current = ctx;

        const gainNode = ctx.createGain();
        gainNode.gain.value = volume * 0.08; // Keep it very subtle
        gainNode.connect(ctx.destination);
        gainNodeRef.current = gainNode;

        // Create layered ambient drones
        const frequencies = [110, 164.81, 220, 329.63]; // A2, E3, A3, E4
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = freq;

            const oscGain = ctx.createGain();
            oscGain.gain.value = 0.03 / (i + 1);

            // Subtle LFO for movement
            const lfo = ctx.createOscillator();
            lfo.frequency.value = 0.05 + i * 0.02;
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 2;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();

            osc.connect(oscGain);
            oscGain.connect(gainNode);
            osc.start();
        });

        setIsPlaying(true);
    };

    const stopAmbient = () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsPlaying(false);
    };

    const togglePlay = () => {
        if (isPlaying) {
            stopAmbient();
        } else {
            startAmbient();
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = newVolume * 0.08;
        }
    };

    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return (
        <div
            className="fixed bottom-6 right-6 z-50"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-16 right-0 glass-card p-3 w-44"
                    >
                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                            Ambient Sound
                        </p>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyber-green"
                        />
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-gray-600 font-mono">
                                {Math.round(volume * 100)}%
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono">
                                {isPlaying ? "▶ Çalıyor" : "⏸ Durduruldu"}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${isPlaying
                        ? "bg-cyber-green/10 border-cyber-green/30 text-cyber-green shadow-[0_0_15px_rgba(0,255,65,0.2)]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
            >
                {isPlaying ? (
                    <Volume2 size={18} className="animate-pulse" />
                ) : (
                    <Music size={18} />
                )}
            </motion.button>
        </div>
    );
}
